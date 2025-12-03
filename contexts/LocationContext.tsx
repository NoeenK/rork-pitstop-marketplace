import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useMemo, useCallback } from "react";
import * as Location from "expo-location";
import { Platform, Alert } from "react-native";

export const [LocationProvider, useLocation] = createContextHook(() => {
  const [city, setCity] = useState<string>("Loading...");
  const [country, setCountry] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRequestedPermissions, setHasRequestedPermissions] = useState<boolean>(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const fetchLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== "granted") {
        console.log("[LocationContext] Location permission not granted, using default location");
        setCity("Toronto");
        setCountry("CA");
        setLatitude(null);
        setLongitude(null);
        setLoading(false);
        return;
      }

      if (Platform.OS === "web") {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              console.log("[LocationContext] Web location obtained:", latitude, longitude);
              setLatitude(latitude);
              setLongitude(longitude);
              
              const [result] = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
              });

              if (result) {
                setCity(result.city || result.subregion || "Toronto");
                setCountry(result.isoCountryCode || "CA");
                console.log("[LocationContext] Resolved location:", result.city, result.isoCountryCode);
              }
              setLoading(false);
            },
            (err) => {
              console.log("[LocationContext] Web geolocation error:", err);
              setCity("Toronto");
              setCountry("CA");
              setLatitude(null);
              setLongitude(null);
              setLoading(false);
            },
            {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 60000,
            }
          );
        } else {
          console.log("[LocationContext] Geolocation not supported in browser");
          setCity("Toronto");
          setCountry("CA");
          setLatitude(null);
          setLongitude(null);
          setLoading(false);
        }
      } else {
        console.log("[LocationContext] Getting native location...");
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        console.log("[LocationContext] Native location obtained:", location.coords.latitude, location.coords.longitude);
        setLatitude(location.coords.latitude);
        setLongitude(location.coords.longitude);

        const [result] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (result) {
          setCity(result.city || result.subregion || "Toronto");
          setCountry(result.isoCountryCode || "CA");
          console.log("[LocationContext] Resolved location:", result.city, result.isoCountryCode);
        }
        setLoading(false);
      }
    } catch (err) {
      console.log("[LocationContext] Error fetching location:", err);
      setError("Unable to fetch location");
      setCity("Toronto");
      setCountry("CA");
      setLatitude(null);
      setLongitude(null);
      setLoading(false);
    }
  };

  const requestAllPermissions = useCallback(async () => {
    if (hasRequestedPermissions) return;
    
    try {
      console.log("[LocationContext] Requesting location permission...");
      const locationResult = await Location.requestForegroundPermissionsAsync();
      
      if (locationResult.status === "granted") {
        console.log("[LocationContext] Location permission granted");
        await fetchLocation();
      } else {
        console.log("[LocationContext] Location permission denied");
        if (Platform.OS !== "web") {
          Alert.alert(
            "Location Permission",
            "Location access is needed to show listings near you. You can enable it in your device settings.",
            [{ text: "OK" }]
          );
        }
        setCity("Toronto");
        setCountry("CA");
        setLatitude(null);
        setLongitude(null);
        setLoading(false);
      }

      setHasRequestedPermissions(true);
    } catch (err) {
      console.log("[LocationContext] Error requesting permissions:", err);
      setCity("Toronto");
      setCountry("CA");
      setLatitude(null);
      setLongitude(null);
      setLoading(false);
    }
  }, [hasRequestedPermissions]);

  const requestPermission = useCallback(async () => {
    try {
      console.log("[LocationContext] Requesting location permission...");
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === "granted") {
        console.log("[LocationContext] Permission granted");
        await fetchLocation();
      } else {
        console.log("[LocationContext] Permission denied");
        setCity("Toronto");
        setCountry("CA");
        setLatitude(null);
        setLongitude(null);
        setLoading(false);
      }
    } catch (err) {
      console.log("[LocationContext] Error requesting location permission:", err);
      setCity("Toronto");
      setCountry("CA");
      setLatitude(null);
      setLongitude(null);
      setLoading(false);
    }
  }, []);

  const refreshLocation = useCallback(async () => {
    await fetchLocation();
  }, []);

  useEffect(() => {
    fetchLocation();
  }, []);

  return useMemo(() => ({
    city,
    country,
    latitude,
    longitude,
    loading,
    error,
    requestPermission,
    refreshLocation,
    requestAllPermissions,
    hasRequestedPermissions,
  }), [city, country, latitude, longitude, loading, error, requestPermission, refreshLocation, requestAllPermissions, hasRequestedPermissions]);
});
