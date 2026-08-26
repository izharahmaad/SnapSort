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

export default function LoginScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] =
    useState(false);

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

  const handleForgotPassword = async () => {
    if (!cleanEmail) {
      Alert.alert(
        "Enter your email",
        "Enter your email address first, then tap Forgot password."
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
      setIsResettingPassword(true);

      await sendPasswordResetEmail(auth, cleanEmail);

      Alert.alert(
        "Reset email sent",
        "Check your inbox for instructions to create a new password."
      );
    } catch (error: unknown) {
      Alert.alert(
        "Password reset failed",
        getAuthErrorMessage(getErrorCode(error))
      );
    } finally {
      setIsResettingPassword(false);
    }
  };

  const isBusy = isLoading || isResettingPassword;

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
              paddingBottom: Math.max(insets.bottom + 24, 36),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandSection}>
            <View style={styles.logoCircle}>
              <View style={styles.logoInnerCircle}>
                <MaterialCommunityIcons
                  name="leaf"
                  size={31}
                  color="#FFFFFF"
                />
              </View>
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
              Sign in to continue your personal sustainability
              journey.
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
              <MaterialCommunityIcons
                name="help-circle-outline"
                size={15}
                color={colors.primary}
              />

              <Text style={styles.forgotText}>
                {isResettingPassword
                  ? "Sending reset email..."
                  : "Forgot password?"}
              </Text>
            </Pressable>

            <Button
              mode="contained"
              icon={isLoading ? undefined : "arrow-right"}
              loading={isLoading}
              disabled={isBusy}
              onPress={handleLogin}
              contentStyle={styles.loginButton}
              labelStyle={styles.loginButtonLabel}
              style={styles.loginButtonWrapper}
              theme={{ roundness: 16 }}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />

            <Text style={styles.dividerText}>
              NEW TO SNAP SORT AI
            </Text>

            <View style={styles.dividerLine} />
          </View>

          <Button
            mode="outlined"
            icon="account-plus-outline"
            textColor={colors.primary}
            onPress={() => navigation.navigate("Register")}
            contentStyle={styles.registerButton}
            labelStyle={styles.registerButtonLabel}
            style={styles.registerButtonWrapper}
            disabled={isBusy}
            theme={{ roundness: 16 }}
          >
            Create an account
          </Button>

          <View style={styles.featureRow}>
            <Feature
              icon="camera-outline"
              title="Scan"
              text="Identify items"
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

          <View style={styles.trustCard}>
            <View style={styles.trustIcon}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={20}
                color={colors.primary}
              />
            </View>

            <View style={styles.trustCopy}>
              <Text style={styles.trustTitle}>
                Your choices stay yours
              </Text>

              <Text style={styles.trustText}>
                Your scan history is linked to your account and
                protected by Firebase Authentication.
              </Text>
            </View>
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
            size={19}
            color={colors.primary}
          />
        </View>

        <TextInput
          {...inputProps}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#96A09A"
          onChangeText={onChangeText}
          style={styles.input}
        />

        {rightIcon && onRightIconPress ? (
          <Pressable
            style={styles.rightIconButton}
            onPress={onRightIconPress}
            accessibilityRole="button"
            accessibilityLabel="Toggle password visibility"
          >
            <MaterialCommunityIcons
              name={rightIcon}
              size={19}
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
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D7EEDF",
  },
  logoInnerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  brand: {
    fontFamily: "Poppins_700Bold",
    color: colors.primary,
    fontSize: 29,
    letterSpacing: -0.8,
    marginTop: 12,
  },
  tagline: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  welcomeSection: {
    marginTop: 32,
    marginBottom: 17,
  },
  welcomeEyebrow: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 9,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  welcomeTitle: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 27,
    lineHeight: 34,
  },
  welcomeText: {
    maxWidth: 305,
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 5,
  },
  formCard: {
    padding: 16,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldWrapper: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 11,
    marginBottom: 6,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    paddingHorizontal: 8,
    borderRadius: 17,
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
    height: 52,
    paddingHorizontal: 10,
    paddingVertical: 0,
    color: colors.text,
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
  },
  rightIconButton: {
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
    gap: 4,
    marginTop: -2,
    marginBottom: 17,
  },
  forgotText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 10,
  },
  loginButtonWrapper: {
    borderRadius: 16,
    overflow: "hidden",
  },
  loginButton: {
    height: 54,
  },
  loginButtonLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 25,
    marginBottom: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.muted,
    fontSize: 8,
    letterSpacing: 1.1,
  },
  registerButtonWrapper: {
    borderRadius: 16,
    borderColor: colors.primary,
  },
  registerButton: {
    height: 52,
  },
  registerButtonLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
  },
  featureRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 19,
  },
  feature: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 11,
    borderRadius: 16,
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
    marginTop: 5,
  },
  featureText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 8,
    marginTop: 1,
  },
  trustCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 13,
    marginTop: 18,
    borderRadius: 17,
    backgroundColor: "#FFF1D5",
    borderWidth: 1,
    borderColor: "#F1D6A0",
  },
  trustIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  trustCopy: {
    flex: 1,
  },
  trustTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#523915",
    fontSize: 12,
  },
  trustText: {
    fontFamily: "Poppins_400Regular",
    color: "#765D2C",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },
  disclaimer: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 9,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 17,
  },
});