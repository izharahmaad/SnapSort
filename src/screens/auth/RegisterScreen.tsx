import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useMemo, useState } from "react";
import {
  Button,
  HelperText,
  Text,
  TextInput,
} from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { colors } from "../../constants/theme";
import { auth } from "../../services/firebase/firebase";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Register"
>;

export default function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] =
    useState("");
  const [
    confirmPasswordError,
    setConfirmPasswordError,
  ] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

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
    let isValid = true;

    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setNameError("Your name is required.");
      isValid = false;
    } else if (cleanName.length < 2) {
      setNameError("Enter at least 2 characters.");
      isValid = false;
    }

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
        "Password must contain at least 6 characters."
      );
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError(
        "Please confirm your password."
      );
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError(
        "Passwords do not match."
      );
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (isLoading || !validateForm()) return;

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
      const code =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof error.code === "string"
          ? error.code
          : undefined;

      Alert.alert(
        "Registration failed",
        getAuthErrorMessage(code)
      );
    } finally {
      setIsLoading(false);
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

        <View style={styles.header}>
          <View style={styles.logoOuter}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons
                name="sprout-outline"
                size={42}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.logoBadge}>
              <MaterialCommunityIcons
                name="plus"
                size={13}
                color="#FFFFFF"
              />
            </View>
          </View>

          <Text style={styles.logo}>SnapSort</Text>

          <Text style={styles.title}>Start your greener journey</Text>

          <Text style={styles.subtitle}>
            Create your account and make every item count.
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <MaterialCommunityIcons
                name="account-heart-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <View>
              <Text style={styles.eyebrow}>
                CREATE ACCOUNT
              </Text>

              <Text style={styles.formTitle}>
                Tell us about you
              </Text>
            </View>
          </View>

          <TextInput
            mode="outlined"
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
            left={
              <TextInput.Icon
                icon="account-outline"
                color={colors.muted}
              />
            }
            outlineColor={
              nameError
                ? colors.hazardous
                : colors.border
            }
            activeOutlineColor={colors.primary}
            style={styles.input}
          />

          <HelperText
            type="error"
            visible={Boolean(nameError)}
          >
            {nameError}
          </HelperText>

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
            editable={!isLoading}
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

          <View style={styles.strengthArea}>
            <View style={styles.strengthTrack}>
              <View
                style={[
                  styles.strengthFill,
                  {
                    width: passwordStrength.width,
                    backgroundColor: passwordStrength.color,
                  },
                ]}
              />
            </View>

            <Text
              style={[
                styles.strengthLabel,
                { color: passwordStrength.color },
              ]}
            >
              {passwordStrength.label}
            </Text>
          </View>

          <HelperText
            type="error"
            visible={Boolean(passwordError)}
          >
            {passwordError}
          </HelperText>

          <TextInput
            mode="outlined"
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
            left={
              <TextInput.Icon
                icon="lock-check-outline"
                color={colors.muted}
              />
            }
            right={
              <TextInput.Icon
                icon={
                  showConfirmPassword
                    ? "eye-off-outline"
                    : "eye-outline"
                }
                color={colors.muted}
                onPress={() =>
                  setShowConfirmPassword(
                    (value) => !value
                  )
                }
              />
            }
            outlineColor={
              confirmPasswordError
                ? colors.hazardous
                : colors.border
            }
            activeOutlineColor={colors.primary}
            style={styles.input}
          />

          <HelperText
            type="error"
            visible={Boolean(confirmPasswordError)}
          >
            {confirmPasswordError}
          </HelperText>

          <View style={styles.privacyNote}>
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={17}
              color={colors.primary}
            />

            <Text style={styles.privacyText}>
              Your account and scan history stay private.
            </Text>
          </View>

          <Button
            mode="contained"
            loading={isLoading}
            disabled={isLoading}
            icon={
              isLoading
                ? undefined
                : "account-check-outline"
            }
            onPress={handleRegister}
            contentStyle={styles.registerButton}
            labelStyle={styles.registerButtonLabel}
            style={styles.registerButtonWrapper}
          >
            {isLoading
              ? "Creating account..."
              : "Create account"}
          </Button>

          <Button
            mode="text"
            textColor={colors.primary}
            disabled={isLoading}
            onPress={() => navigation.navigate("Login")}
            style={styles.loginButton}
            labelStyle={styles.loginButtonLabel}
          >
            Already have an account? Sign in
          </Button>
        </View>

        <View style={styles.benefitRow}>
          <Benefit
            icon="camera-outline"
            text="Smart scans"
          />

          <Benefit
            icon="history"
            text="Saved history"
          />

          <Benefit
            icon="leaf-outline"
            text="Greener habits"
          />
        </View>

        <Text style={styles.footerText}>
          By creating an account, you agree to use SnapSort
          responsibly.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Benefit({
  icon,
  text,
}: {
  icon: string;
  text: string;
}) {
  return (
    <View style={styles.benefit}>
      <View style={styles.benefitIcon}>
        <MaterialCommunityIcons
          name={icon as any}
          size={18}
          color={colors.primary}
        />
      </View>

      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

function getAuthErrorMessage(
  code?: string
): string {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 30,
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
  header: {
    alignItems: "center",
    marginBottom: 22,
  },
  logoOuter: {
    position: "relative",
    marginBottom: 10,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
    right: -4,
    bottom: -3,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E39B3B",
    borderWidth: 3,
    borderColor: colors.background,
  },
  logo: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 28,
    letterSpacing: -0.5,
  },
  title: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 18,
    marginTop: 8,
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 18,
  },
  sectionIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  eyebrow: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 10,
    letterSpacing: 1.05,
  },
  formTitle: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 22,
    marginTop: 1,
  },
  input: {
    backgroundColor: colors.surface,
    marginTop: 3,
  },
  strengthArea: {
    marginTop: 2,
    marginBottom: 2,
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
    fontSize: 10,
    marginTop: 4,
  },
  privacyNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
    marginBottom: 14,
  },
  privacyText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
  },
  registerButtonWrapper: {
    borderRadius: 13,
    overflow: "hidden",
  },
  registerButton: {
    height: 54,
  },
  registerButtonLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
  },
  loginButton: {
    marginTop: 5,
  },
  loginButtonLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
  },
  benefitRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "#E2EEE4",
  },
  benefit: {
    alignItems: "center",
    gap: 5,
    minWidth: 82,
  },
  benefitIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  benefitText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.muted,
    fontSize: 10,
  },
  footerText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
    textAlign: "center",
    lineHeight: 16,
    marginTop: 15,
  },
});