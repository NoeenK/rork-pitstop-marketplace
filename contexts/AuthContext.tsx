import createContextHook from "@nkzw/create-context-hook";
import { useState, useCallback, useMemo, useEffect } from "react";
import { Platform } from "react-native";
import { User } from "@/types";
import { supabaseClient } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateVerificationCode, sendVerificationEmail, sendVerificationCode } from "@/lib/verification";
// Removed session token imports - using Supabase sessions directly
import * as AppleAuthentication from "expo-apple-authentication";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  username: string;
  phoneNumber: string;
  teamNumber: number;
  teamName: string;
}

interface SessionUserPayload {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string | null;
}

// Removed custom API dependency - using Supabase OAuth directly

const mapProfileToUser = (profile: any): User => ({
  id: profile.id,
  email: profile.email,
  displayName: profile.display_name || profile.full_name || "User",
  username: profile.username || undefined,
  phoneNumber: profile.phone_number || undefined,
  teamNumber: profile.team_number ?? null,
  schoolName: profile.school_name || "",
  city: profile.city || "",
  country: profile.country || "",
  isVerified: profile.is_verified || false,
  avatarUrl: profile.avatar_url || undefined,
  createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
  tradesCompleted: profile.trades_completed || 0,
  rating: profile.rating || 0,
  reviewCount: profile.review_count || 0,
  responseRate: profile.response_rate || 0,
  avgResponseTime: profile.avg_response_time || "0 min",
  blockedUsers: profile.blocked_users || [],
});

