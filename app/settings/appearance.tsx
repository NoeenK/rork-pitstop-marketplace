import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

export default function AppearanceScreen() {
  const { colors } = useTheme();



  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: "App Theme",
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.messageContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.messageTitle, { color: colors.text }]}>
            Light Theme Only
          </Text>
          <Text style={[styles.messageText, { color: colors.textSecondary }]}>
            The app is currently set to light theme only. Theme switching is not available.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  messageContainer: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 8,
    textAlign: "center",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
});
