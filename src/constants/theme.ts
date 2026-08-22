import { MD3LightTheme } from "react-native-paper";

export const colors = {
  primary: "#1E7A46",
  primaryDark: "#155C34",
  primaryLight: "#E7F6EC",

  background: "#F5FAF6",
  surface: "#FFFFFF",
  text: "#17261C",
  muted: "#637166",
  border: "#DCE8DF",

  recycle: "#198754",
  reuse: "#2E7D32",
  donate: "#8E44AD",
  sell: "#F39C12",
  trash: "#707B7C",
  hazardous: "#D32F2F",
  unknown: "#546E7A",

  warningBackground: "#FFF8E8",
  warningBorder: "#F2D89A",
  warningText: "#795600",
};

export const appTheme = {
  ...MD3LightTheme,

  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: "#68A67B",
    background: colors.background,
    surface: colors.surface,
    onSurface: colors.text,
    outline: colors.border,
  },

  fonts: {
    ...MD3LightTheme.fonts,
    bodyLarge: {
      ...MD3LightTheme.fonts.bodyLarge,
      fontFamily: "Poppins_400Regular",
    },
    bodyMedium: {
      ...MD3LightTheme.fonts.bodyMedium,
      fontFamily: "Poppins_400Regular",
    },
    titleLarge: {
      ...MD3LightTheme.fonts.titleLarge,
      fontFamily: "Poppins_700Bold",
    },
    titleMedium: {
      ...MD3LightTheme.fonts.titleMedium,
      fontFamily: "Poppins_600SemiBold",
    },
    labelLarge: {
      ...MD3LightTheme.fonts.labelLarge,
      fontFamily: "Poppins_600SemiBold",
    },
  },
};