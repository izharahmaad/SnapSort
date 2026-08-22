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
import { useOnboardingStore } from "./src/stores/onboarding.store";

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const {
    isLoading,
    hasCompletedOnboarding,
    loadOnboardingStatus,
  } = useOnboardingStore();

  useEffect(() => {
    loadOnboardingStatus();
  }, [loadOnboardingStatus]);

  if (!fontsLoaded || isLoading) {
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
        {hasCompletedOnboarding ? <RootNavigator /> : <OnboardingScreen />}
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