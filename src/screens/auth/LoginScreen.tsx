import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useState } from "react";
import {
  Button,
  Divider,
  HelperText,
  Text,
  TextInput,
} from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { signInWithEmailAndPassword } from "firebase/auth";

import { colors } from "../../constants/theme";
import { auth } from "../../services/firebase/firebase";
import { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    let isValid = true;

    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Email is required.");
      isValid = false;
    } else if (!email.includes("@")) {
      setEmailError("Enter a valid email address.");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );
    } catch (error: any) {
      Alert.alert("Login failed", getAuthErrorMessage(error?.code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandSection}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons
              name="leaf"
              size={42}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.logo}>SnapSort</Text>

          <Text style={styles.tagline}>
            Scan. Sort. Reuse smarter.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.title}>Welcome back</Text>

          <Text style={styles.subtitle}>
            Sign in to continue your sustainable journey.
          </Text>

          <TextInput
            mode="outlined"
            label="Email address"
            placeholder="you@example.com"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setEmailError("");
            }}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            left={
              <TextInput.Icon
                icon="email-outline"
                color={colors.muted}
              />
            }
            outlineColor={emailError ? colors.hazardous : colors.border}
            activeOutlineColor={colors.primary}
            style={styles.input}
          />

          <HelperText type="error" visible={Boolean(emailError)}>
            {emailError}
          </HelperText>

          <TextInput
            mode="outlined"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setPasswordError("");
            }}
            secureTextEntry={!showPassword}
            left={
              <TextInput.Icon
                icon="lock-outline"
                color={colors.muted}
              />
            }
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off-outline" : "eye-outline"}
                color={colors.muted}
                onPress={() => setShowPassword((value) => !value)}
              />
            }
            outlineColor={passwordError ? colors.hazardous : colors.border}
            activeOutlineColor={colors.primary}
            style={styles.input}
          />

          <HelperText type="error" visible={Boolean(passwordError)}>
            {passwordError}
          </HelperText>

          <Button
            mode="contained"
            loading={isLoading}
            disabled={isLoading}
            icon="arrow-right"
            onPress={handleLogin}
            contentStyle={styles.primaryButton}
            labelStyle={styles.primaryButtonLabel}
          >
            Sign in
          </Button>

          <View style={styles.dividerRow}>
            <Divider style={styles.divider} />
            <Text style={styles.orText}>OR</Text>
            <Divider style={styles.divider} />
          </View>

          <Button
            mode="outlined"
            icon="account-plus-outline"
            textColor={colors.primary}
            onPress={() => navigation.navigate("Register")}
            contentStyle={styles.secondaryButton}
          >
            Create a new account
          </Button>
        </View>

        <Text style={styles.footerText}>
          By continuing, you agree to use SnapSort responsibly.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getAuthErrorMessage(code?: string) {
  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "The email or password is incorrect.";

    case "auth/user-disabled":
      return "This account has been disabled.";

    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";

    case "auth/network-request-failed":
      return "Check your internet connection and try again.";

    default:
      return "Something went wrong. Please try again.";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  brandSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    marginBottom: 14,
    elevation: 5,
  },
  logo: {
    fontFamily: "Poppins_700Bold",
    fontSize: 32,
    color: colors.text,
  },
  tagline: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 14,
    marginTop: 3,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 3,
  },
  title: {
    fontFamily: "Poppins_700Bold",
    fontSize: 26,
    color: colors.text,
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: colors.muted,
    lineHeight: 21,
    marginTop: 6,
    marginBottom: 22,
  },
  input: {
    backgroundColor: colors.surface,
    marginTop: 4,
  },
  primaryButton: {
    height: 54,
  },
  primaryButtonLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
  },
  secondaryButton: {
    height: 52,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 12,
  },
  divider: {
    flex: 1,
    backgroundColor: colors.border,
  },
  orText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.muted,
    fontSize: 11,
  },
  footerText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
    marginTop: 20,
  },
});