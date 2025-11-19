import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from "react-native";
import { useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface CategoryTabProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
}

function CategoryTab({ label, selected, onPress, testID }: CategoryTabProps) {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.tab,
          selected && styles.tabSelected,
          { backgroundColor: selected ? (isDark ? "#2A2A2A" : "#FFFFFF") : "transparent" }
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        testID={testID}
      >
        <Text
          style={[
            styles.tabText,
            {
              color: selected ? colors.text : colors.textSecondary,
              fontWeight: selected ? "700" : "500",
            }
          ]}
        >
          {label}
        </Text>
        {selected && (
          <View style={[styles.underline, { backgroundColor: "#E53935" }]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryTabs({ categories, selectedCategory, onCategoryChange }: CategoryTabsProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.fadeLeft} />
        {categories.map((category) => (
          <CategoryTab
            key={category}
            label={category}
            selected={selectedCategory === category}
            onPress={() => onCategoryChange(category)}
            testID={`category-tab-${category}`}
          />
        ))}
        <View style={styles.fadeRight} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
    paddingVertical: 4,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    position: "relative",
  },
  tabSelected: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
  },
  underline: {
    position: "absolute",
    bottom: 2,
    left: 12,
    right: 12,
    height: 2,
    borderRadius: 1,
  },
  fadeLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 20,
    zIndex: 1,
  },
  fadeRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 20,
    zIndex: 1,
  },
});
