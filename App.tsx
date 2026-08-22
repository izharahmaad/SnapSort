import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import OnboardingScreen from "./src/screens/onboarding/OnboardingScreen";
import RootNavigator from "./src/navigation/RootNavigator";
import { appTheme, colors } from "./src/constants/theme";
import { observeAuth } from "./src/services/firebase/firebase";
import { useAuthStore } from "./src/stores/auth.store";
import { useOnboardingStore } from "./src/stores/onboarding.store";

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
    loadOnboardingStatus();

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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});