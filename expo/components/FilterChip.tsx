import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
  testID?: string;
}

export default function FilterChip({
  label,
  selected,
  onPress,
  style,
  testID,
}: FilterChipProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        { backgroundColor: colors.card, borderColor: colors.border },
        selected && { backgroundColor: colors.accent, borderColor: colors.accent },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}
    >
      <Text style={[
        styles.text,
        { color: colors.text },
        selected && { color: "#FFFFFF" },
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
});
