import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Stack } from "expo-router";
import { MapPin, Save, Navigation } from "lucide-react-native";
import { useLocation } from "@/contexts/LocationContext";
import { useState, useEffect } from "react";
import GoogleMapView from "@/components/GoogleMapView";

export default function ManageNeighbourhoodScreen() {
  const { city: currentCity, country: currentCountry, latitude, longitude, refreshLocation } = useLocation();
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [searchRadius, setSearchRadius] = useState("50");
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    setCity(currentCity);
    setCountry(currentCountry);
  }, [currentCity, currentCountry]);

  const handleUseCurrentLocation = () => {
    refreshLocation();
    setShowMap(true);
  };

  const handleSave = () => {
    console.log("Saving location:", { city, country, searchRadius });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Manage neighbourhood",
          headerStyle: { backgroundColor: "#000000" },
          headerTintColor: "#FFFFFF",
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerCard}>
          <MapPin size={48} color="#FF6B35" />
          <Text style={styles.headerTitle}>Set your location</Text>
          <Text style={styles.headerText}>
            Help us show you relevant listings near you
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="Enter your city"
            placeholderTextColor="#666666"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Country</Text>
          <TextInput
            style={styles.input}
            value={country}
            onChangeText={setCountry}
            placeholder="Enter your country"
            placeholderTextColor="#666666"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Search Radius (miles)</Text>
          <TextInput
            style={styles.input}
            value={searchRadius}
            onChangeText={setSearchRadius}
            placeholder="50"
            placeholderTextColor="#666666"
            keyboardType="number-pad"
          />
          <Text style={styles.helperText}>
            Listings within {searchRadius} miles will be prioritized in your feed
          </Text>
        </View>

        <TouchableOpacity style={styles.gpsButton} onPress={handleUseCurrentLocation}>
          <Navigation size={20} color="#FFFFFF" />
          <Text style={styles.gpsButtonText}>Use Current Location</Text>
        </TouchableOpacity>

        {showMap && latitude && longitude && (
          <View style={styles.mapContainer}>
            <Text style={styles.mapLabel}>Your Current Location</Text>
            <GoogleMapView
              latitude={latitude}
              longitude={longitude}
              showUserLocation={true}
              style={styles.map}
            />
          </View>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Save Location</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Why we need your location</Text>
          <Text style={styles.infoText}>
            • Find sellers and buyers near you{"\n"}
            • Get relevant search results{"\n"}
            • Estimate shipping costs{"\n"}
            • Arrange local pickups
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  headerCard: {
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#FFFFFF",
  },
  helperText: {
    fontSize: 12,
    color: "#666666",
    marginTop: 8,
  },
  gpsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
  },
  gpsButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 24,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  infoCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 22,
  },
  mapContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1C1C1E",
    padding: 16,
  },
  mapLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    marginBottom: 12,
  },
  map: {
    height: 300,
    borderRadius: 12,
  },
});
