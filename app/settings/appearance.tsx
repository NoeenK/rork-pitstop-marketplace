import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { Stack } from "expo-router";
import { useTheme, Theme } from "@/contexts/ThemeContext";

const { width } = Dimensions.get("window");
const PREVIEW_WIDTH = (width - 80) / 3;
const PREVIEW_HEIGHT = PREVIEW_WIDTH * 2;

export default function AppearanceScreen() {
  const { theme, setTheme, colors } = useTheme();

  const themeOptions: { 
    value: Theme; 
    label: string;
  }[] = [
    {
      value: "light",
      label: "Light",
    },
    {
      value: "dark",
      label: "Dark",
    },
    {
      value: "system",
      label: "System",
    },
  ];

  const renderThemePreview = (themeValue: Theme) => {
    const isDark = themeValue === "dark";
    const isSystem = themeValue === "system";

    const previewBg = isDark ? "#0F0F0F" : (isSystem ? "#0F0F0F" : "#FFFFFF");
    const previewCard = isDark ? "#212121" : (isSystem ? "#212121" : "#F9F9F9");
    const previewText = isDark ? "#FFFFFF" : (isSystem ? "#FFFFFF" : "#0F0F0F");
    const previewTextSec = isDark ? "#AAAAAA" : (isSystem ? "#AAAAAA" : "#606060");

    return (
      <View style={[styles.previewContainer, { backgroundColor: previewBg }]}>
        <View style={[styles.previewHeader, { backgroundColor: isDark ? "#212121" : "#FF0000" }]}>
          <View style={styles.previewHeaderDot} />
        </View>
        
        <View style={styles.previewContent}>
          <View style={[styles.previewCard, { backgroundColor: previewCard }]}>
            <View style={[styles.previewLine, { backgroundColor: previewText, width: "60%" }]} />
            <View style={[styles.previewLine, { backgroundColor: previewTextSec, width: "40%", height: 3 }]} />
          </View>
          <View style={[styles.previewCard, { backgroundColor: previewCard }]}>
            <View style={[styles.previewLine, { backgroundColor: previewText, width: "50%" }]} />
            <View style={[styles.previewLine, { backgroundColor: previewTextSec, width: "30%", height: 3 }]} />
          </View>
          <View style={[styles.previewCard, { backgroundColor: previewCard }]}>
            <View style={[styles.previewLine, { backgroundColor: previewText, width: "70%" }]} />
            <View style={[styles.previewLine, { backgroundColor: previewTextSec, width: "45%", height: 3 }]} />
          </View>
          <View style={[styles.previewCard, { backgroundColor: previewCard }]}>
            <View style={[styles.previewLine, { backgroundColor: previewText, width: "55%" }]} />
            <View style={[styles.previewLine, { backgroundColor: previewTextSec, width: "35%", height: 3 }]} />
          </View>
          <View style={[styles.previewCard, { backgroundColor: previewCard }]}>
            <View style={[styles.previewLine, { backgroundColor: previewText, width: "65%" }]} />
            <View style={[styles.previewLine, { backgroundColor: previewTextSec, width: "40%", height: 3 }]} />
          </View>
        </View>

        {isSystem && (
          <View style={styles.systemOverlay}>
            <View style={[styles.systemDivider]} />
            <View style={[styles.systemHalf, { backgroundColor: "#FFFFFF" }]}>
              <View style={[styles.systemCard, { backgroundColor: "#F9F9F9" }]}>
                <View style={[styles.previewLine, { backgroundColor: "#000000", width: "50%" }]} />
                <View style={[styles.previewLine, { backgroundColor: "#8E8E93", width: "30%", height: 3 }]} />
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

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
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Choose a theme for your Pitstop app. Light, dark, or use the same theme you&apos;ve chosen in your device&apos;s system settings.
        </Text>

        <View style={styles.themesContainer}>
          {themeOptions.map((option) => {
            const isSelected = theme === option.value;
            
            return (
              <TouchableOpacity
                key={option.value}
                style={styles.themeOption}
                onPress={() => setTheme(option.value)}
                activeOpacity={0.7}
              >
                {renderThemePreview(option.value)}
                
                <Text style={[styles.themeLabel, { color: colors.text }]}>
                  {option.label}
                </Text>
                
                <View style={[
                  styles.radioOuter,
                  { 
                    borderColor: isSelected ? colors.accent : colors.border,
                    backgroundColor: colors.background,
                  }
                ]}>
                  {isSelected && (
                    <View style={[styles.radioInner, { backgroundColor: colors.accent }]} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
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
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  themesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  themeOption: {
    flex: 1,
    alignItems: "center",
  },
  previewContainer: {
    width: PREVIEW_WIDTH,
    height: PREVIEW_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    position: "relative",
  },
  previewHeader: {
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  previewHeaderDot: {
    width: 12,
    height: 3,
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
    opacity: 0.5,
  },
  previewContent: {
    flex: 1,
    padding: 8,
    gap: 6,
  },
  previewCard: {
    padding: 6,
    borderRadius: 6,
    gap: 4,
  },
  previewLine: {
    height: 4,
    borderRadius: 2,
  },
  systemOverlay: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    bottom: 0,
  },
  systemDivider: {
    position: "absolute",
    left: "50%",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "#FFFFFF",
    opacity: 0.3,
    transform: [{ translateX: -0.5 }],
  },
  systemHalf: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "50%",
    padding: 8,
    paddingTop: 4,
  },
  systemCard: {
    padding: 6,
    borderRadius: 6,
    gap: 4,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 8,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
