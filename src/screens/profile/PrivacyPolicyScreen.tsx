import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { auth } from "../../services/firebase/firebase";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "PrivacyPolicy"
>;

const WHITE = "#FFFFFF";
const BACKGROUND = "#FFFEFA";
const FOREST = "#075C34";
const TEXT = "#17271D";
const MUTED = "#6D7B72";
const LIGHT_GREEN = "#EAF7EE";
const BORDER = "#E2ECE4";
const SUPPORT_EMAIL = "support@snapsort.ai";

export default function PrivacyPolicyScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();

  const userEmail =
    auth.currentUser?.email || "your account email";

  const handleEmailSupport = async () => {
    const subject = encodeURIComponent(
      "SnapSort AI privacy request"
    );

    const body = encodeURIComponent(
      `Hello SnapSort AI Support,\n\nI have a question about my privacy or account data.\n\nAccount email: ${userEmail}\n\n`
    );

    const emailUrl =
      `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    const canOpen = await Linking.canOpenURL(emailUrl);

    if (canOpen) {
      await Linking.openURL(emailUrl);
    }
  };

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(
              insets.top + 10,
              20
            ),
          },
        ]}
      >
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={21}
            color={TEXT}
          />
        </Pressable>

        <View style={styles.headerTitleRow}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons
              name="shield-lock-outline"
              size={16}
              color={FOREST}
            />
          </View>

          <Text style={styles.headerTitle}>
            Privacy policy
          </Text>
        </View>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(
              insets.bottom + 30,
              40
            ),
          },
        ]}
      >
        <Text style={styles.pageTitle}>
          Your privacy matters
        </Text>

        <Text style={styles.pageDescription}>
          This page explains how SnapSort AI handles your
          account information and scan-related data.
        </Text>

        <View style={styles.updatedCard}>
          <MaterialCommunityIcons
            name="calendar-check-outline"
            size={18}
            color={FOREST}
          />

          <View style={styles.updatedCopy}>
            <Text style={styles.updatedLabel}>
              LAST UPDATED
            </Text>

            <Text style={styles.updatedText}>
              August 29, 2026
            </Text>
          </View>
        </View>

        <PolicyItem
          number="01"
          title="Account information"
          text={`Your account may include your display name, email address, and profile photo. Your current account email is ${userEmail}.`}
        />

        <PolicyItem
          number="02"
          title="Photos and scans"
          text="Photos selected for scanning may be processed to identify items and provide disposal guidance. If you save results, they may appear in your account history."
        />

        <PolicyItem
          number="03"
          title="Why we use this information"
          text="We use account and scan information to provide app features, save your preferences, protect your account, and improve the quality of disposal guidance."
        />

        <PolicyItem
          number="04"
          title="Data storage and services"
          text="SnapSort AI uses Firebase services for account authentication. Data used by the app may be stored or processed using secure cloud services needed to operate the application."
        />

        <PolicyItem
          number="05"
          title="Your controls"
          text="You can change your profile photo, manage notifications, sign out of your account, and contact support if you have a privacy or account-data request."
        />

        <PolicyItem
          number="06"
          title="Changes to this policy"
          text="We may update this policy when app features or data practices change. The current version and update date will be available in the app."
        />

        <Pressable
          style={styles.supportCard}
          onPress={handleEmailSupport}
          accessibilityRole="button"
          accessibilityLabel="Email support about privacy"
        >
          <View style={styles.supportIcon}>
            <MaterialCommunityIcons
              name="email-outline"
              size={18}
              color={FOREST}
            />
          </View>

          <View style={styles.supportCopy}>
            <Text style={styles.supportTitle}>
              Contact privacy support
            </Text>

            <Text style={styles.supportText}>
              Ask a question or request help with your account data.
            </Text>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={MUTED}
          />
        </Pressable>

        <Text style={styles.footerText}>
          Replace the support email and have this privacy policy
          reviewed before publishing the final production app.
        </Text>
      </ScrollView>
    </View>
  );
}

function PolicyItem({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.policyItem}>
      <View style={styles.policyNumber}>
        <Text style={styles.policyNumberText}>
          {number}
        </Text>
      </View>

      <View style={styles.policyCopy}>
        <Text style={styles.policyTitle}>
          {title}
        </Text>

        <Text style={styles.policyText}>
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  header: {
    minHeight: 75,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: LIGHT_GREEN,
  },

  headerTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 15,
  },

  headerSpace: {
    width: 42,
    height: 42,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 26,
  },

  pageTitle: {
    fontFamily: "Poppins_700Bold",
    color: TEXT,
    fontSize: 24,
  },

  pageDescription: {
    maxWidth: 340,
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 5,
  },

  updatedCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    marginTop: 20,
    borderRadius: 18,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#CBE8D3",
  },

  updatedCopy: {
    marginLeft: 9,
  },

  updatedLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 8,
    letterSpacing: 1.1,
  },

  updatedText: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 10,
    marginTop: 2,
  },

  policyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 19,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  policyNumber: {
    width: 33,
    height: 33,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  policyNumberText: {
    fontFamily: "Poppins_700Bold",
    color: FOREST,
    fontSize: 9,
  },

  policyCopy: {
    flex: 1,
    marginLeft: 11,
  },

  policyTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 12,
  },

  policyText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 4,
  },

  supportCard: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginTop: 24,
    borderRadius: 20,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  supportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  supportCopy: {
    flex: 1,
    marginLeft: 10,
  },

  supportTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 11,
  },

  supportText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },

  footerText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    lineHeight: 14,
    textAlign: "center",
    marginTop: 20,
  },
});