import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Keyboard } from "react-native";
import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Search, X, Clock, TrendingUp, ChevronRight } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { LISTING_CATEGORIES } from "@/constants/listingOptions";
import { useListings } from "@/contexts/ListingsContext";
import { useSearchAlerts } from "@/contexts/SearchAlertsContext";

export default function SearchScreen() {
  const router = useRouter();
  const { allListings } = useListings();
  const { alerts } = useSearchAlerts();
  const [searchText, setSearchText] = useState<string>("");
  const recentSearches = useMemo(() => {
    if (!alerts.length) {
      return [];
    }
    const sorted = [...alerts].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    const unique: string[] = [];
    sorted.forEach((alert) => {
      if (!unique.includes(alert.query)) {
        unique.push(alert.query);
      }
    });
    return unique.slice(0, 5);
  }, [alerts]);

  const trendingSearches = useMemo(() => {
    if (!alerts.length) {
      return LISTING_CATEGORIES.slice(0, 5);
    }
    const counts = alerts.reduce<Record<string, number>>((acc, alert) => {
      acc[alert.query] = (acc[alert.query] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([query]) => query)
      .slice(0, 5);
  }, [alerts]);

  const browseCategories = useMemo(() => {
    const unique = Array.from(new Set(allListings.map((listing) => listing.category)));
    return unique.length ? unique : LISTING_CATEGORIES;
  }, [allListings]);

  const handleSearch = () => {
    if (searchText.trim()) {
      Keyboard.dismiss();
      router.back();
    }
  };

  const handleSearchSelect = (text: string) => {
    setSearchText(text);
    handleSearch();
  };

  const handleCategorySelect = (category: string) => {
    setSearchText(category);
    handleSearch();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Search size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.input}
          placeholder="Search for parts..."
          placeholderTextColor={Colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
          autoFocus
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <X size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={18} color={Colors.textSecondary} />
            <Text style={styles.sectionTitle}>Recent Searches</Text>
          </View>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.searchItem}
              onPress={() => handleSearchSelect(search)}
            >
              <Text style={styles.searchText}>{search}</Text>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={18} color={Colors.accent} />
            <Text style={styles.sectionTitle}>Trending</Text>
          </View>
          <View style={styles.chipContainer}>
            {trendingSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                style={styles.chip}
                onPress={() => handleSearchSelect(search)}
              >
                <Text style={styles.chipText}>{search}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          {browseCategories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={styles.categoryItem}
              onPress={() => handleCategorySelect(category)}
            >
              <Text style={styles.categoryText}>{category}</Text>
              <ChevronRight size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  searchItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  searchText: {
    fontSize: 16,
    color: Colors.text,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  categoryText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.text,
  },
});
