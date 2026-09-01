import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { PaperProvider, Text } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import OnboardingScreen from "./src/screens/onboarding/OnboardingScreen";
import RootNavigator from "./src/navigation/RootNavigator";
import { appTheme } from "./src/constants/theme";
import { observeAuth } from "./src/services/firebase/firebase";
import { useAuthStore } from "./src/stores/auth.store";
import { useOnboardingStore } from "./src/stores/onboarding.store";

const WHITE = "#FFFFFF";
const FOREST = "#075C34";
const DARK_FOREST = "#053D23";
const LIGHT_GREEN = "#DDF4E4";
const SOFT_GREEN = "#A6DDB8";

const SPLASH_DURATION = 3000;

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [minimumSplashFinished, setMinimumSplashFinished] =
    useState(false);

  const setUser = useAuthStore((state) => state.setUser);
  const setReady = useAuthStore((state) => state.setReady);

  const {
    isLoading: onboardingLoading,
    hasCompletedOnboarding,
    loadOnboardingStatus,
  } = useOnboardingStore();

  useEffect(() => {
    void loadOnboardingStatus();

    const unsubscribe = observeAuth((firebaseUser) => {
      setUser(
        firebaseUser
          ? {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            }
          : null
      );

      setReady(true);
    });

    return unsubscribe;
  }, [loadOnboardingStatus, setReady, setUser]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMinimumSplashFinished(true);
    }, SPLASH_DURATION);

    return () => clearTimeout(timeout);
  }, []);

  const appIsReady =
    fontsLoaded &&
    !onboardingLoading &&
    minimumSplashFinished;

  if (!appIsReady) {
    return <SnapSortSplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={appTheme}>
        <StatusBar style="dark" />

        {hasCompletedOnboarding ? (
          <RootNavigator />
        ) : (
          <OnboardingScreen />
        )}
      </PaperProvider>
    </SafeAreaProvider>
  );
}

function SnapSortSplashScreen() {
  const progress = useRef(new Animated.Value(0)).current;

  const logoOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const logoScale = useRef(
    new Animated.Value(0.92)
  ).current;

  const contentOpacity = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(progress, {
        toValue: 1,
        duration: SPLASH_DURATION,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),

      Animated.sequence([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(logoScale, {
          toValue: 1,
          duration: 550,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
      ]),

      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 650,
        delay: 260,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    contentOpacity,
    logoOpacity,
    logoScale,
    progress,
  ]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.splashScreen}>
      <StatusBar style="light" />

      <View style={styles.topGlow} />

      <View style={styles.bottomGlow} />

      <Animated.View
        style={[
          styles.centerArea,
          {
            opacity: contentOpacity,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.logoWrap,
            {
              opacity: logoOpacity,
              transform: [
                {
                  scale: logoScale,
                },
              ],
            },
          ]}
        >
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons
              name="leaf"
              size={43}
              color={FOREST}
            />
          </View>
        </Animated.View>

        <Text style={styles.brandName}>
          SnapSort AI
        </Text>

        <Text style={styles.slogan}>
          Smarter choices. Smaller footprint.
        </Text>
      </Animated.View>

      <View style={styles.bottomArea}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressWidth,
              },
            ]}
          />
        </View>

        <Text style={styles.loadingLabel}>
          PREPARING YOUR EXPERIENCE
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    paddingTop: "40%",
    paddingBottom: "15%",
    backgroundColor: DARK_FOREST,
  },

  topGlow: {
    position: "absolute",
    top: -145,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(98, 186, 124, 0.16)",
  },

  bottomGlow: {
    position: "absolute",
    left: -105,
    bottom: -110,
    width: 270,
    height: 270,
    borderRadius: 135,
    backgroundColor: "rgba(91, 180, 117, 0.12)",
  },

  centerArea: {
    alignItems: "center",
    paddingHorizontal: 24,
  },

  logoWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
  },

  logoCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  brandName: {
    fontFamily: "Poppins_700Bold",
    color: WHITE,
    fontSize: 29,
    letterSpacing: -0.8,
    marginTop: 18,
  },

  slogan: {
    fontFamily: "Poppins_400Regular",
    color: "rgba(238,255,243,0.80)",
    fontSize: 11,
    textAlign: "center",
    marginTop: 5,
  },

  bottomArea: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 48,
  },

  progressTrack: {
    width: "100%",
    height: 4,
    overflow: "hidden",
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.20)",
  },

  progressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: SOFT_GREEN,
  },

  loadingLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: "rgba(220,248,228,0.68)",
    fontSize: 7,
    letterSpacing: 1.45,
    marginTop: 10,
  },
});