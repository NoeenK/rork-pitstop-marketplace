import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  testID?: string;
}

export default function SectionHeader({ title, onSeeAll, testID }: SectionHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container} testID={testID}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={onSeeAll}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronRight size={20} color={colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  seeAllButton: {
    padding: 4,
  },
});
