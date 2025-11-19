import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";
import { useEffect } from "react";

export default function IndexScreen() {
  const { isLoading, hasCompletedOnboarding, isAuthenticated } = useAuth();
  const { requestAllPermissions, hasRequestedPermissions } = useLocation();

  useEffect(() => {
    if (isAuthenticated && !hasRequestedPermissions) {
      console.log("[Index] User is authenticated, requesting permissions...");
      requestAllPermissions();
    }
  }, [isAuthenticated, hasRequestedPermissions, requestAllPermissions]);

  if (isLoading) {
    return null;
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/splash" />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/(home)" />;
  }

  return <Redirect href="/onboarding/intro" />;
}
