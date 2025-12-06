import { View, TextInput, TouchableOpacity, StyleSheet, Platform, Alert, ActivityIndicator } from "react-native";
import { Smile, Paperclip, Camera, Mic, Send, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useState } from "react";
import { supabaseClient } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface MessageInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onSendImage?: (imageUrl: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function MessageInput({
  value,
  onChangeText,
  onSend,
  onSendImage,
  placeholder = "Enter Text",
  disabled = false,
}: MessageInputProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const hasText = value.trim().length > 0;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSend = () => {
    if (hasText && !disabled) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onSend();
    }
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        "Permissions Required",
        "Please grant camera and photo library permissions to send images."
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
      aspect: [4, 3],
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
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const uploadAndSendImage = async () => {
    if (!selectedImage || !user || !onSendImage) return;

    try {
      setIsUploading(true);

      const fileExt = selectedImage.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `chat-images/${fileName}`;

      const response = await fetch(selectedImage);
      const fileData = await response.arrayBuffer();

      const { error: uploadError } = await supabaseClient.storage
        .from('chat-images')
        .upload(filePath, fileData, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (uploadError) {
        console.error("[MessageInput] Upload error:", uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabaseClient.storage
        .from('chat-images')
        .getPublicUrl(filePath);

      console.log("[MessageInput] Image uploaded:", publicUrl);
      onSendImage(publicUrl);
      setSelectedImage(null);
    } catch (error: any) {
      console.error("[MessageInput] Upload failed:", error);
      Alert.alert("Error", error?.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}
      testID="message-input-container"
    >
      {selectedImage && (
        <View style={styles.imagePreviewContainer}>
          <Image
            source={{ uri: selectedImage }}
            style={styles.imagePreview}
            contentFit="cover"
          />
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={() => setSelectedImage(null)}
            disabled={isUploading}
          >
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
          {!isUploading ? (
            <TouchableOpacity
              style={styles.sendImageButton}
              onPress={uploadAndSendImage}
              disabled={disabled}
            >
              <Send size={16} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.uploadingIndicator}>
              <ActivityIndicator size="small" color="#FFFFFF" />
            </View>
          )}
        </View>
      )}
      <View style={styles.inputRow}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
        >
          <Smile size={24} color="#8E8E93" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8E8E93"
          multiline
          maxLength={500}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          editable={!disabled && !isUploading}
          testID="chat-message-input"
        />

        {hasText ? (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={disabled || isUploading}
            testID="chat-send-button"
          >
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={pickImage}
              disabled={disabled || isUploading}
            >
              <Paperclip size={20} color="#8E8E93" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={takePhoto}
              disabled={disabled || isUploading}
            >
              <Camera size={20} color="#8E8E93" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              disabled={disabled || isUploading}
            >
              <Mic size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0.5,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    color: "#000000",
    maxHeight: 100,
    marginRight: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePreviewContainer: {
    position: "relative",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  sendImageButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingIndicator: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
});

