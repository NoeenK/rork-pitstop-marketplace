import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Camera, Image as ImageIcon, X } from "lucide-react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import * as FileSystem from "expo-file-system/legacy";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabaseClient } from "@/lib/supabase";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useMemo } from "react";

export default function EditAvatarScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const { colors } = useTheme();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(selectedImage, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileExt = selectedImage.split('.').pop() || 'jpg';
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Determine content type
      const contentType = fileExt === 'png' ? 'image/png' : 
                         fileExt === 'gif' ? 'image/gif' : 
                         'image/jpeg';

      // Convert base64 to Uint8Array for Supabase Storage
      // Pure JavaScript base64 to ArrayBuffer conversion (works in React Native)
      const base64ToBytes = (base64: string): Uint8Array => {
        // Remove data URL prefix if present
        const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
        
        // Base64 character set
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        const lookup = new Uint8Array(256);
        for (let i = 0; i < chars.length; i++) {
          lookup[chars.charCodeAt(i)] = i;
        }

        // Calculate output length (accounting for padding)
        let padding = 0;
        if (cleanBase64.endsWith('==')) padding = 2;
        else if (cleanBase64.endsWith('=')) padding = 1;
        
        const bufferLength = Math.floor((cleanBase64.length * 3) / 4) - padding;
        const bytes = new Uint8Array(bufferLength);
        let p = 0;

        for (let i = 0; i < cleanBase64.length; i += 4) {
          const encoded1 = lookup[cleanBase64.charCodeAt(i)];
          const encoded2 = lookup[cleanBase64.charCodeAt(i + 1)];
          const encoded3 = lookup[cleanBase64.charCodeAt(i + 2)];
          const encoded4 = lookup[cleanBase64.charCodeAt(i + 3)];

          bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
          if (p < bufferLength) {
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
          }
          if (p < bufferLength) {
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
          }
        }

        return bytes;
      };

      const bytes = base64ToBytes(base64);

      // Upload to Supabase Storage
      const { error: uploadError } = await supabaseClient.storage
        .from('avatars')
        .upload(filePath, bytes, {
          contentType: contentType,
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabaseClient.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
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
            } catch (error: any) {
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
    backgroundColor: colors.accent,
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
  },
});

