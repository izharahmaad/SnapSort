import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../constants/theme";
import { auth } from "../../services/firebase/firebase";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Register"
>;

type IconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

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
    case "auth/email-already-in-use":
      return "An account with this email already exists.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/weak-password":
      return "Please choose a stronger password.";

    case "auth/network-request-failed":
      return "Check your internet connection and try again.";

    case "auth/operation-not-allowed":
      return "Email/password registration is not enabled in Firebase.";

    case "auth/quota-exceeded":
      return "The sign-up limit was reached. Try again later.";

    default:
      return "Something went wrong. Please try again.";
  }
}

export default function RegisterScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] =
    useState("");
  const [confirmPasswordError, setConfirmPasswordError] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordStrength = useMemo(() => {
    if (!password) {
      return {
        label: "Use at least 6 characters",
        color: colors.muted,
        width: "0%" as `${number}%`,
      };
    }

    let score = 0;

    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) {
      return {
        label: "Needs improvement",
        color: "#C87912",
        width: "40%" as `${number}%`,
      };
    }

    if (score <= 3) {
      return {
        label: "Good password",
        color: "#6B8E23",
        width: "65%" as `${number}%`,
      };
    }

    return {
      label: "Strong password",
      color: colors.primary,
      width: "100%" as `${number}%`,
    };
  }, [password]);

  const validateForm = (): boolean => {
    let valid = true;

    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setNameError("Your name is required.");
      valid = false;
    } else if (cleanName.length < 2) {
      setNameError("Enter at least 2 characters.");
      valid = false;
    }

    if (!cleanEmail) {
      setEmailError("Email is required.");
      valid = false;
    } else if (!isValidEmail(cleanEmail)) {
      setEmailError("Enter a valid email address.");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError(
        "Password must contain at least 6 characters."
      );
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError(
        "Please confirm your password."
      );
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError(
        "Passwords do not match."
      );
      valid = false;
    }

    return valid;
  };

  const handleRegister = async () => {
    if (isLoading || !validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      const credential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim().toLowerCase(),
          password
        );

      await updateProfile(credential.user, {
        displayName: name.trim(),
      });
    } catch (error: unknown) {
      Alert.alert(
        "Registration failed",
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
              paddingTop: Math.max(insets.top + 22, 34),
              paddingBottom: Math.max(insets.bottom + 20, 30),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoOuter}>
              <View style={styles.logoRing}>
                <View style={styles.logoCircle}>
                  <MaterialCommunityIcons
                    name="leaf"
                    size={30}
                    color="#FFFFFF"
                  />
                </View>
              </View>
            </View>

            <Text style={styles.brand}>
              SnapSort AI
            </Text>

            <Text style={styles.title}>
              Create your account
            </Text>

            <Text style={styles.subtitle}>
              Start making smarter, greener choices today.
            </Text>
          </View>

          <View style={styles.cardShadow}>
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                Let’s get started
              </Text>

              <Text style={styles.formSubtitle}>
                Enter your details to create your account.
              </Text>

              <FormField
                icon="account-outline"
                label="Your name"
                placeholder="Enter your name"
                value={name}
                onChangeText={(value) => {
                  setName(value);
                  setNameError("");
                }}
                autoCapitalize="words"
                autoCorrect={false}
                textContentType="name"
                editable={!isLoading}
                error={nameError}
              />

              <FormField
                icon="email-outline"
                label="Email address"
                placeholder="you@example.com"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setEmailError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                editable={!isLoading}
                error={emailError}
              />

              <FormField
                icon="lock-outline"
                label="Password"
                placeholder="At least 6 characters"
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setPasswordError("");
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                editable={!isLoading}
                error={passwordError}
                rightIcon={
                  showPassword
                    ? "eye-off-outline"
                    : "eye-outline"
                }
                onRightIconPress={() =>
                  setShowPassword((value) => !value)
                }
              />

              <View style={styles.strengthArea}>
                <View style={styles.strengthTrack}>
                  <View
                    style={[
                      styles.strengthFill,
                      {
                        width: passwordStrength.width,
                        backgroundColor:
                          passwordStrength.color,
                      },
                    ]}
                  />
                </View>

                <Text
                  style={[
                    styles.strengthLabel,
                    {
                      color: passwordStrength.color,
                    },
                  ]}
                >
                  {passwordStrength.label}
                </Text>
              </View>

              <FormField
                icon="lock-check-outline"
                label="Confirm password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChangeText={(value) => {
                  setConfirmPassword(value);
                  setConfirmPasswordError("");
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                editable={!isLoading}
                error={confirmPasswordError}
                rightIcon={
                  showConfirmPassword
                    ? "eye-off-outline"
                    : "eye-outline"
                }
                onRightIconPress={() =>
                  setShowConfirmPassword(
                    (value) => !value
                  )
                }
              />

              <View style={styles.legalNotice}>
                <MaterialCommunityIcons
                  name="shield-check-outline"
                  size={17}
                  color={colors.primary}
                />

                <Text style={styles.legalText}>
                  Your account information is handled securely.
                </Text>
              </View>

              <View style={styles.buttonClip}>
                <Pressable
                  style={[
                    styles.registerButton,
                    isLoading && styles.disabledButton,
                  ]}
                  onPress={handleRegister}
                  disabled={isLoading}
                  accessibilityRole="button"
                  accessibilityLabel="Create account"
                >
                  <Text style={styles.registerButtonText}>
                    {isLoading
                      ? "Creating account..."
                      : "Create account"}
                  </Text>

                  {!isLoading ? (
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={19}
                      color="#FFFFFF"
                    />
                  ) : null}
                </Pressable>
              </View>

              <Pressable
                style={styles.loginButton}
                onPress={() => navigation.navigate("Login")}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Sign in"
              >
                <Text style={styles.loginButtonText}>
                  Already have an account?
                </Text>

                <Text style={styles.loginLink}>
                  Sign in
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerIntro}>
              By creating an account, you agree to our
            </Text>

            <View style={styles.footerLinks}>
              <Pressable
                accessibilityRole="link"
                onPress={() => {
                  Alert.alert(
                    "Privacy Policy",
                    "Privacy Policy will be available here."
                  );
                }}
              >
                <Text style={styles.footerLink}>
                  Privacy Policy
                </Text>
              </Pressable>

              <Text style={styles.separator}>
                •
              </Text>

              <Pressable
                accessibilityRole="link"
                onPress={() => {
                  Alert.alert(
                    "Terms of Service",
                    "Terms of Service will be available here."
                  );
                }}
              >
                <Text style={styles.footerLink}>
                  Terms of Service
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function FormField({
  icon,
  label,
  placeholder,
  value,
  onChangeText,
  rightIcon,
  onRightIconPress,
  error,
  ...inputProps
}: {
  icon: IconName;
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  error?: string;
} & Omit<
  React.ComponentProps<typeof TextInput>,
  "style"
>) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>
        {label}
      </Text>

      <View
        style={[
          styles.inputContainer,
          error && styles.inputError,
        ]}
      >
        <View style={styles.inputIcon}>
          <MaterialCommunityIcons
            name={icon}
            size={18}
            color={
              error
                ? colors.hazardous
                : colors.primary
            }
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
            style={styles.rightIcon}
            onPress={onRightIconPress}
            accessibilityRole="button"
            accessibilityLabel={`Show or hide ${label.toLowerCase()}`}
          >
            <MaterialCommunityIcons
              name={rightIcon}
              size={18}
              color={colors.muted}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text style={styles.errorText}>
          {error}
        </Text>
      ) : null}
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
    marginBottom: 24,
  },
  logoOuter: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D9EEDD",
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
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
    fontSize: 27,
    letterSpacing: -0.6,
    marginTop: 11,
  },
  title: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 22,
    textAlign: "center",
    marginTop: 17,
  },
  subtitle: {
    maxWidth: 295,
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
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
  formTitle: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 19,
  },
  formSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
    marginBottom: 18,
  },
  fieldWrapper: {
    marginBottom: 13,
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
    height: 54,
    paddingHorizontal: 7,
    borderRadius: 27,
    overflow: "hidden",
    backgroundColor: "#F5F8F5",
    borderWidth: 1,
    borderColor: "#DCE8DE",
  },
  inputError: {
    borderColor: colors.hazardous,
  },
  inputIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 52,
    paddingHorizontal: 9,
    paddingVertical: 0,
    color: colors.text,
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
  },
  rightIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  errorText: {
    fontFamily: "Poppins_400Regular",
    color: colors.hazardous,
    fontSize: 9,
    marginTop: 4,
    marginLeft: 3,
  },
  strengthArea: {
    marginTop: -3,
    marginBottom: 13,
  },
  strengthTrack: {
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: "#E8EFE9",
  },
  strengthFill: {
    height: 5,
    borderRadius: 3,
  },
  strengthLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 9,
    marginTop: 4,
  },
  legalNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 1,
    marginBottom: 14,
  },
  legalText: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
  },
  buttonClip: {
    borderRadius: 27,
    overflow: "hidden",
  },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
  },
  registerButtonText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 13,
  },
  disabledButton: {
    opacity: 0.55,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 15,
    paddingVertical: 5,
  },
  loginButtonText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
  },
  loginLink: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 10,
  },
  footer: {
    alignItems: "center",
    marginTop: 21,
  },
  footerIntro: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 9,
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 6,
  },
  footerLink: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 9,
  },
  separator: {
    color: colors.muted,
    fontSize: 10,
  },
});