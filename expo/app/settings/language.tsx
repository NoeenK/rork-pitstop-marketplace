import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import { Check } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LANGUAGE_KEY = "@pitstop_language";

type Language = {
  code: string;
  name: string;
  nativeName: string;
};

const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
];

export default function LanguageScreen() {
  const { colors } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");

  const handleSelectLanguage = async (code: string) => {
    setSelectedLanguage(code);
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, code);
      console.log(`Language set to ${code}`);
    } catch (error) {
      console.log("Error saving language:", error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: "Language",
          headerShown: true,
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.scroll}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Language</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Choose your preferred language for PITSTOP
          </Text>

          <View style={[styles.languageGroup, { backgroundColor: colors.card }]}>
            {languages.map((language, index) => {
              const isSelected = selectedLanguage === language.code;

              return (
                <View key={language.code}>
                  {index > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                  <TouchableOpacity
                    style={styles.languageItem}
                    onPress={() => handleSelectLanguage(language.code)}
                  >
                    <View style={styles.languageInfo}>
                      <Text style={[styles.languageName, { color: colors.text }]}>
                        {language.name}
                      </Text>
                      <Text style={[styles.nativeName, { color: colors.textSecondary }]}>
                        {language.nativeName}
                      </Text>
                    </View>
                    {isSelected && (
                      <Check size={20} color={colors.accent} strokeWidth={3} />
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Language changes will take effect after restarting the app. Not all content may be
            translated yet.
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 16,
  },
  languageGroup: {
    borderRadius: 12,
    overflow: "hidden",
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  languageInfo: {
    flex: 1,
    gap: 4,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  nativeName: {
    fontSize: 14,
  },
  divider: {
    height: 0.5,
    marginLeft: 16,
  },
  footer: {
    padding: 20,
    paddingTop: 0,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
