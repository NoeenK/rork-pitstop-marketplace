import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

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
  onLocationChange,
  showUserLocation = true,
  style,
}: GoogleMapViewProps) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (mapRef.current && latitude && longitude) {
      const region: Region = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current.animateToRegion(region, 1000);
    }
  }, [latitude, longitude]);

  return (
    <View style={[styles.container, style]} pointerEvents="box-none">
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={true}
        followsUserLocation={false}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        onRegionChangeComplete={(region) => {
          if (onLocationChange) {
            onLocationChange(region.latitude, region.longitude);
          }
        }}
        onPress={(e) => {
          // Allow map to be clicked/interacted with
          if (onLocationChange && e.nativeEvent.coordinate) {
            onLocationChange(
              e.nativeEvent.coordinate.latitude,
              e.nativeEvent.coordinate.longitude
            );
          }
        }}
        mapType="standard"
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title="Your Location"
          description="Current location"
          draggable={true}
          onDragEnd={(e) => {
            if (onLocationChange) {
              onLocationChange(
                e.nativeEvent.coordinate.latitude,
                e.nativeEvent.coordinate.longitude
              );
            }
          }}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

