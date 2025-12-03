import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ScanLine, Camera, Image as ImageIcon } from "lucide-react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";

export default function PitstopVisionScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);

  const handleScanWithCamera = async () => {
    if (!permission) {
      await requestPermission();
      return;
    }

    if (!permission.granted) {
      Alert.alert(
        "Camera Permission Required",
        "Please grant camera permission to scan items",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Grant Permission", onPress: requestPermission },
        ]
      );
      return;
    }

    setShowCamera(true);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      console.log("Selected image:", result.assets[0].uri);
      Alert.alert("Feature Coming Soon", "Image analysis will be available soon!");
    }
  };

  if (showCamera) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "Scan Item",
            headerStyle: { backgroundColor: "#000000" },
            headerTintColor: "#FFFFFF",
            headerShadowVisible: false,
          }}
        />
        <CameraView
          style={styles.camera}
          facing="back"
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanText}>Position item in frame</Text>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={() => {
                Alert.alert("Feature Coming Soon", "Item scanning will be available soon!");
                setShowCamera(false);
              }}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCamera(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Pitstop Vision",
          headerStyle: { backgroundColor: "#000000" },
          headerTintColor: "#FFFFFF",
          headerShadowVisible: false,
        }}
      />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <ScanLine size={80} color="#FF6B35" />
        </View>

        <Text style={styles.title}>Pitstop Vision</Text>
        <Text style={styles.description}>
          Scan robot parts to get instant information, pricing estimates, and similar listings
        </Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleScanWithCamera}
          >
            <Camera size={24} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Scan with Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handlePickImage}
          >
            <ImageIcon size={24} color="#FF6B35" />
            <Text style={styles.secondaryButtonText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>What you can do:</Text>
          <View style={styles.featureRow}>
            <Text style={styles.featureDot}>•</Text>
            <Text style={styles.featureText}>Identify robot parts instantly</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureDot}>•</Text>
            <Text style={styles.featureText}>Get estimated market prices</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureDot}>•</Text>
            <Text style={styles.featureText}>Find similar listings nearby</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureDot}>•</Text>
            <Text style={styles.featureText}>Check compatibility with your robot</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1C1C1E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  buttonsContainer: {
    width: "100%",
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#FF6B35",
    borderRadius: 16,
    paddingVertical: 18,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: "#FF6B35",
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FF6B35",
  },
  featuresCard: {
    width: "100%",
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  featureDot: {
    fontSize: 16,
    color: "#FF6B35",
    marginRight: 12,
    fontWeight: "700" as const,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: "#666666",
    lineHeight: 22,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 80,
  },
  scanFrame: {
    width: 280,
    height: 280,
    borderWidth: 3,
    borderColor: "#FF6B35",
    borderRadius: 20,
  },
  scanText: {
    fontSize: 18,
    color: "#FFFFFF",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 107, 53, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF6B35",
  },
  cancelButton: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});
