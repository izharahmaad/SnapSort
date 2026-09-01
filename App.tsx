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
const FOREST = "#064226";
const DARK_FOREST = "#022716";
const LIGHT_GREEN = "#D8F2E0";
const LOADING_GREEN = "#9ED8AE";

const SPLASH_DURATION = 3000;

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [
    minimumSplashFinished,
    setMinimumSplashFinished,
  ] = useState(false);

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
  const progress = useRef(
    new Animated.Value(0)
  ).current;

  const contentOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const logoScale = useRef(
    new Animated.Value(0.92)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(progress, {
        toValue: 1,
        duration: SPLASH_DURATION,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),

      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 55,
        useNativeDriver: true,
      }),
    ]).start();
  }, [contentOpacity, logoScale, progress]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.splashScreen}>
      <StatusBar style="light" />

      <View style={styles.topGlow} />

      <View style={styles.bottomGlow} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: contentOpacity,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.logoOuter,
            {
              transform: [
                {
                  scale: logoScale,
                },
              ],
            },
          ]}
        >
          <View style={styles.logoInner}>
            <MaterialCommunityIcons
              name="leaf"
              size={42}
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

        <View style={styles.progressArea}>
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
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 42,
    backgroundColor: DARK_FOREST,
  },

  topGlow: {
    position: "absolute",
    top: -130,
    right: -135,
    width: 310,
    height: 310,
    borderRadius: 155,
    backgroundColor: "rgba(43, 135, 75, 0.20)",
  },

  bottomGlow: {
    position: "absolute",
    left: -115,
    bottom: -130,
    width: 285,
    height: 285,
    borderRadius: 143,
    backgroundColor: "rgba(44, 129, 72, 0.16)",
  },

  content: {
    width: "100%",
    alignItems: "center",
  },

  logoOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.09)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  logoInner: {
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
    color: "rgba(235,255,241,0.78)",
    fontSize: 11,
    textAlign: "center",
    marginTop: 5,
  },

  progressArea: {
    width: "100%",
    marginTop: 31,
  },

  progressTrack: {
    width: "100%",
    height: 4,
    overflow: "hidden",
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.17)",
  },

  progressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: LOADING_GREEN,
  },

  loadingLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: "rgba(216,244,224,0.65)",
    fontSize: 7,
    letterSpacing: 1.35,
    textAlign: "center",
    marginTop: 10,
  },
});