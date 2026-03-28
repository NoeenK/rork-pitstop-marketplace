import { useEffect, useMemo, useState, useCallback } from "react";
import { ActivityIndicator, StyleSheet, Text, View, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/constants/colors";

export default function GoogleCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const authContext = useAuth();
  const [error, setError] = useState<string | null>(null);

  const searchString = useMemo(() => {
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

    return searchParams.toString();
  }, [params]);

  const handleRetry = useCallback(() => {
    router.replace("/onboarding/login");
  }, [router]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const finalize = async () => {
      try {
        // Build the callback URL - use actual URL for web, deep link for mobile
        let callbackUrl: string;
        if (Platform.OS === "web") {
          // For web, use the actual browser URL
          callbackUrl = window.location.href;
          console.log("[GoogleCallbackScreen] Web callback URL:", callbackUrl);
        } else {
          // For mobile, use deep link with all params
          callbackUrl = `pitstop://auth/google-callback?${searchString}`;
          console.log("[GoogleCallbackScreen] Mobile callback URL:", callbackUrl);
        }
        
        console.log("[GoogleCallbackScreen] Processing callback URL");
        const { supabaseClient } = require("@/lib/supabase");
        await supabaseClient.auth.setSession({
          access_token: params.access_token as string,
          refresh_token: params.refresh_token as string,
        });
        
        if (!isMounted) {
          return;
        }

        // Navigate immediately after session is created
        console.log("[GoogleCallbackScreen] Sign in complete, redirecting...");
        router.replace("/(tabs)/(home)");
      } catch (err: any) {
        console.error("[GoogleCallbackScreen] Error:", err);
        if (!isMounted) {
          return;
        }
        setError(err?.message ?? "Unable to complete Google sign in.");
      }
    };

    // Add timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (isMounted && !error) {
        console.warn("[GoogleCallbackScreen] Timeout reached");
        setError("Sign in is taking longer than expected. Please try again.");
      }
    }, 10000) as any; // 10 second timeout

    finalize();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [router, searchString, error]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container} testID="googleCallbackContainer">
        <ActivityIndicator size="large" color={Colors.primary} testID="googleCallbackLoader" />
        <Text style={styles.statusText} testID="googleCallbackStatus">
          {error ? "Google sign in failed" : "Signing you in with Google..."}
        </Text>
        {error ? (
          <>
            <Text style={styles.errorText} testID="googleCallbackError">
              {error}
            </Text>
            <TouchableOpacity
              onPress={handleRetry}
              style={styles.retryButton}
              activeOpacity={0.8}
              testID="googleCallbackRetryButton"
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
