import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from "@react-navigation/native-stack";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";

import HomeScreen from "../screens/home/HomeScreen";

import CameraScreen from "../screens/scan/CameraScreen";
import PreviewScreen from "../screens/scan/PreviewScreen";
import ResultScreen from "../screens/scan/ResultScreen";

import HistoryScreen from "../screens/history/HistoryScreen";

import ProfileScreen from "../screens/profile/ProfileScreen";
import NotificationsScreen from "../screens/profile/NotificationsScreen";
import PrivacyPolicyScreen from "../screens/profile/PrivacyPolicyScreen";
import AboutScreen from "../screens/profile/AboutScreen";

import { colors } from "../constants/theme";
import { useAuthStore } from "../stores/auth.store";
import type { RootStackParamList } from "./types";

const Stack =
  createNativeStackNavigator<RootStackParamList>();

const defaultScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  headerShadowVisible: false,
  headerBackVisible: false,
  headerBackTitle: "",
  contentStyle: {
    backgroundColor: colors.background,
  },
  animation: "slide_from_right",
};

export default function RootNavigator() {
  const user = useAuthStore((state) => state.user);
  const ready = useAuthStore((state) => state.ready);

  if (!ready) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <View style={styles.loadingLogo}>
            <TextLeaf />
          </View>

          <ActivityIndicator
            size="small"
            color={colors.primary}
          />

          <LoadingText />
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={defaultScreenOptions}>
        {!user ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                animation: "fade",
              }}
            />

            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{
                animation: "slide_from_right",
              }}
            />

            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{
                animation: "slide_from_right",
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                animation: "fade",
              }}
            />

            <Stack.Screen
              name="Camera"
              component={CameraScreen}
              options={{
                contentStyle: {
                  backgroundColor: "#000000",
                },
                animation: "slide_from_bottom",
              }}
            />

            <Stack.Screen
              name="Preview"
              component={PreviewScreen}
              options={{
                animation: "slide_from_right",
              }}
            />

            <Stack.Screen
              name="Result"
              component={ResultScreen}
              options={{
                animation: "slide_from_right",
              }}
            />

            <Stack.Screen
              name="History"
              component={HistoryScreen}
              options={{
                animation: "slide_from_right",
              }}
            />

            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                animation: "slide_from_right",
              }}
            />

            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{
                animation: "slide_from_right",
              }}
            />

            <Stack.Screen
              name="PrivacyPolicy"
              component={PrivacyPolicyScreen}
              options={{
                animation: "slide_from_right",
              }}
            />

            <Stack.Screen
              name="About"
              component={AboutScreen}
              options={{
                animation: "slide_from_right",
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function TextLeaf() {
  return (
    <View style={styles.leafIcon}>
      <View style={styles.leafStem} />
      <View style={styles.leafShape} />
    </View>
  );
}

function LoadingText() {
  return (
    <View style={styles.loadingText}>
      <View style={styles.loadingLineLarge} />
      <View style={styles.loadingLineSmall} />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  loadingCard: {
    width: 150,
    minHeight: 150,
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#173B25",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 4,
  },

  loadingLogo: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    backgroundColor: colors.primary,
  },

  leafIcon: {
    position: "relative",
    width: 27,
    height: 30,
  },

  leafStem: {
    position: "absolute",
    left: 13,
    bottom: 1,
    width: 2,
    height: 18,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
    transform: [
      {
        rotate: "-28deg",
      },
    ],
  },

  leafShape: {
    position: "absolute",
    top: 2,
    left: 7,
    width: 17,
    height: 22,
    borderTopLeftRadius: 17,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 17,
    backgroundColor: "#FFFFFF",
    transform: [
      {
        rotate: "-35deg",
      },
    ],
  },

  loadingText: {
    alignItems: "center",
    marginTop: 12,
  },

  loadingLineLarge: {
    width: 78,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primaryLight,
  },

  loadingLineSmall: {
    width: 51,
    height: 5,
    borderRadius: 3,
    marginTop: 6,
    backgroundColor: colors.border,
  },
});