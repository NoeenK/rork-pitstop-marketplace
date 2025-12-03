import { StyleSheet, View } from "react-native";
import { ReactNode } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface ScreenWrapperProps {
  children: ReactNode;
  style?: object;
}

export default function ScreenWrapper({ children, style }: ScreenWrapperProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
