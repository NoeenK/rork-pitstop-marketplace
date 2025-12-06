import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/contexts/AuthContext";
import { ListingsProvider } from "@/contexts/ListingsContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ActivityProvider } from "@/contexts/ActivityContext";
import { SavedListingsProvider } from "@/contexts/SavedListingsContext";
import { ReviewsProvider } from "@/contexts/ReviewsContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { RecentlyViewedProvider } from "@/contexts/RecentlyViewedContext";
import { SearchAlertsProvider } from "@/contexts/SearchAlertsContext";
import { FeedPreferencesProvider } from "@/contexts/FeedPreferencesContext";
import { RewardsProvider } from "@/contexts/RewardsContext";
import { InquiryProvider } from "@/contexts/InquiryContext";
// import { trpc, getTrpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { colors } = useTheme();
  
  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Back",
      headerStyle: { backgroundColor: colors.card },
      headerTintColor: colors.text,
      headerShadowVisible: false,
    }}>
      <Stack.Screen name="index" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="splash" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="onboarding/intro" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="onboarding/signup-email" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="onboarding/login" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="onboarding/verify-email" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="onboarding/welcome" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="onboarding/consent" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="welcome" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="auth/callback" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="auth/google-callback" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="listing/[id]" 
        options={{ 
          presentation: "card",
          headerShown: true,
          title: "Listing",
        }} 
      />
      <Stack.Screen 
        name="listing/new" 
        options={{ 
          presentation: "modal",
          headerShown: true,
          title: "New Listing",
        }} 
      />
      <Stack.Screen 
        name="chat/[id]" 
        options={{ 
          presentation: "card",
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="saved" 
        options={{ 
          presentation: "card",
          headerShown: true,
          title: "Saved",
        }} 
      />
      <Stack.Screen 
        name="user/[id]" 
        options={{ 
          presentation: "card",
          headerShown: true,
          title: "Profile",
        }} 
      />
      <Stack.Screen 
        name="reviews/[id]" 
        options={{ 
          presentation: "card",
          headerShown: true,
          title: "Reviews",
        }} 
      />

      <Stack.Screen 
        name="settings/notifications" 
        options={{ 
          presentation: "card",
          headerShown: true,
          title: "Notifications",
        }} 
      />
      <Stack.Screen 
        name="settings/privacy" 
        options={{ 
          presentation: "card",
          headerShown: true,
          title: "Privacy",
        }} 
      />

      <Stack.Screen 
        name="settings/appearance" 
        options={{ 
          presentation: "card",
          headerShown: true,
          title: "Appearance",
        }} 
      />
      <Stack.Screen 
        name="settings/language" 
        options={{ 
          presentation: "card",
          headerShown: true,
          title: "Language",
        }} 
      />
      <Stack.Screen 
        name="settings/help" 
        options={{ 
          presentation: "card",
          headerShown: true,
          title: "Help Center",
        }} 
      />

      <Stack.Screen 
        name="settings/forum" 
        options={{ 
          presentation: "card",
          headerShown: true,
          title: "Community Forum",
        }} 
      />


      <Stack.Screen 
        name="settings/verification" 
        options={{ 
          presentation: "card",
          headerShown: true,
          title: "Verification",
        }} 
      />
      <Stack.Screen 
        name="settings/balance" 
        options={{ 
          presentation: "card",
          headerShown: true,
          title: "My Balance",
        }} 
      />
      <Stack.Screen 
        name="search" 
        options={{ 
          presentation: "card",
          headerShown: true,
          title: "Search",
        }} 
      />
      <Stack.Screen 
        name="filters" 
        options={{ 
          presentation: "modal",
          headerShown: true,
          title: "Filters",
        }} 
      />
      <Stack.Screen 
        name="orders" 
        options={{ 
          presentation: "card",
          headerShown: true,
          title: "My Orders",
        }} 
      />
      <Stack.Screen 
        name="sales" 
        options={{ 
          presentation: "card",
          headerShown: true,
          title: "My Sales",
        }} 
      />

    </Stack>
  );
}

function ThemedAppContent() {
  return (
    <AuthProvider>
      <ReviewsProvider>
        <SavedListingsProvider>
          <RecentlyViewedProvider>
            <SearchAlertsProvider>
              <FeedPreferencesProvider>
                <RewardsProvider>
                  <InquiryProvider>
                    <LocationProvider>
                      <ListingsProvider>
                        <ChatProvider>
                          <ActivityProvider>
                            <GestureHandlerRootView>
                              <RootLayoutNav />
                            </GestureHandlerRootView>
                          </ActivityProvider>
                        </ChatProvider>
                      </ListingsProvider>
                    </LocationProvider>
                  </InquiryProvider>
                </RewardsProvider>
              </FeedPreferencesProvider>
            </SearchAlertsProvider>
          </RecentlyViewedProvider>
        </SavedListingsProvider>
      </ReviewsProvider>
    </AuthProvider>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ThemedAppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
