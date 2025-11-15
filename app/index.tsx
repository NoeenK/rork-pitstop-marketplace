import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase";

export default function IndexScreen() {
  const { isLoading, hasCompletedOnboarding, isAuthenticated } = useAuth();
  const { requestAllPermissions, hasRequestedPermissions } = useLocation();
  const [needsProfileSetup, setNeedsProfileSetup] = useState<boolean>(false);
  const [checkingProfile, setCheckingProfile] = useState<boolean>(true);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        console.log('[Index] Checking profile completion, session:', session?.user?.id);
        
        if (session?.user) {
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          console.log('[Index] Profile data:', profile);

          if (profile) {
            const isProfileComplete = profile.full_name && profile.team_number && profile.phone_number;
            console.log('[Index] Profile complete:', isProfileComplete);
            setNeedsProfileSetup(!isProfileComplete);
          } else {
            console.log('[Index] No profile found, needs setup');
            setNeedsProfileSetup(true);
          }
        }
      } catch (error) {
        console.error("[Index] Failed to check profile:", error);
      } finally {
        setCheckingProfile(false);
      }
    };

    if (!isLoading) {
      checkProfileCompletion();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isAuthenticated && !hasRequestedPermissions) {
      console.log("User is authenticated, requesting permissions...");
      requestAllPermissions();
    }
  }, [isAuthenticated, hasRequestedPermissions, requestAllPermissions]);

  if (isLoading || checkingProfile) {
    return null;
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/splash" />;
  }

  if (needsProfileSetup) {
    return <Redirect href="/onboarding/welcome" />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/(home)" />;
  }

  return <Redirect href="/onboarding/intro" />;
}
