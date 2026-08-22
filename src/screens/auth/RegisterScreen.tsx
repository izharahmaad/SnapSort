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
import { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    let isValid = true;

    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (!name.trim()) {
      setNameError("Your name is required.");
      isValid = false;
    } else if (name.trim().length < 2) {
      setNameError("Enter at least 2 characters.");
      isValid = false;
    }

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
    } else if (password.length < 6) {
      setPasswordError("Password must contain at least 6 characters.");
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password.");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );

      await updateProfile(credential.user, {
        displayName: name.trim(),
      });
    } catch (error: any) {
      Alert.alert("Registration failed", getAuthErrorMessage(error?.code));
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
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons
              name="sprout-outline"
              size={42}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.title}>Join SnapSort</Text>

          <Text style={styles.subtitle}>
            Start building smarter and more sustainable habits.
          </Text>
        </View>

        <View style={styles.formCard}>
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
            left={
              <TextInput.Icon
                icon="account-outline"
                color={colors.muted}
              />
            }
            outlineColor={nameError ? colors.hazardous : colors.border}
            activeOutlineColor={colors.primary}
            style={styles.input}
          />

          <HelperText type="error" visible={Boolean(nameError)}>
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
            placeholder="At least 6 characters"
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
                  setShowConfirmPassword((value) => !value)
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

          <Button
            mode="contained"
            loading={isLoading}
            disabled={isLoading}
            icon="account-check-outline"
            onPress={handleRegister}
            contentStyle={styles.registerButton}
            labelStyle={styles.registerButtonLabel}
          >
            Create account
          </Button>

          <Button
            mode="text"
            textColor={colors.primary}
            onPress={() => navigation.navigate("Login")}
            style={styles.loginButton}
          >
            Already have an account? Sign in
          </Button>
        </View>

        <Text style={styles.footerText}>
          Your account helps us keep your scan history safe and personal.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getAuthErrorMessage(code?: string) {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/weak-password":
      return "Please choose a stronger password.";

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
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    marginBottom: 16,
    elevation: 5,
  },
  title: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 28,
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    textAlign: "center",
    lineHeight: 21,
    marginTop: 7,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 3,
  },
  input: {
    backgroundColor: colors.surface,
    marginTop: 4,
  },
  registerButton: {
    height: 54,
  },
  registerButtonLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
  },
  loginButton: {
    marginTop: 7,
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