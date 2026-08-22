import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/home/HomeScreen";
import CameraScreen from "../screens/scan/CameraScreen";
import PreviewScreen from "../screens/scan/PreviewScreen";
import ResultScreen from "../screens/scan/ResultScreen";
import { colors } from "../constants/theme";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            fontFamily: "Poppins_600SemiBold",
            color: colors.text,
          },
          headerTintColor: colors.text,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{
            title: "Scan an item",
          }}
        />

        <Stack.Screen
          name="Preview"
          component={PreviewScreen}
          options={{
            title: "Preview item",
          }}
        />

        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{
            title: "SnapSort result",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}