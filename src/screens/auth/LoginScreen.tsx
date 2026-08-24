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
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { colors } from "../../constants/theme";
import { auth } from "../../services/firebase/firebase";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Login"
>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (): boolean => {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setEmailError("Email is required.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setEmailError("Enter a valid email address.");
      return false;
    }

    setEmailError("");
    return true;
  };

  const validateForm = (): boolean => {
    let isValid = true;

    setEmailError("");
    setPasswordError("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setEmailError("Email is required.");
      isValid = false;
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      setEmailError("Enter a valid email address.");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError(
        "Password must be at least 6 characters."
      );
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (
      isLoading ||
      isResetting ||
      !validateForm()
    ) {
      return;
    }

    try {
      setIsLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );
    } catch (error: unknown) {
      const code =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof error.code === "string"
          ? error.code
          : undefined;

      Alert.alert(
        "Login failed",
        getAuthErrorMessage(code)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (isLoading || isResetting) return;

    if (!validateEmail()) {
      Alert.alert(
        "Enter your email",
        "Add your account email first, then tap Forgot password."
      );
      return;
    }

    try {
      setIsResetting(true);

      await sendPasswordResetEmail(
        auth,
        email.trim().toLowerCase()
      );

      Alert.alert(
        "Reset email sent",
        "Check your inbox for instructions to create a new password."
      );
    } catch (error: unknown) {
      const code =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof error.code === "string"
          ? error.code
          : undefined;

      Alert.alert(
        "Could not send reset email",
        getResetErrorMessage(code)
      );
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios" ? "padding" : "height"
      }
      keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.backgroundOrbTop} />
        <View style={styles.backgroundOrbBottom} />

        <View style={styles.brandSection}>
          <View style={styles.logoOuter}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons
                name="leaf"
                size={42}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.logoBadge}>
              <MaterialCommunityIcons
                name="check"
                size={13}
                color="#FFFFFF"
              />
            </View>
          </View>

          <Text style={styles.logo}>SnapSort</Text>

          <Text style={styles.tagline}>
            Small choices. Cleaner tomorrow.
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.welcomeRow}>
            <View style={styles.welcomeIcon}>
              <MaterialCommunityIcons
                name="hand-wave-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <View style={styles.welcomeCopy}>
              <Text style={styles.eyebrow}>
                WELCOME BACK
              </Text>

              <Text style={styles.title}>
                Sign in to SnapSort
              </Text>
            </View>
          </View>

          <Text style={styles.subtitle}>
            Continue making thoughtful choices for the planet.
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
            textContentType="emailAddress"
            editable={!isLoading && !isResetting}
            left={
              <TextInput.Icon
                icon="email-outline"
                color={colors.muted}
              />
            }
            outlineColor={
              emailError
                ? colors.hazardous
                : colors.border
            }
            activeOutlineColor={colors.primary}
            style={styles.input}
          />

          <HelperText
            type="error"
            visible={Boolean(emailError)}
          >
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
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="password"
            editable={!isLoading && !isResetting}
            left={
              <TextInput.Icon
                icon="lock-outline"
                color={colors.muted}
              />
            }
            right={
              <TextInput.Icon
                icon={
                  showPassword
                    ? "eye-off-outline"
                    : "eye-outline"
                }
                color={colors.muted}
                onPress={() =>
                  setShowPassword((value) => !value)
                }
              />
            }
            outlineColor={
              passwordError
                ? colors.hazardous
                : colors.border
            }
            activeOutlineColor={colors.primary}
            style={styles.input}
          />

          <HelperText
            type="error"
            visible={Boolean(passwordError)}
          >
            {passwordError}
          </HelperText>

          <View style={styles.passwordActions}>
            <View style={styles.secureHint}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={15}
                color={colors.primary}
              />

              <Text style={styles.secureHintText}>
                Your account is protected
              </Text>
            </View>

            <Button
              mode="text"
              compact
              textColor={colors.primary}
              disabled={isLoading || isResetting}
              loading={isResetting}
              onPress={handleForgotPassword}
              labelStyle={styles.forgotLabel}
              contentStyle={styles.forgotContent}
            >
              {isResetting
                ? "Sending..."
                : "Forgot password?"}
            </Button>
          </View>

          <Button
            mode="contained"
            loading={isLoading}
            disabled={isLoading || isResetting}
            icon={isLoading ? undefined : "arrow-right"}
            onPress={handleLogin}
            contentStyle={styles.primaryButton}
            labelStyle={styles.primaryButtonLabel}
            style={styles.primaryButtonWrapper}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>

          <View style={styles.dividerRow}>
            <Divider style={styles.divider} />

            <View style={styles.orPill}>
              <Text style={styles.orText}>OR</Text>
            </View>

            <Divider style={styles.divider} />
          </View>

          <Button
            mode="outlined"
            icon="account-plus-outline"
            textColor={colors.primary}
            disabled={isLoading || isResetting}
            onPress={() => navigation.navigate("Register")}
            contentStyle={styles.secondaryButton}
            labelStyle={styles.secondaryButtonLabel}
          >
            Create a new account
          </Button>
        </View>

        <View style={styles.featureStrip}>
          <Feature
            icon="camera-outline"
            label="Scan"
          />

          <Feature
            icon="recycle"
            label="Sort"
          />

          <Feature
            icon="leaf-outline"
            label="Reuse"
          />
        </View>

        <Text style={styles.footerText}>
          By continuing, you agree to use SnapSort responsibly.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Feature({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <MaterialCommunityIcons
          name={icon as any}
          size={19}
          color={colors.primary}
        />
      </View>

      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}

function getAuthErrorMessage(
  code?: string
): string {
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

    case "auth/operation-not-allowed":
      return "Email/password sign-in is not enabled in Firebase.";

    default:
      return "Something went wrong. Please try again.";
  }
}

