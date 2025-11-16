import { useEffect, useState, useCallback } from "react";
import { ActivityIndicator, StyleSheet, Text, View, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/constants/colors";
import { supabaseClient } from "@/lib/supabase";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { completeGoogleSignIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  const handleRetry = useCallback(() => {
    router.replace("/onboarding/login");
  }, [router]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const finalize = async () => {
      try {
        setIsProcessing(true);
        
        // For web, Supabase might handle the callback automatically
        // But we'll also try to extract and process it manually
        if (Platform.OS === "web") {
          const currentUrl = window.location.href;
          console.log("[AuthCallbackScreen] Processing web callback:", currentUrl);
          
          // Check if there's a code in the URL
          const urlObj = new URL(currentUrl);
          const code = urlObj.searchParams.get("code");
          
          if (code) {
            // Use the completeGoogleSignIn function
            await completeGoogleSignIn(currentUrl);
          } else {
            // Supabase might have already handled it, check session
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (!session) {
              throw new Error("No session found after OAuth callback");
            }
          }
        } else {
          // For mobile, build callback URL from params
          const searchParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach((item) => {
                if (typeof item === "string") {
                  searchParams.append(key, item);
                }
              });
            } else if (typeof value === "string") {
              searchParams.set(key, value);
            }
          });
          const callbackUrl = `pitstop://auth/callback?${searchParams.toString()}`;
          await completeGoogleSignIn(callbackUrl);
        }
        
        if (!isMounted) {
          return;
        }

        // Navigate immediately after session is created
        router.replace("/(tabs)/(home)");
      } catch (err: any) {
        console.error("[AuthCallbackScreen]", err);
        if (!isMounted) {
          return;
        }
        setError(err?.message ?? "Unable to complete authentication.");
      } finally {
        if (isMounted) {
          setIsProcessing(false);
        }
      }
    };

    // Add timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (isMounted && !error) {
        setError("Authentication is taking longer than expected. Please try again.");
        setIsProcessing(false);
      }
    }, 15000); // 15 second timeout

    finalize();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [completeGoogleSignIn, router, params, error]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        {isProcessing ? (
          <>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.statusText}>
              {error ? "Authentication failed" : "Completing sign in..."}
            </Text>
          </>
        ) : null}
        {error ? (
          <>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={handleRetry}
              style={styles.retryButton}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Return to Login</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  statusText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1C1C1E",
    textAlign: "center" as const,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.error,
    textAlign: "center" as const,
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: "#FFFFFF",
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
});

