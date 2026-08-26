import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Button, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../constants/theme";
import { auth } from "../../services/firebase/firebase";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Login"
>;

type IconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

const PRIVACY_POLICY_URL =
  "https://your-domain.com/privacy-policy";

const TERMS_OF_SERVICE_URL =
  "https://your-domain.com/terms-of-service";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getErrorCode(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    return String(error.code);
  }

  return undefined;
}

function getAuthErrorMessage(code?: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "The email or password is incorrect.";

    case "auth/user-disabled":
      return "This account has been disabled.";

    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";

    case "auth/network-request-failed":
      return "Check your internet connection and try again.";

    default:
      return "We could not complete your request. Please try again.";
  }
}

async function openLegalPage(
  url: string,
  title: string
) {
  try {
    const supported = await Linking.canOpenURL(url);

    if (!supported) {
      Alert.alert(
        `${title} unavailable`,
        "This legal page cannot be opened right now."
      );
      return;
    }

    await Linking.openURL(url);
  } catch {
    Alert.alert(
      `${title} unavailable`,
      "We could not open this page. Please try again."
    );
  }
}

export default function LoginScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const cleanEmail = email.trim().toLowerCase();

  const handleLogin = async () => {
    if (!cleanEmail || !password) {
      Alert.alert(
        "Missing information",
        "Please enter your email and password."
      );
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      Alert.alert(
        "Invalid email",
        "Please enter a valid email address."
      );
      return;
    }

    try {
      setIsLoading(true);

      await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );
    } catch (error: unknown) {
      Alert.alert(
        "Sign in failed",
        getAuthErrorMessage(getErrorCode(error))
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            {
              paddingTop: Math.max(insets.top + 18, 30),
              paddingBottom: Math.max(insets.bottom + 18, 28),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons
                name="leaf"
                size={30}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.brand}>
              SnapSort AI
            </Text>

            <Text style={styles.tagline}>
              Smarter choices. Smaller footprint.
            </Text>
          </View>

          <View style={styles.welcomeSection}>
            <Text style={styles.eyebrow}>
              WELCOME BACK
            </Text>

            <Text style={styles.title}>
              Make every choice count.
            </Text>

            <Text style={styles.subtitle}>
              Sign in to continue your sustainability journey.
            </Text>
          </View>

          <View style={styles.cardShadow}>
            <View style={styles.formCard}>
              <View style={styles.formHeading}>
                <Text style={styles.formTitle}>
                  Sign in to your account
                </Text>

                <Text style={styles.formSubtitle}>
                  Continue where you left off.
                </Text>
              </View>

              <LoginField
                icon="email-outline"
                label="Email address"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                editable={!isLoading}
              />

              <LoginField
                icon="lock-outline"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                editable={!isLoading}
                rightIcon={
                  showPassword
                    ? "eye-off-outline"
                    : "eye-outline"
                }
                onRightIconPress={() =>
                  setShowPassword((value) => !value)
                }
              />

              <Pressable
                style={styles.forgotButton}
                onPress={() =>
                  navigation.navigate("ForgotPassword")
                }
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Forgot password"
              >
                <MaterialCommunityIcons
                  name="lock-reset"
                  size={15}
                  color={colors.primary}
                />

                <Text style={styles.forgotText}>
                  Forgot password?
                </Text>
              </Pressable>

              <View style={styles.buttonClip}>
                <Button
                  mode="contained"
                  icon={
                    isLoading
                      ? undefined
                      : "arrow-right"
                  }
                  loading={isLoading}
                  disabled={isLoading}
                  onPress={handleLogin}
                  contentStyle={styles.signInButton}
                  labelStyle={styles.signInButtonLabel}
                >
                  {isLoading
                    ? "Signing in..."
                    : "Sign in"}
                </Button>
              </View>
            </View>
          </View>

          <View style={styles.createSection}>
            <Text style={styles.createPrompt}>
              New to SnapSort AI?
            </Text>

            <Pressable
              style={[
                styles.createButton,
                isLoading && styles.disabledButton,
              ]}
              onPress={() => navigation.navigate("Register")}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Create an account"
            >
              <View style={styles.createIcon}>
                <MaterialCommunityIcons
                  name="account-plus-outline"
                  size={19}
                  color={colors.primary}
                />
              </View>

              <View style={styles.createCopy}>
                <Text style={styles.createTitle}>
                  Create an account
                </Text>

                <Text style={styles.createSubtitle}>
                  Start sorting smarter
                </Text>
              </View>

              <View style={styles.createArrow}>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={17}
                  color="#FFFFFF"
                />
              </View>
            </Pressable>
          </View>

          <View style={styles.legalSection}>
            <Text style={styles.legalIntro}>
              By continuing, you agree to our
            </Text>

            <View style={styles.legalLinks}>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Privacy Policy"
                onPress={() =>
                  openLegalPage(
                    PRIVACY_POLICY_URL,
                    "Privacy Policy"
                  )
                }
              >
                <Text style={styles.legalLink}>
                  Privacy Policy
                </Text>
              </Pressable>

              <Text style={styles.legalSeparator}>
                •
              </Text>

              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Terms of Service"
                onPress={() =>
                  openLegalPage(
                    TERMS_OF_SERVICE_URL,
                    "Terms of Service"
                  )
                }
              >
                <Text style={styles.legalLink}>
                  Terms of Service
                </Text>
              </Pressable>
            </View>

            <Text style={styles.disclaimer}>
              SnapSort AI provides general disposal guidance.
              Local rules may vary.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function LoginField({
  icon,
  label,
  placeholder,
  value,
  onChangeText,
  rightIcon,
  onRightIconPress,
  ...inputProps
}: {
  icon: IconName;
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
} & Omit<
  React.ComponentProps<typeof TextInput>,
  "style"
>) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}
      </Text>

      <View style={styles.inputContainer}>
        <View style={styles.inputIcon}>
          <MaterialCommunityIcons
            name={icon}
            size={18}
            color={colors.primary}
          />
        </View>

        <TextInput
          {...inputProps}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#96A09A"
          style={styles.input}
        />

        {rightIcon && onRightIconPress ? (
          <Pressable
            style={styles.eyeButton}
            onPress={onRightIconPress}
            accessibilityRole="button"
            accessibilityLabel="Show or hide password"
          >
            <MaterialCommunityIcons
              name={rightIcon}
              size={18}
              color={colors.muted}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 22,
  },
  header: {
    alignItems: "center",
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 5,
  },
  brand: {
    fontFamily: "Poppins_700Bold",
    color: colors.primary,
    fontSize: 28,
    letterSpacing: -0.7,
    marginTop: 10,
  },
  tagline: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
    marginTop: 2,
  },
  welcomeSection: {
    marginTop: 30,
    marginBottom: 16,
  },
  eyebrow: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 8,
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  title: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 26,
    lineHeight: 33,
  },
  subtitle: {
    maxWidth: 295,
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 4,
  },
  cardShadow: {
    borderRadius: 24,
    shadowColor: "#173B25",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 4,
  },
  formCard: {
    padding: 17,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formHeading: {
    marginBottom: 18,
  },
  formTitle: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 19,
  },
  formSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
    marginTop: 3,
  },
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 10,
    marginBottom: 6,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 55,
    paddingHorizontal: 7,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#F5F8F5",
    borderWidth: 1,
    borderColor: "#DCE8DE",
  },
  inputIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 53,
    paddingHorizontal: 10,
    paddingVertical: 0,
    color: colors.text,
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
  },
  eyeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  forgotButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 5,
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderRadius: 18,
    marginTop: -2,
    marginBottom: 15,
  },
  forgotText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 10,
  },
  buttonClip: {
    borderRadius: 28,
    overflow: "hidden",
  },
  signInButton: {
    minHeight: 55,
    height: 55,
  },
  signInButtonLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
  },
  createSection: {
    marginTop: 21,
  },
  createPrompt: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
    textAlign: "center",
    marginBottom: 8,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    minHeight: 64,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 32,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  createIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  createCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },
  createTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 12,
  },
  createSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 9,
    marginTop: 2,
  },
  createArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  legalSection: {
    alignItems: "center",
    marginTop: 22,
  },
  legalIntro: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 9,
  },
  legalLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 5,
  },
  legalLink: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 9,
  },
  legalSeparator: {
    color: colors.muted,
    fontSize: 10,
  },
  disclaimer: {
    maxWidth: 290,
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 8,
    lineHeight: 13,
    textAlign: "center",
    marginTop: 9,
  },
});