function getResetErrorMessage(
  code?: string
): string {
  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/user-not-found":
      return "No account was found for this email address.";

    case "auth/network-request-failed":
      return "Check your internet connection and try again.";

    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";

    default:
      return "We could not send the reset email. Please try again.";
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
    paddingHorizontal: 22,
    paddingVertical: 34,
    overflow: "hidden",
  },
  backgroundOrbTop: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    top: -150,
    right: -100,
    backgroundColor: "#DDF3E4",
    opacity: 0.75,
  },
  backgroundOrbBottom: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    bottom: -120,
    left: -110,
    backgroundColor: "#E7F5EA",
    opacity: 0.8,
  },
  brandSection: {
    alignItems: "center",
    marginBottom: 26,
  },
  logoOuter: {
    position: "relative",
    marginBottom: 13,
  },
  logoCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    elevation: 7,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
  },
  logoBadge: {
    position: "absolute",
    right: -3,
    bottom: -2,
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E39B3B",
    borderWidth: 3,
    borderColor: colors.background,
  },
  logo: {
    fontFamily: "Poppins_700Bold",
    fontSize: 31,
    letterSpacing: -0.6,
    color: colors.text,
  },
  tagline: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 13,
    marginTop: 3,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 27,
    padding: 21,
    borderWidth: 1,
    borderColor: "#DCE9DF",
    elevation: 5,
    shadowColor: "#173D25",
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 7,
    },
  },
  welcomeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  welcomeIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  welcomeCopy: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 10,
    letterSpacing: 1.1,
  },
  title: {
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
    color: colors.text,
    marginTop: 1,
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: colors.muted,
    lineHeight: 20,
    marginTop: 10,
    marginBottom: 18,
  },
  input: {
    backgroundColor: colors.surface,
    marginTop: 3,
  },
  passwordActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 34,
    marginTop: -1,
    marginBottom: 9,
  },
  secureHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
  },
  secureHintText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
  },
  forgotLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 11,
    marginVertical: 0,
  },
  forgotContent: {
    minHeight: 30,
    paddingHorizontal: 0,
  },
  primaryButtonWrapper: {
    borderRadius: 13,
    overflow: "hidden",
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
  secondaryButtonLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
    gap: 10,
  },
  divider: {
    flex: 1,
    backgroundColor: colors.border,
  },
  orPill: {
    minWidth: 34,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F6F2",
  },
  orText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.muted,
    fontSize: 10,
  },
  featureStrip: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "#E2EEE4",
  },
  featureItem: {
    alignItems: "center",
    gap: 5,
    minWidth: 70,
  },
  featureIcon: {
    width: 35,
    height: 35,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  featureLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.muted,
    fontSize: 11,
  },
  footerText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
    textAlign: "center",
    lineHeight: 16,
    marginTop: 16,
  },
});