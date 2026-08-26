import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
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
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
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

function getAuthErrorMessage(
  code?: string
): string {
  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "The email or password is incorrect.";

    case "auth/email-already-in-use":
      return "An account with this email already exists.";

    case "auth/weak-password":
      return "Your password should be at least 6 characters.";

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

export default function LoginScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const cleanEmail = email.trim().toLowerCase();
  const isBusy = isLoading || isResetting;

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

  const handleForgotPassword = async () => {
    if (!cleanEmail) {
      Alert.alert(
        "Enter your email",
        "Enter your email address first."
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
      setIsResetting(true);

      await sendPasswordResetEmail(auth, cleanEmail);

      Alert.alert(
        "Reset email sent",
        "Check your inbox for instructions to create a new password."
      );
    } catch (error: unknown) {
      Alert.alert(
        "Reset failed",
        getAuthErrorMessage(getErrorCode(error))
      );
    } finally {
      setIsResetting(false);
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
              paddingTop: Math.max(insets.top + 16, 26),
              paddingBottom: Math.max(insets.bottom + 22, 32),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandSection}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons
                name="leaf"
                size={29}
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
            <Text style={styles.welcomeEyebrow}>
              WELCOME BACK
            </Text>

            <Text style={styles.welcomeTitle}>
              Make every choice count.
            </Text>

            <Text style={styles.welcomeText}>
              Sign in to continue your sustainability journey.
            </Text>
          </View>

          <View style={styles.formCard}>
            <FormField
              icon="email-outline"
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isBusy}
            />

            <FormField
              icon="lock-outline"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isBusy}
              rightIcon={
                isPasswordVisible
                  ? "eye-off-outline"
                  : "eye-outline"
              }
              onRightIconPress={() =>
                setIsPasswordVisible(
                  (current) => !current
                )
              }
            />

            <Pressable
              style={styles.forgotButton}
              onPress={handleForgotPassword}
              disabled={isBusy}
            >
              <Text style={styles.forgotText}>
                {isResetting
                  ? "Sending reset email..."
                  : "Forgot password?"}
              </Text>
            </Pressable>

            <View style={styles.roundedButton}>
              <Button
                mode="contained"
                icon={isLoading ? undefined : "arrow-right"}
                loading={isLoading}
                disabled={isBusy}
                onPress={handleLogin}
                contentStyle={styles.primaryButton}
                labelStyle={styles.primaryButtonLabel}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </View>
          </View>

          <View style={styles.createSection}>
            <Text style={styles.createPrompt}>
              New to SnapSort AI?
            </Text>

            <Pressable
              style={[
                styles.createButton,
                isBusy && styles.disabledButton,
              ]}
              onPress={() => navigation.navigate("Register")}
              disabled={isBusy}
              accessibilityRole="button"
              accessibilityLabel="Create an account"
            >
              <View style={styles.createButtonIcon}>
                <MaterialCommunityIcons
                  name="account-plus-outline"
                  size={18}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.createButtonText}>
                Create an account
              </Text>

              <View style={styles.createArrow}>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={17}
                  color="#FFFFFF"
                />
              </View>
            </Pressable>
          </View>

          <View style={styles.features}>
            <Feature
              icon="camera-outline"
              title="Scan"
              text="Identify"
            />

            <Feature
              icon="recycle"
              title="Sort"
              text="Choose better"
            />

            <Feature
              icon="leaf"
              title="Impact"
              text="Waste less"
            />
          </View>

          <Text style={styles.disclaimer}>
            SnapSort AI provides general disposal guidance.
            Local rules may vary.
          </Text>
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
    <View style={styles.fieldWrapper}>
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
            style={styles.rightIcon}
            onPress={onRightIconPress}
            accessibilityRole="button"
            accessibilityLabel="Toggle password visibility"
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

function Feature({
  icon,
  title,
  text,
}: {
  icon: IconName;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={17}
          color={colors.primary}
        />
      </View>

      <Text style={styles.featureTitle}>
        {title}
      </Text>

      <Text style={styles.featureText}>
        {text}
      </Text>
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
    paddingHorizontal: 22,
  },
  brandSection: {
    alignItems: "center",
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
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
    marginTop: 28,
    marginBottom: 15,
  },
  welcomeEyebrow: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 8,
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  welcomeTitle: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 26,
    lineHeight: 33,
  },
  welcomeText: {
    maxWidth: 290,
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 4,
  },
  formCard: {
    padding: 15,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
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
    height: 54,
    paddingHorizontal: 7,
    borderRadius: 27,
    overflow: "hidden",
    backgroundColor: "#F5F8F5",
    borderWidth: 1,
    borderColor: "#DCE8DE",
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
  forgotButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderRadius: 18,
    marginTop: -1,
    marginBottom: 14,
  },
  forgotText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 10,
  },
  roundedButton: {
    overflow: "hidden",
    borderRadius: 28,
  },
  primaryButton: {
    height: 54,
  },
  primaryButtonLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
  },
  createSection: {
    marginTop: 20,
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
    height: 52,
    paddingHorizontal: 10,
    borderRadius: 27,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  createButtonIcon: {
    width: 33,
    height: 33,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  createButtonText: {
    flex: 1,
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 12,
    marginLeft: 9,
  },
  createArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  features: {
    flexDirection: "row",
    gap: 8,
    marginTop: 17,
  },
  feature: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 17,
    backgroundColor: "#EEF7F0",
    borderWidth: 1,
    borderColor: "#DCECDF",
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  featureTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 10,
    marginTop: 4,
  },
  featureText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 8,
    marginTop: 1,
  },
  disclaimer: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 9,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 16,
  },
});