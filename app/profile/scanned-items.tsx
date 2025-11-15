import { View, Text, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { ScanLine } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useMemo } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";

export default function ScannedItemsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: "Scanned items",
          headerShown: false,
        }}
      />

      <View style={styles.emptyState}>
        <ScanLine size={64} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>No scanned items</Text>
        <Text style={styles.emptyText}>Items you scan will appear here</Text>
      </View>
    </ScreenWrapper>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
