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

  const fetchLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== "granted") {
        setCity("Toronto");
        setCountry("CA");
        setLoading(false);
        return;
      }

      if (Platform.OS === "web") {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const [result] = await Location.reverseGeocodeAsync({
              latitude,
              longitude,
            });

            if (result) {
              setCity(result.city || result.subregion || "Toronto");
              setCountry(result.isoCountryCode || "CA");
            }
            setLoading(false);
          },
          () => {
            setCity("Toronto");
            setCountry("CA");
            setLoading(false);
          }
        );
      } else {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const [result] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (result) {
          setCity(result.city || result.subregion || "Toronto");
          setCountry(result.isoCountryCode || "CA");
        }
        setLoading(false);
      }
    } catch (err) {
      console.log("Error fetching location:", err);
      setError("Unable to fetch location");
      setCity("Toronto");
      setCountry("CA");
      setLoading(false);
    }
  };

  const requestAllPermissions = useCallback(async () => {
    if (hasRequestedPermissions) return;
    
    try {
      console.log("Requesting location permission...");
      const locationResult = await Location.requestForegroundPermissionsAsync();
      
      if (locationResult.status === "granted") {
        console.log("Location permission granted");
        await fetchLocation();
      } else {
        console.log("Location permission denied");
        Alert.alert(
          "Location Permission",
          "Location access is needed to show listings near you.",
          [{ text: "OK" }]
        );
        setCity("Toronto");
        setCountry("CA");
        setLoading(false);
      }

      setHasRequestedPermissions(true);
    } catch (err) {
      console.log("Error requesting permissions:", err);
      setCity("Toronto");
      setCountry("CA");
      setLoading(false);
    }
  }, [hasRequestedPermissions]);

  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === "granted") {
        await fetchLocation();
      } else {
        setCity("Toronto");
        setCountry("CA");
        setLoading(false);
      }
    } catch (err) {
      console.log("Error requesting location permission:", err);
      setCity("Toronto");
      setCountry("CA");
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
    loading,
    error,
    requestPermission,
    refreshLocation,
    requestAllPermissions,
    hasRequestedPermissions,
  }), [city, country, loading, error, requestPermission, refreshLocation, requestAllPermissions, hasRequestedPermissions]);
});
