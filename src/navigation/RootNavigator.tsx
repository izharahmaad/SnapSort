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
import HomeScreen from "../screens/home/HomeScreen";
import CameraScreen from "../screens/scan/CameraScreen";
import PreviewScreen from "../screens/scan/PreviewScreen";
import ResultScreen from "../screens/scan/ResultScreen";
import HistoryScreen from "../screens/history/HistoryScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";

import { colors } from "../constants/theme";
import { useAuthStore } from "../stores/auth.store";
import type { RootStackParamList } from "./types";

const Stack =
  createNativeStackNavigator<RootStackParamList>();

const defaultScreenOptions: NativeStackNavigationOptions = {
  headerShadowVisible: false,
  headerBackVisible: false,
  headerBackTitle: "",
  headerStyle: {
    backgroundColor: colors.background,
  },
  headerTintColor: colors.text,
  headerTitleStyle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
  },
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
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={defaultScreenOptions}
      >
        {!user ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerShown: false,
                animation: "fade",
              }}
            />

            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{
                headerShown: false,
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
                headerShown: false,
                animation: "fade",
              }}
            />

            <Stack.Screen
              name="Camera"
              component={CameraScreen}
              options={{
                title: "Scan an item",
                headerShown: true,
                headerBackVisible: false,
                headerTransparent: true,
                headerTintColor: "#FFFFFF",
                headerTitleStyle: {
                  fontFamily: "Poppins_600SemiBold",
                  color: "#FFFFFF",
                },
                contentStyle: {
                  backgroundColor: "#000000",
                },
              }}
            />

            <Stack.Screen
              name="Preview"
              component={PreviewScreen}
              options={{
                title: "Preview item",
                headerShown: true,
                headerBackVisible: true,
                headerTransparent: false,
                headerStyle: {
                  backgroundColor: colors.background,
                },
                headerTintColor: colors.text,
                headerTitleStyle: {
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.text,
                },
              }}
            />

            <Stack.Screen
              name="Result"
              component={ResultScreen}
              options={{
                title: "SnapSort result",
                headerShown: true,
                headerBackVisible: true,
                headerTransparent: false,
                headerStyle: {
                  backgroundColor: colors.background,
                },
                headerTintColor: colors.text,
                headerTitleStyle: {
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.text,
                },
              }}
            />

            <Stack.Screen
              name="History"
              component={HistoryScreen}
              options={{
                headerShown: false,
              }}
            />

            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                headerShown: false,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
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