const buildUserFromSession = (sessionUser: SessionUserPayload): User => ({
  id: sessionUser.id,
  email: sessionUser.email,
  displayName: sessionUser.displayName ?? sessionUser.email,
  username: undefined,
  phoneNumber: undefined,
  teamNumber: null,
  schoolName: "",
  city: "",
  country: "",
  isVerified: false,
  avatarUrl: sessionUser.avatarUrl ?? undefined,
  createdAt: new Date(),
  tradesCompleted: 0,
  rating: 0,
  reviewCount: 0,
  responseRate: 0,
  avgResponseTime: "0 min",
  blockedUsers: [],
});

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [, setPendingSignUp] = useState<SignUpData | null>(null);
  const [pendingOAuthEmail, setPendingOAuthEmail] = useState<string | null>(null);
  const [pendingOAuthUser, setPendingOAuthUser] = useState<{
    email: string;
    fullName?: string;
    needsProfileSetup: boolean;
    userId: string;
  } | null>(null);

  const fetchProfileById = useCallback(async (profileId: string) => {
    try {
      const { data, error } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (error) {
        console.error("[AuthContext] Failed to fetch profile", error);
        return null;
      }

      if (!data) {
        return null;
      }

      return mapProfileToUser(data);
    } catch (error) {
      console.error("[AuthContext] Unexpected error loading profile", error);
      return null;
    }
  }, []);

  // Removed fetchSessionUser - using Supabase sessions directly

  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        console.log("[AuthContext] Loading persisted state...");

        const { data: { session } } = await supabaseClient.auth.getSession();

        if (session?.user) {
          console.log("[AuthContext] Found Supabase session", session.user.id);
          // Set user immediately from session
          const basicUser = buildUserFromSession({
            id: session.user.id,
            email: session.user.email || "",
            displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
            avatarUrl: session.user.user_metadata?.avatar_url || null,
          });
          setUser(basicUser);

          // Fetch profile in background (non-blocking)
          fetchProfileById(session.user.id).then((profileUser) => {
            if (profileUser) {
              setUser(profileUser);
            }
          }).catch((err) => {
            console.error("[AuthContext] Background profile fetch failed", err);
            // Keep using basic user if profile fetch fails
          });
        }

        const storedOnboarding = await AsyncStorage.getItem("onboarding_completed");
        if (storedOnboarding) {
          setHasCompletedOnboarding(true);
        }
      } catch (error) {
        console.error("[AuthContext] Failed to load persisted state", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersistedState();

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log("[AuthContext] Auth state changed", event, session?.user?.id);

      if (event === "SIGNED_IN" && session?.user) {
        // Set user immediately from session
        const basicUser = buildUserFromSession({
          id: session.user.id,
          email: session.user.email || "",
          displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
          avatarUrl: session.user.user_metadata?.avatar_url || null,
        });
        setUser(basicUser);

        // Fetch profile in background (non-blocking)
        fetchProfileById(session.user.id).then((profileUser) => {
          if (profileUser) {
            setUser(profileUser);
          }
        }).catch((err) => {
          console.error("[AuthContext] Background profile fetch failed", err);
          // Keep using basic user if profile fetch fails
        });
      }

      if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfileById]);

  const completeGoogleSignIn = useCallback(async (url: string) => {
    try {
      // Extract the code from the callback URL
      // Handle both full URLs and URL fragments
      let code: string | null = null;
      
      try {
        const urlObj = new URL(url);
        code = urlObj.searchParams.get("code") || urlObj.hash.match(/code=([^&]+)/)?.[1] || null;
      } catch {
        // If URL parsing fails, try to extract from the string directly
        const codeMatch = url.match(/[?&#]code=([^&]+)/);
        if (codeMatch) {
          code = decodeURIComponent(codeMatch[1]);
        }
      }
      
      if (!code) {
        throw new Error("Missing authorization code from Google OAuth callback.");
      }

      // Exchange the code for a session
      const { data, error } = await supabaseClient.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("[AuthContext] Failed to exchange code for session", error);
        throw error;
      }

      if (!data.session || !data.user) {
        throw new Error("Failed to create session from Google OAuth.");
      }

      // Set user immediately from session (don't wait for profile)
      const basicUser = buildUserFromSession({
        id: data.user.id,
        email: data.user.email || "",
        displayName: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split("@")[0] || "User",
        avatarUrl: data.user.user_metadata?.avatar_url || null,
      });
      setUser(basicUser);

      // Fetch profile in background (non-blocking)
      fetchProfileById(data.user.id).then((profileUser) => {
        if (profileUser) {
          setUser(profileUser);
        }
      }).catch((err) => {
        console.error("[AuthContext] Background profile fetch failed", err);
        // Keep using basic user if profile fetch fails
      });

      const needsProfileSetup = true; // Will be updated when profile loads

      setPendingOAuthEmail(data.user.email || null);
      setPendingOAuthUser({
        email: basicUser.email,
        fullName: basicUser.displayName,
        needsProfileSetup,
        userId: basicUser.id,
      });

      return basicUser;
    } catch (error) {
      console.error("[AuthContext] Google sign in completion failed", error);
      throw error;
    }
  }, [fetchProfileById]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("[AuthContext] Signing in with email", email);

      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[AuthContext] Email sign in failed", error);
        throw error;
      }

      console.log("[AuthContext] Email sign in successful");
    } catch (error) {
      console.error("[AuthContext] Email sign in exception", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("[AuthContext] Starting Google OAuth flow with Supabase");

      // Use Supabase's redirect URL format
      // For mobile: use the deep link callback
      // For web: use Supabase's callback URL
      const redirectUri = Platform.OS === "web" 
        ? `${window.location.origin}/auth/callback`
        : makeRedirectUri({
            scheme: "pitstop",
            path: "auth/google-callback",
          });

      console.log("[AuthContext] Redirect URI:", redirectUri);

      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: Platform.OS === "web",
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        console.error("[AuthContext] Google OAuth initiation failed", error);
        throw error;
      }

      if (Platform.OS === "web" && data.url) {
        // For web, redirect directly
        window.location.href = data.url;
        return null;
      }

      if (data.url && Platform.OS !== "web") {
        // For mobile, open auth session
        console.log("[AuthContext] Opening auth session with URL:", data.url);
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri,
          {
            showInRecents: true,
          }
        );
        console.log("[AuthContext] Google OAuth session result:", result);

        if (result.type === "success" && result.url) {
          console.log("[AuthContext] Success - completing sign in with URL:", result.url);
          return await completeGoogleSignIn(result.url);
        }

        if (result.type === "cancel") {
          console.log("[AuthContext] Google OAuth cancelled by user");
          const cancelError = new Error("cancelled");
          throw cancelError;
        }

        if (result.type === "dismiss") {
          console.log("[AuthContext] Google OAuth dismissed by user");
          const dismissError = new Error("cancelled");
          throw dismissError;
        }

        console.error("[AuthContext] Unexpected result type:", result.type);
        throw new Error("Authentication failed or was cancelled");
      }

      throw new Error("No OAuth URL received from Supabase");
    } catch (error: any) {
      console.error("[AuthContext] Google OAuth failed", error);
      
      // Don't throw if user cancelled
      if (error?.message?.includes('cancelled')) {
        return null;
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [completeGoogleSignIn]);

  const signInWithApple = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("[AuthContext] Starting Apple sign in");

      if (Platform.OS === "ios") {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });

        if (credential.identityToken) {
          const { data, error } = await supabaseClient.auth.signInWithIdToken({
            provider: "apple",
            token: credential.identityToken,
            nonce: credential.nonce || undefined,
          });

          if (error) {
            console.error("[AuthContext] Apple sign in failed", error);
            throw error;
          }

          // Set user immediately from session (don't wait for profile)
          if (data.user) {
            const basicUser = buildUserFromSession({
              id: data.user.id,
              email: data.user.email || credential.email || "",
              displayName: credential.fullName?.givenName && credential.fullName?.familyName
                ? `${credential.fullName.givenName} ${credential.fullName.familyName}`
                : credential.email?.split("@")[0] || "User",
              avatarUrl: null,
            });
            setUser(basicUser);

            // Fetch profile in background (non-blocking)
            fetchProfileById(data.user.id).then((profileUser) => {
              if (profileUser) {
                setUser(profileUser);
              }
            }).catch((err) => {
              console.error("[AuthContext] Background profile fetch failed", err);
              // Keep using basic user if profile fetch fails
            });
          }
        }
      } else {
        // Use Supabase's redirect URL format
        const redirectUrl = Platform.OS === "web"
          ? `${window.location.origin}/auth/callback`
          : makeRedirectUri({
              scheme: "pitstop",
              path: "auth/callback",
            });

        const { data, error } = await supabaseClient.auth.signInWithOAuth({
          provider: "apple",
          options: {
            redirectTo: redirectUrl,
            skipBrowserRedirect: Platform.OS === "web",
          },
        });

        if (error) {
          console.error("[AuthContext] Apple OAuth failed", error);
          throw error;
        }

        if (Platform.OS === "web" && data.url) {
          // For web, redirect directly
          window.location.href = data.url;
          return null;
        }

        if (data.url && Platform.OS !== "web") {
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
          if (result.type === "success" && result.url) {
            const exchange = await supabaseClient.auth.exchangeCodeForSession(result.url);
            if (exchange.error) {
              console.error("[AuthContext] Apple session exchange failed", exchange.error);
              throw exchange.error;
            }

            // Set user immediately from session (don't wait for profile)
            if (exchange.data.user) {
              const basicUser = buildUserFromSession({
                id: exchange.data.user.id,
                email: exchange.data.user.email || "",
                displayName: exchange.data.user.user_metadata?.full_name || exchange.data.user.user_metadata?.name || exchange.data.user.email?.split("@")[0] || "User",
                avatarUrl: exchange.data.user.user_metadata?.avatar_url || null,
              });
              setUser(basicUser);

              // Fetch profile in background (non-blocking)
              fetchProfileById(exchange.data.user.id).then((profileUser) => {
                if (profileUser) {
                  setUser(profileUser);
                }
              }).catch((err) => {
                console.error("[AuthContext] Background profile fetch failed", err);
                // Keep using basic user if profile fetch fails
              });
            }
          }
        }
      }

      console.log("[AuthContext] Apple sign in completed");
    } catch (error: any) {
      if (error?.code !== "ERR_REQUEST_CANCELED") {
        console.error("[AuthContext] Apple sign in exception", error);
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfileById]);

  const signInWithFacebook = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("[AuthContext] Starting Facebook sign in");

      const redirectUrl = makeRedirectUri({
        scheme: "pitstop",
        path: "auth/callback",
      });

      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: Platform.OS === "web",
        },
      });

      if (error) {
        console.error("[AuthContext] Facebook OAuth failed", error);
        throw error;
      }

      if (data.url && Platform.OS !== "web") {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        if (result.type === "success" && result.url) {
          const url = new URL(result.url);
          const params = new URLSearchParams(url.hash.substring(1));
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

          if (accessToken && refreshToken) {
            await supabaseClient.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
        }
      }

      console.log("[AuthContext] Facebook sign in completed");
      return data;
    } catch (error) {
      console.error("[AuthContext] Facebook sign in exception", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (data: SignUpData) => {
    try {
      setIsLoading(true);
      console.log("[AuthContext] Signing up", data.email);

      const code = await generateVerificationCode(data.email);
      await sendVerificationEmail(data.email, code);

      const { data: authData, error: signUpError } = await supabaseClient.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: undefined,
          data: {
            full_name: data.fullName,
            display_name: data.fullName,
            username: data.username,
            phone_number: data.phoneNumber,
            team_number: data.teamNumber,
            team_name: data.teamName,
          },
        },
      });

      if (signUpError) {
        console.error("[AuthContext] Sign up failed", signUpError);
        throw signUpError;
      }

      if (authData.user) {
        // Update profile in background (non-blocking)
        supabaseClient
          .from("profiles")
          .update({
            full_name: data.fullName,
            display_name: data.fullName,
            username: data.username,
            phone_number: data.phoneNumber,
            team_number: data.teamNumber,
            school_name: data.teamName,
          })
          .eq("id", authData.user.id)
          .then(() => {
            console.log("[AuthContext] Profile updated successfully");
          })
          .catch((err) => {
            console.error("[AuthContext] Profile update failed", err);
          });
      }

      setPendingSignUp(data);
      console.log("[AuthContext] Sign up successful");
    } catch (error) {
      console.error("[AuthContext] Sign up exception", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("[AuthContext] Completing onboarding");
      setHasCompletedOnboarding(true);
      await AsyncStorage.setItem("onboarding_completed", "true");
    } catch (error) {
      console.error("[AuthContext] Complete onboarding failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("[AuthContext] Signing out");

      await supabaseClient.auth.signOut();

      setUser(null);
      setHasCompletedOnboarding(false);
      await AsyncStorage.removeItem("onboarding_completed");
    } catch (error) {
      console.error("[AuthContext] Sign out failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) {
      return;
    }

    try {
      setIsLoading(true);
      console.log("[AuthContext] Updating profile", updates);

      const { error } = await supabaseClient
        .from("profiles")
        .update({
          display_name: updates.displayName,
          username: updates.username,
          phone_number: updates.phoneNumber,
          team_number: updates.teamNumber,
          school_name: updates.schoolName,
          city: updates.city,
          country: updates.country,
        })
        .eq("id", user.id);

      if (error) {
        console.error("[AuthContext] Update profile failed", error);
        throw error;
      }

      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
    } catch (error) {
      console.error("[AuthContext] Update profile exception", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const sendOAuthVerificationCode = useCallback(async (email: string) => {
    try {
      console.log("[AuthContext] Sending OAuth verification code", email);
      setPendingOAuthEmail(email);
      await sendVerificationCode(email);
    } catch (error) {
      console.error("[AuthContext] OAuth verification code failed", error);
      throw error;
    }
  }, []);

  return useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    hasCompletedOnboarding,
    pendingOAuthEmail,
    pendingOAuthUser,
    signIn,
    signInWithGoogle,
    completeGoogleSignIn,
    signInWithApple,
    signInWithFacebook,
    signUp,
    completeOnboarding,
    signOut,
    updateProfile,
    sendOAuthVerificationCode,
  }), [
    user,
    isLoading,
    hasCompletedOnboarding,
    pendingOAuthEmail,
    pendingOAuthUser,
    signIn,
    signInWithGoogle,
    completeGoogleSignIn,
    signInWithApple,
    signInWithFacebook,
    signUp,
    completeOnboarding,
    signOut,
    updateProfile,
    sendOAuthVerificationCode,
  ]);
});
