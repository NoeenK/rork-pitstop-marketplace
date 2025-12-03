import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from "react-native";
import { Stack } from "expo-router";
import { Sliders, Save } from "lucide-react-native";
import { useFeedPreferences } from "@/contexts/FeedPreferencesContext";
import { useState, useEffect } from "react";

const CATEGORIES = [
  "Motors & Electronics",
  "Pneumatics",
  "Wheels & Drivetrains",
  "Structure & Hardware",
  "Vision & Sensors",
  "Tools",
  "Complete Robots",
  "Other",
];

const SORT_OPTIONS: Array<{ value: "recent" | "price-low" | "price-high" | "distance"; label: string }> = [
  { value: "recent", label: "Most Recent" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "distance", label: "Nearest First" },
];

export default function CustomizeFeedScreen() {
  const { preferences, updatePreferences } = useFeedPreferences();
  const [localCategories, setLocalCategories] = useState<string[]>(preferences.categories);
  const [showSwapOnly, setShowSwapOnly] = useState(preferences.showSwapOnly);
  const [sortBy, setSortBy] = useState(preferences.sortBy);

  useEffect(() => {
    setLocalCategories(preferences.categories);
    setShowSwapOnly(preferences.showSwapOnly);
    setSortBy(preferences.sortBy);
  }, [preferences]);

  const toggleCategory = (category: string) => {
    setLocalCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSave = () => {
    updatePreferences({
      categories: localCategories,
      showSwapOnly,
      sortBy,
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Customize feed",
          headerStyle: { backgroundColor: "#000000" },
          headerTintColor: "#FFFFFF",
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Save size={20} color="#FF6B35" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sliders size={24} color="#FF6B35" />
            <Text style={styles.sectionTitle}>Preferences</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceLabel}>Show Swap Only</Text>
                <Text style={styles.preferenceDescription}>Only show items available for swap</Text>
              </View>
              <Switch
                value={showSwapOnly}
                onValueChange={setShowSwapOnly}
                trackColor={{ false: "#2C2C2E", true: "#FF6B35" }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sort By</Text>
          <View style={styles.card}>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.sortOption}
                onPress={() => setSortBy(option.value)}
              >
                <Text style={[
                  styles.sortText,
                  sortBy === option.value && styles.sortTextActive
                ]}>
                  {option.label}
                </Text>
                {sortBy === option.value && (
                  <View style={styles.selectedDot} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <Text style={styles.sectionDescription}>
            Select categories to see in your feed
          </Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  localCategories.includes(category) && styles.categoryChipActive
                ]}
                onPress={() => toggleCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  localCategories.includes(category) && styles.categoryTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.saveFullButton} onPress={handleSave}>
          <Text style={styles.saveFullButtonText}>Save Preferences</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  saveButton: {
    padding: 8,
    marginRight: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 16,
  },
  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: "#666666",
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#2C2C2E",
  },
  sortText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  sortTextActive: {
    color: "#FF6B35",
    fontWeight: "600" as const,
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B35",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryChip: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  categoryChipActive: {
    backgroundColor: "#FF6B35",
    borderColor: "#FF6B35",
  },
  categoryText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  categoryTextActive: {
    fontWeight: "600" as const,
  },
  saveFullButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveFullButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
});
