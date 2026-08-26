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
import { sendPasswordResetEmail } from "firebase/auth";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../constants/theme";
import { auth } from "../../services/firebase/firebase";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "ForgotPassword"
>;

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

function getResetError(code?: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/too-many-requests":
      return "Too many requests. Please try again later.";

    case "auth/network-request-failed":
      return "Check your internet connection and try again.";

    default:
      return "We could not send the reset email. Please try again.";
  }
}

async function openLegalPage(
  url: string,
  title: string
) {
  try {
    const canOpen = await Linking.canOpenURL(url);

    if (!canOpen) {
      Alert.alert(
        `${title} unavailable`,
        "This page cannot be opened right now."
      );
      return;
    }

    await Linking.openURL(url);
  } catch {
    Alert.alert(
      `${title} unavailable`,
      "We could not open this page right now."
    );
  }
}

export default function ForgotPasswordScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const cleanEmail = email.trim().toLowerCase();

  const handleSendResetEmail = async () => {
    if (!cleanEmail) {
      Alert.alert(
        "Email required",
        "Enter the email address connected to your account."
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
      setIsSending(true);

      await sendPasswordResetEmail(auth, cleanEmail);

      Alert.alert(
        "Reset link sent",
        "Please check your email to continue.",
        [
          {
            text: "Return to sign in",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
    } catch (error: unknown) {
      Alert.alert(
        "Reset failed",
        getResetError(getErrorCode(error))
      );
    } finally {
      setIsSending(false);
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
              paddingTop: Math.max(insets.top + 28, 42),
              paddingBottom: Math.max(insets.bottom + 22, 32),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons
                name="lock-reset"
                size={29}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.brand}>
              SnapSort AI
            </Text>

            <Text style={styles.title}>
              Reset your password
            </Text>

            <Text style={styles.subtitle}>
              Enter your email address and we will send you a
              secure reset link.
            </Text>
          </View>

          <View style={styles.cardShadow}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Forgot your password?
              </Text>

              <Text style={styles.cardSubtitle}>
                Use the email associated with your account.
              </Text>

              <Text style={styles.fieldLabel}>
                Email address
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={18}
                    color={colors.primary}
                  />
                </View>

                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="#96A09A"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  editable={!isSending}
                  returnKeyType="send"
                  onSubmitEditing={handleSendResetEmail}
                  style={styles.input}
                />
              </View>

              <View style={styles.buttonClip}>
                <Pressable
                  style={[
                    styles.sendButton,
                    isSending && styles.disabledButton,
                  ]}
                  onPress={handleSendResetEmail}
                  disabled={isSending}
                  accessibilityRole="button"
                  accessibilityLabel="Send password reset link"
                >
                  <Text style={styles.sendButtonText}>
                    {isSending
                      ? "Sending..."
                      : "Send reset link"}
                  </Text>

                  {!isSending ? (
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={19}
                      color="#FFFFFF"
                    />
                  ) : null}
                </Pressable>
              </View>
            </View>
          </View>

          <Pressable
            style={styles.signInButton}
            onPress={() => navigation.navigate("Login")}
            accessibilityRole="button"
            accessibilityLabel="Return to sign in"
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={16}
              color={colors.primary}
            />

            <Text style={styles.signInButtonText}>
              Return to sign in
            </Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerIntro}>
              By using SnapSort AI, you agree to our
            </Text>

            <View style={styles.footerLinks}>
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
                <Text style={styles.footerLink}>
                  Privacy Policy
                </Text>
              </Pressable>

              <Text style={styles.separator}>
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
    marginBottom: 28,
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
    fontSize: 27,
    letterSpacing: -0.6,
    marginTop: 10,
  },
  title: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 23,
    textAlign: "center",
    marginTop: 20,
  },
  subtitle: {
    maxWidth: 300,
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 5,
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
  card: {
    padding: 17,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 19,
  },
  cardSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
    marginBottom: 19,
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
  buttonClip: {
    marginTop: 18,
    borderRadius: 28,
    overflow: "hidden",
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    height: 55,
    borderRadius: 28,
    backgroundColor: colors.primary,
  },
  sendButtonText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 13,
  },
  disabledButton: {
    opacity: 0.55,
  },
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    alignSelf: "center",
    paddingHorizontal: 17,
    paddingVertical: 11,
    marginTop: 19,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
  },
  signInButtonText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 11,
  },
  footer: {
    alignItems: "center",
    marginTop: 25,
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