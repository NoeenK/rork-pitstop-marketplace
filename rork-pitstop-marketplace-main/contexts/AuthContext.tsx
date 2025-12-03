import createContextHook from "@nkzw/create-context-hook";
import { useState, useCallback, useMemo, useEffect } from "react";
import { User } from "@/types";
import { supabaseClient } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Email verification removed - accounts created directly without confirmation

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
  const [pendingOAuthUser, setPendingOAuthUser] = useState<{ fullName?: string | null } | null>(null);

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
          } else {
            // Profile doesn't exist, create a basic one
            const email = session.user.email || "";
            const displayName = session.user.user_metadata?.full_name || 
                              session.user.user_metadata?.name || 
                              email.split("@")[0] || 
                              "User";
            
            supabaseClient
              .from("profiles")
              .upsert({
                id: session.user.id,
                email: email,
                display_name: displayName,
                full_name: displayName,
              }, {
                onConflict: 'id'
              })
              .then(() => {
                console.log("[AuthContext] Created basic profile for user");
                // Fetch the newly created profile
                return fetchProfileById(session.user.id);
              })
              .then((newProfileUser) => {
                if (newProfileUser) {
                  setUser(newProfileUser);
                }
              })
              .catch((err) => {
                console.error("[AuthContext] Failed to create profile", err);
                // Keep using basic user if profile creation fails
              });
          }
        }).catch((err) => {
          console.error("[AuthContext] Background profile fetch failed", err);
          // Keep using basic user if profile fetch fails
        });
      }

        if (session?.user?.user_metadata?.full_name) {
          setPendingOAuthUser({
            fullName: session.user.user_metadata.full_name,
          });
        } else {
          setPendingOAuthUser(null);
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
        if (session.user.user_metadata?.full_name) {
          setPendingOAuthUser({
            fullName: session.user.user_metadata.full_name,
          });
        } else {
          setPendingOAuthUser(null);
        }

        // Fetch profile in background (non-blocking)
        fetchProfileById(session.user.id).then((profileUser) => {
          if (profileUser) {
            setUser(profileUser);
          } else {
            // Profile doesn't exist, create a basic one
            const email = session.user.email || "";
            const displayName = session.user.user_metadata?.full_name || 
                              session.user.user_metadata?.name || 
                              email.split("@")[0] || 
                              "User";
            
            supabaseClient
              .from("profiles")
              .upsert({
                id: session.user.id,
                email: email,
                display_name: displayName,
                full_name: displayName,
              }, {
                onConflict: 'id'
              })
              .then(() => {
                console.log("[AuthContext] Created basic profile for user");
                // Fetch the newly created profile
                return fetchProfileById(session.user.id);
              })
              .then((newProfileUser) => {
                if (newProfileUser) {
                  setUser(newProfileUser);
                }
              })
              .catch((err) => {
                console.error("[AuthContext] Failed to create profile", err);
                // Keep using basic user if profile creation fails
              });
          }
        }).catch((err) => {
          console.error("[AuthContext] Background profile fetch failed", err);
          // Keep using basic user if profile fetch fails
        });
      }

      if (event === "SIGNED_OUT") {
        setUser(null);
        setPendingOAuthUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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

  const resetPassword = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      console.log("[AuthContext] Resetting password for", email);

      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: undefined, // We'll handle this manually
      });

      if (error) {
        console.error("[AuthContext] Password reset failed", error);
        throw error;
      }

      console.log("[AuthContext] Password reset email sent successfully");
    } catch (error) {
      console.error("[AuthContext] Password reset exception", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      setIsLoading(true);
      console.log("[AuthContext] Updating password");

      const { error } = await supabaseClient.auth.updateUser({
        password: newPassword,
          });

          if (error) {
        console.error("[AuthContext] Password update failed", error);
            throw error;
          }

      console.log("[AuthContext] Password updated successfully");
    } catch (error) {
      console.error("[AuthContext] Password update exception", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (data: SignUpData) => {
    try {
      setIsLoading(true);
      console.log("[AuthContext] Signing up", data.email);

      // Create account directly without email verification
      // Email confirmation should be disabled in Supabase settings
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
          .upsert({
            id: authData.user.id,
            email: data.email,
            full_name: data.fullName,
            display_name: data.fullName,
            username: data.username,
            phone_number: data.phoneNumber,
            team_number: data.teamNumber,
            school_name: data.teamName,
          }, {
            onConflict: 'id'
          })
          .then(() => {
            console.log("[AuthContext] Profile updated successfully");
          })
          .catch((err) => {
            console.error("[AuthContext] Profile update failed", err);
          });
      }

      setPendingSignUp(data);
      console.log("[AuthContext] Sign up successful");
      setPendingOAuthUser({
        fullName: data.fullName,
      });
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
          avatar_url: updates.avatarUrl, // Allow avatar updates
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


  return useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    hasCompletedOnboarding,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    completeOnboarding,
    updateProfile,
    pendingOAuthUser,
  }), [
    user,
    isLoading,
    hasCompletedOnboarding,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    completeOnboarding,
    updateProfile,
    pendingOAuthUser,
  ]);
});
