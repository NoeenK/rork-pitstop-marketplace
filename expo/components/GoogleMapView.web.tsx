// Web-specific version of GoogleMapView - no react-native-maps dependency
import React from 'react';
import { StyleSheet, View, Text, Linking, Platform } from 'react-native';

interface GoogleMapViewProps {
  latitude: number;
  longitude: number;
  onLocationChange?: (latitude: number, longitude: number) => void;
  showUserLocation?: boolean;
  style?: any;
}

export default function GoogleMapView({
  latitude,
  longitude,
  style,
}: GoogleMapViewProps) {
  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  
  return (
    <View style={[styles.container, style, styles.webFallback]}>
      <Text style={styles.webFallbackText}>
        📍 Location: {latitude.toFixed(6)}, {longitude.toFixed(6)}
      </Text>
      <Text 
        style={styles.webFallbackLink}
        onPress={() => Linking.openURL(googleMapsUrl)}
      >
        Open in Google Maps
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  webFallbackText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  webFallbackLink: {
    fontSize: 14,
    color: '#0066cc',
    textDecorationLine: 'underline',
  },
});

