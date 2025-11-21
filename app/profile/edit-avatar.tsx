import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Camera, Image as ImageIcon, X } from "lucide-react-native";
import { useState, useMemo } from "react";
import * as ImagePicker from "expo-image-picker";

import { Image } from "expo-image";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabaseClient } from "@/lib/supabase";
import ScreenWrapper from "@/components/ScreenWrapper";

export default function EditAvatarScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const { colors } = useTheme();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null as string | null);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        "Permissions Required",
        "Please grant camera and photo library permissions to upload an avatar."
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const uploadAvatar = async () => {
    if (!selectedImage || !user) return;

    try {
      setIsUploading(true);

      const fileExt = selectedImage.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const response = await fetch(selectedImage);
      const fileData = await response.arrayBuffer();

      const { error: uploadError } = await supabaseClient.storage
        .from('avatars')
        .upload(filePath, fileData, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        console.error("[EditAvatar] Upload error:", uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabaseClient.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log("[EditAvatar] Public URL:", publicUrl);

      await updateProfile({ avatarUrl: publicUrl });

      Alert.alert("Success", "Avatar updated successfully!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error("[EditAvatar] Upload failed:", error);
      Alert.alert("Error", error?.message || "Failed to upload avatar. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeAvatar = async () => {
    if (!user) return;

    Alert.alert(
      "Remove Avatar",
      "Are you sure you want to remove your avatar?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setIsUploading(true);
              await updateProfile({ avatarUrl: undefined });
              Alert.alert("Success", "Avatar removed successfully!", [
                { text: "OK", onPress: () => router.back() }
              ]);
            } catch {
              Alert.alert("Error", "Failed to remove avatar. Please try again.");
            } finally {
              setIsUploading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: "Edit Avatar",
          headerShown: true,
        }}
      />

      <View style={styles.container}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.avatarLabel}>
            {selectedImage ? "New Avatar" : "Current Avatar"}
          </Text>
        </View>

        <View style={styles.optionsSection}>
          <TouchableOpacity
            style={[styles.optionButton, styles.optionButtonPrimary]}
            onPress={pickImage}
            disabled={isUploading}
          >
            <ImageIcon size={24} color="#FFFFFF" />
            <Text style={styles.optionButtonText}>Choose from Library</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, styles.optionButtonPrimary]}
            onPress={takePhoto}
            disabled={isUploading}
          >
            <Camera size={24} color="#FFFFFF" />
            <Text style={styles.optionButtonText}>Take Photo</Text>
          </TouchableOpacity>

          {selectedImage && (
            <TouchableOpacity
              style={[styles.optionButton, styles.optionButtonSuccess]}
              onPress={uploadAvatar}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.optionButtonText}>Upload Avatar</Text>
              )}
            </TouchableOpacity>
          )}

          {user?.avatarUrl && !selectedImage && (
            <TouchableOpacity
              style={[styles.optionButton, styles.optionButtonDanger]}
              onPress={removeAvatar}
              disabled={isUploading}
            >
              <X size={24} color="#FFFFFF" />
              <Text style={styles.optionButtonText}>Remove Avatar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.border,
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.accent,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  avatarLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "500" as const,
  },
  optionsSection: {
    gap: 16,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  optionButtonPrimary: {
    backgroundColor: "#FF8A3D",
  },
  optionButtonSuccess: {
    backgroundColor: "#10B981",
  },
  optionButtonDanger: {
    backgroundColor: colors.error || "#EF4444",
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    textAlign: "center" as const,
  },
});

