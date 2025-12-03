import { View, Text, StyleSheet } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  testID?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  testID,
}: EmptyStateProps) {
  const { colors } = useTheme();
  
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.iconContainer}>
        <Icon size={48} color={colors.textSecondary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 20,
    opacity: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: "700" as const,
    marginBottom: 8,
    textAlign: "center" as const,
  },
  description: {
    fontSize: 15,
    textAlign: "center" as const,
    lineHeight: 22,
  },
});
