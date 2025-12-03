import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
} from "react-native";
import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "expo-router";
import { Star, X } from "lucide-react-native";
import { LISTING_CONDITIONS } from "@/constants/listingOptions";
import { useTheme } from "@/contexts/ThemeContext";
import { useListings } from "@/contexts/ListingsContext";

const { width } = Dimensions.get("window");

export default function FiltersScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { allListings } = useListings();
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const prices = useMemo(() => {
    return allListings.map(l => (l.priceCents || 0) / 100).filter(p => p > 0).sort((a, b) => a - b);
  }, [allListings]);

  const minPriceNum = minPrice ? parseFloat(minPrice) : 0;
  const maxPriceNum = maxPrice ? parseFloat(maxPrice) : Math.max(...prices, 1000);

  const priceRange = useMemo(() => {
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return { min, max };
  }, [prices]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const vendors = [
    "WCP",
    "CTRE",
    "VEX",
    "Thrifty Bot",
    "SDS",
    "AndyMark",
    "REV",
  ];

  const ratings = [5.0, 4.0, 3.0, 2.0, 1.0];

  const toggleCondition = (condition: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    );
  };

  const toggleVendor = (vendor: string) => {
    setSelectedVendors((prev) =>
      prev.includes(vendor)
        ? prev.filter((v) => v !== vendor)
        : [...prev, vendor]
    );
  };

  const handleClear = () => {
    setSelectedConditions([]);
    setSelectedVendors([]);
    setMinPrice("");
    setMaxPrice("");
    setSelectedRating(null);
  };

  const handleApply = () => {
    console.log("Apply filters", {
      conditions: selectedConditions,
      vendors: selectedVendors,
      minPrice,
      maxPrice,
      rating: selectedRating,
    });
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearHeaderButton}
        >
          <Text style={[styles.clearHeaderText, { color: "#10B981" }]}>Clear</Text>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        opacity={fadeAnim}
      >
        <Animated.View
          style={[
            styles.section,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Price</Text>

          <View style={styles.priceGraphContainer}>
            <View style={styles.priceGraph}>
              {Array.from({ length: 20 }).map((_, i) => {
                const bucketSize = (priceRange.max - priceRange.min) / 20;
                const bucketMin = priceRange.min + (i * bucketSize);
                const bucketMax = bucketMin + bucketSize;
                
                const count = prices.filter(p => p >= bucketMin && p < bucketMax).length;
                const maxCount = Math.max(...Array.from({ length: 20 }, (_, idx) => {
                  const bMin = priceRange.min + (idx * bucketSize);
                  const bMax = bMin + bucketSize;
                  return prices.filter(p => p >= bMin && p < bMax).length;
                }));
                
                const height = maxCount > 0 ? (count / maxCount) * 60 + 20 : 20;
                const isInRange = bucketMin >= minPriceNum && bucketMax <= maxPriceNum;
                
                const gradientOpacity = isInRange ? (i / 20) * 0.4 + 0.6 : 0.3;
                const barColor = isInRange 
                  ? `rgba(239, 68, 68, ${gradientOpacity})`
                  : colors.border;
                
                return (
                  <View
                    key={i}
                    style={[
                      styles.priceBar,
                      {
                        height: height,
                        backgroundColor: barColor,
                      },
                    ]}
                  />
                );
              })}
            </View>
          </View>

          <View style={styles.priceInputContainer}>
            <View style={styles.priceInputWrapper}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
                Minimum
              </Text>
              <View
                style={[
                  styles.priceInput,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.priceCurrency, { color: colors.text }]}>$</Text>
                <TextInput
                  style={[styles.priceInputText, { color: colors.text }]}
                  value={minPrice}
                  onChangeText={setMinPrice}
                  placeholder="20"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.priceInputWrapper}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
                Maximum
              </Text>
              <View
                style={[
                  styles.priceInput,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.priceCurrency, { color: colors.text }]}>$</Text>
                <TextInput
                  style={[styles.priceInputText, { color: colors.text }]}
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  placeholder="680"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.section,
            {
              transform: [
                {
                  translateY: Animated.add(slideAnim, new Animated.Value(10)),
                },
              ],
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Rating</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.ratingScroll}
          >
            <TouchableOpacity
              style={[
                styles.ratingChip,
                {
                  backgroundColor:
                    selectedRating === null ? "#10B981" : colors.card,
                  borderColor:
                    selectedRating === null ? "#10B981" : colors.border,
                },
              ]}
              onPress={() => setSelectedRating(null)}
            >
              <Text
                style={[
                  styles.ratingChipText,
                  {
                    color:
                      selectedRating === null ? "#FFFFFF" : colors.textSecondary,
                  },
                ]}
              >
                Any
              </Text>
            </TouchableOpacity>
            {ratings.map((rating) => (
              <TouchableOpacity
                key={rating}
                style={[
                  styles.ratingChip,
                  {
                    backgroundColor:
                      selectedRating === rating ? "#10B981" : colors.card,
                    borderColor:
                      selectedRating === rating ? "#10B981" : colors.border,
                  },
                ]}
                onPress={() => setSelectedRating(rating)}
              >
                <Star
                  size={16}
                  color={
                    selectedRating === rating ? "#FFFFFF" : colors.textSecondary
                  }
                  fill={
                    selectedRating === rating ? "#FFFFFF" : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.ratingChipText,
                    {
                      color:
                        selectedRating === rating
                          ? "#FFFFFF"
                          : colors.textSecondary,
                    },
                  ]}
                >
                  {rating.toFixed(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View
          style={[
            styles.section,
            {
              transform: [
                {
                  translateY: Animated.add(slideAnim, new Animated.Value(20)),
                },
              ],
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Condition</Text>
          <View style={styles.chipContainer}>
            {LISTING_CONDITIONS.map((condition) => (
              <TouchableOpacity
                key={condition}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selectedConditions.includes(condition)
                      ? "#10B981"
                      : colors.card,
                    borderColor: selectedConditions.includes(condition)
                      ? "#10B981"
                      : colors.border,
                  },
                ]}
                onPress={() => toggleCondition(condition)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: selectedConditions.includes(condition)
                        ? "#FFFFFF"
                        : colors.text,
                    },
                  ]}
                >
                  {condition}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.section,
            {
              transform: [
                {
                  translateY: Animated.add(slideAnim, new Animated.Value(30)),
                },
              ],
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Vendor</Text>
          <View style={styles.chipContainer}>
            {vendors.map((vendor) => (
              <TouchableOpacity
                key={vendor}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selectedVendors.includes(vendor)
                      ? "#10B981"
                      : colors.card,
                    borderColor: selectedVendors.includes(vendor)
                      ? "#10B981"
                      : colors.border,
                  },
                ]}
                onPress={() => toggleVendor(vendor)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: selectedVendors.includes(vendor)
                        ? "#FFFFFF"
                        : colors.text,
                    },
                  ]}
                >
                  {vendor}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>

      <View
        style={[
          styles.footer,
          { borderTopColor: colors.border, backgroundColor: colors.background },
        ]}
      >
        <TouchableOpacity
          style={[styles.clearButton, { borderColor: colors.border }]}
          onPress={handleClear}
        >
          <Text style={[styles.clearButtonText, { color: colors.text }]}>
            Clear All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApply}
        >
          <Text style={styles.applyButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 0,
  },
  backButton: {
    padding: 4,
  },
  clearHeaderButton: {
    padding: 4,
  },
  clearHeaderText: {
    fontSize: 17,
    fontWeight: "600" as const,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  priceGraphContainer: {
    marginBottom: 20,
  },
  priceGraph: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 80,
    paddingHorizontal: 4,
  },
  priceBar: {
    width: (width - 88) / 20,
    borderRadius: 2,
  },
  priceInputContainer: {
    flexDirection: "row",
    gap: 12,
  },
  priceInputWrapper: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 13,
    marginBottom: 8,
    fontWeight: "500" as const,
  },
  priceInput: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  priceCurrency: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginRight: 4,
  },
  priceInputText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500" as const,
  },
  ratingScroll: {
    gap: 10,
    paddingRight: 20,
  },
  ratingChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    gap: 6,
  },
  ratingChipText: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  filterChipText: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 12,
    borderTopWidth: 0.5,
  },
  clearButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  applyButton: {
    flex: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#10B981",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
});
