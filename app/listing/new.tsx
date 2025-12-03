import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useState, useMemo, Fragment } from "react";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { X, Upload } from "lucide-react-native";
import { useListings } from "@/contexts/ListingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { LISTING_CATEGORIES, LISTING_CONDITIONS } from "@/constants/listingOptions";
import { Category, Condition } from "@/types";
import Button from "@/components/Button";
import FilterChip from "@/components/FilterChip";
import { useTheme } from "@/contexts/ThemeContext";


export default function NewListingScreen() {
  const router = useRouter();
  const { createListing } = useListings();
  const { user } = useAuth();
  const { colors } = useTheme();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<Category | null>(null);
  const [condition, setCondition] = useState<Condition | null>(null);
  const [price, setPrice] = useState<string>("");
  const [isSwapOnly, setIsSwapOnly] = useState<boolean>(false);
  const [seasonTag, setSeasonTag] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert(
        "Camera Roll Permission",
        "We need permission to access your photos to add images to your listing.",
        [{ text: "OK" }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 6 - images.length,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Error", "Please enter a description");
      return;
    }
    if (!category) {
      Alert.alert("Error", "Please select a category");
      return;
    }
    if (!condition) {
      Alert.alert("Error", "Please select a condition");
      return;
    }
    if (!isSwapOnly && !price.trim()) {
      Alert.alert("Error", "Please enter a price or mark as swap only");
      return;
    }
    if (images.length === 0) {
      Alert.alert("Error", "Please add at least one photo");
      return;
    }
    if (!user) {
      Alert.alert("Error", "You must be logged in to create a listing");
      return;
    }

    setIsLoading(true);

    try {
      await createListing({
        sellerId: user.id,
        seller: user,
        title: title.trim(),
        description: description.trim(),
        category,
        condition,
        priceCents: isSwapOnly ? null : Math.round(parseFloat(price) * 100),
        isSwapOnly,
        city: user.city,
        country: user.country,
        images,
        seasonTag: seasonTag.trim() || undefined,
        roboticsCategory: "FRC",
        isActive: true,
        isSold: false,
        priceHistory: [],
      });

      Alert.alert("Success", "Listing created successfully!");
      router.back();
    } catch (err) {
      console.error("[NewListing] Failed to create listing:", err);
      Alert.alert("Error", "Failed to create listing");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: "New Listing",
          headerShown: true,
          headerBackTitleVisible: false,
          headerLargeTitle: false,
        }}
      />

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.section}>
          <Text style={styles.label}>Photos *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
            contentContainerStyle={styles.imageScrollContent}
          >
            {images.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.image} contentFit="cover" />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <X size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 6 && (
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Upload size={32} color={colors.textSecondary} />
                <Text style={styles.uploadText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Swerve Module MK4i"
            placeholderTextColor={colors.textSecondary}
            maxLength={100}
            editable={!isLoading}
            autoCapitalize="sentences"
            returnKeyType="next"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the condition, what's included, etc."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            editable={!isLoading}
            autoCapitalize="sentences"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.chipGrid}>
            {LISTING_CATEGORIES.map((cat, idx) => (
              <Fragment key={`cat-${idx}`}>
                <FilterChip
                  label={cat}
                  selected={category === cat}
                  onPress={() => setCategory(cat)}
                />
              </Fragment>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Condition *</Text>
          <View style={styles.chipGrid}>
            {LISTING_CONDITIONS.map((cond, idx) => (
              <Fragment key={`cond-${idx}`}>
                <FilterChip
                  label={cond}
                  selected={condition === cond}
                  onPress={() => setCondition(cond)}
                />
              </Fragment>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Price</Text>
            <TouchableOpacity onPress={() => setIsSwapOnly(!isSwapOnly)}>
              <FilterChip
                label="Swap Only"
                selected={isSwapOnly}
                onPress={() => setIsSwapOnly(!isSwapOnly)}
              />
            </TouchableOpacity>
          </View>
          {!isSwapOnly && (
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              editable={!isLoading}
              returnKeyType="done"
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Season Used In (Optional)</Text>
          <TextInput
            style={styles.input}
            value={seasonTag}
            onChangeText={setSeasonTag}
            placeholder="e.g., Crescendo 2024"
            placeholderTextColor={colors.textSecondary}
            editable={!isLoading}
            autoCapitalize="words"
            returnKeyType="done"
          />
        </View>

        <Button
          title="Create Listing"
          onPress={handleSubmit}
          loading={isLoading}
          style={styles.submitButton}
          testID="submit-button"
        />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 16,
  },
  imageScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  imageScrollContent: {
    gap: 12,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadButton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  uploadText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600" as const,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 12,
    marginBottom: 32,
  },
});
