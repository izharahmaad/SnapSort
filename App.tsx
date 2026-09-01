import { useEffect } from "react";
import {
  ActivityIndicator,
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
const DEEP_FOREST = "#032817";
const LIGHT_GREEN = "#DDF4E4";
const SOFT_GREEN = "#88CBA0";
const ACCENT_GREEN = "#45A96A";

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

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

  if (!fontsLoaded || onboardingLoading) {
    return <SnapSortSplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={appTheme}>
        <StatusBar style="light" />

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
  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View style={styles.largeGlow} />
      <View style={styles.mediumGlow} />
      <View style={styles.bottomGlow} />

      <View style={styles.topText}>
        <Text style={styles.topLabel}>
          MINDFUL DISPOSAL
        </Text>
      </View>

      <View style={styles.centerContent}>
        <View style={styles.outerRing}>
          <View style={styles.middleRing}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="leaf"
                size={48}
                color={FOREST}
              />
            </View>
          </View>
        </View>

        <Text style={styles.brand}>
          SnapSort AI
        </Text>

        <Text style={styles.tagline}>
          Smarter choices.
        </Text>

        <Text style={styles.tagline}>
          Smaller footprint.
        </Text>

        <View style={styles.brandLine} />
      </View>

      <View style={styles.bottomContent}>
        <View style={styles.loadingRow}>
          <View style={styles.loadingIndicator}>
            <ActivityIndicator
              size="small"
              color={WHITE}
            />
          </View>

          <Text style={styles.loadingText}>
            Preparing your experience
          </Text>
        </View>

        <Text style={styles.footerText}>
          EVERY CHOICE CAN CREATE CHANGE
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    paddingTop: "18%",
    paddingBottom: "13%",
    backgroundColor: DARK_FOREST,
  },

  largeGlow: {
    position: "absolute",
    top: -145,
    right: -125,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "rgba(91, 189, 122, 0.20)",
  },

  mediumGlow: {
    position: "absolute",
    top: 145,
    left: -150,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(58, 151, 92, 0.17)",
  },

  bottomGlow: {
    position: "absolute",
    right: -90,
    bottom: -105,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(106, 197, 132, 0.14)",
  },

  topText: {
    alignItems: "center",
  },

  topLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: "rgba(222, 255, 232, 0.78)",
    fontSize: 8,
    letterSpacing: 2.1,
  },

  centerContent: {
    alignItems: "center",
    marginTop: 20,
  },

  outerRing: {
    width: 144,
    height: 144,
    borderRadius: 72,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  middleRing: {
    width: 113,
    height: 113,
    borderRadius: 57,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(215, 247, 225, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
  },

  iconCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
    shadowColor: "#001A0D",
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.24,
    shadowRadius: 15,
    elevation: 8,
  },

  brand: {
    fontFamily: "Poppins_700Bold",
    color: WHITE,
    fontSize: 31,
    letterSpacing: -0.9,
    marginTop: 20,
  },

  tagline: {
    fontFamily: "Poppins_400Regular",
    color: "rgba(238, 255, 243, 0.82)",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },

  brandLine: {
    width: 42,
    height: 4,
    borderRadius: 2,
    marginTop: 15,
    backgroundColor: ACCENT_GREEN,
  },

  bottomContent: {
    alignItems: "center",
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  loadingIndicator: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  loadingText: {
    fontFamily: "Poppins_500Medium",
    color: "rgba(238, 255, 243, 0.78)",
    fontSize: 10,
    marginLeft: 8,
  },

  footerText: {
    fontFamily: "Poppins_600SemiBold",
    color: "rgba(209, 244, 220, 0.56)",
    fontSize: 7,
    letterSpacing: 1.35,
    marginTop: 20,
  },
});