import { View, Text, StyleSheet, Animated, Image } from "react-native";
import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";

export default function SplashScreen() {
  const router = useRouter();
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const poweredByOpacity = useRef(new Animated.Value(0)).current;
  const poweredByScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(poweredByOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(poweredByScale, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const timer = setTimeout(() => {
      router.replace("/onboarding/intro");
    }, 2800);

    return () => clearTimeout(timer);
  }, [router, logoScale, logoOpacity, textOpacity, textTranslateY, poweredByOpacity, poweredByScale]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primaryGradientStart, "#1A0A0A", Colors.background]}
        locations={[0, 0.3, 1]}
        style={styles.gradient}
      />
      
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.logoContainer, 
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            },
          ]}
        >
          <Image
            source={{ uri: "https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/itx17cbixpcjf4xixbk6l" }}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>
        <Animated.Text 
          style={[
            styles.appName,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          PITSTOP
        </Animated.Text>
        <Animated.View
          style={[
            styles.poweredByContainer,
            {
              opacity: poweredByOpacity,
              transform: [{ scale: poweredByScale }],
            },
          ]}
        >
          <Text style={styles.poweredByText}>powered by</Text>
          <Text style={styles.poweredByBrand}>ALT-F4</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  appName: {
    fontSize: 42,
    fontWeight: "900" as const,
    color: Colors.text,
    letterSpacing: 2,
  },
  poweredByContainer: {
    marginTop: 32,
    alignItems: "center",
  },
  poweredByText: {
    fontSize: 12,
    fontWeight: "400" as const,
    color: Colors.textSecondary,
    opacity: 0.7,
    marginBottom: 4,
    letterSpacing: 1,
  },
  poweredByBrand: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.accent,
    letterSpacing: 1.5,
  },
});
