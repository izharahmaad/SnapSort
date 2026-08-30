import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Alert,
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
const BACKGROUND = "#F8FBF8";
const FOREST = "#075C34";
const DARK_FOREST = "#053D23";
const TEXT = "#17271D";
const MUTED = "#6D7B72";
const LIGHT_GREEN = "#EAF7EE";
const PALE_GREEN = "#F1FAF3";
const BORDER = "#E1EBE3";

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
      [
        "Hello SnapSort AI Support,",
        "",
        "I have a question about privacy or account data.",
        "",
        `Account email: ${userEmail}`,
        "",
        "Please describe your request below:",
        "",
      ].join("\n")
    );

    const emailUrl =
      `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    try {
      const canOpen = await Linking.canOpenURL(emailUrl);

      if (!canOpen) {
        Alert.alert(
          "Email app unavailable",
          `Please contact us at ${SUPPORT_EMAIL}.`
        );
        return;
      }

      await Linking.openURL(emailUrl);
    } catch {
      Alert.alert(
        "Could not open email",
        `Please contact us at ${SUPPORT_EMAIL}.`
      );
    }
  };

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.topNavigation,
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
            color={DARK_FOREST}
          />
        </Pressable>

        <Text style={styles.navigationTitle}>
          Privacy policy
        </Text>

        <View style={styles.navigationSpace} />
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
        <View style={styles.heroSection}>
          <View style={styles.heroIconRing}>
            <View style={styles.heroIcon}>
              <MaterialCommunityIcons
                name="shield-lock-outline"
                size={25}
                color={WHITE}
              />
            </View>
          </View>

          <Text style={styles.pageTitle}>
            Your privacy matters
          </Text>

          <Text style={styles.pageDescription}>
            Understand how SnapSort AI handles account
            information and scan-related data.
          </Text>
        </View>

        <View style={styles.updatedCard}>
          <View style={styles.updatedIcon}>
            <MaterialCommunityIcons
              name="calendar-check-outline"
              size={18}
              color={FOREST}
            />
          </View>

          <View style={styles.updatedCopy}>
            <Text style={styles.updatedLabel}>
              LAST UPDATED
            </Text>

            <Text style={styles.updatedDate}>
              August 30, 2026
            </Text>
          </View>
        </View>

        <View style={styles.overviewCard}>
          <View style={styles.overviewAccent} />

          <View style={styles.overviewCopy}>
            <Text style={styles.overviewLabel}>
              PRIVACY AT A GLANCE
            </Text>

            <Text style={styles.overviewTitle}>
              Your information supports your experience.
            </Text>

            <Text style={styles.overviewText}>
              SnapSort AI uses the information needed to provide
              app features, protect your account, and improve
              disposal guidance.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>
          HOW YOUR DATA IS USED
        </Text>

        <View style={styles.policyCard}>
          <PolicyItem
            number="01"
            title="Account information"
            text={`Your account may include your display name, email address, and profile photo. Your current signed-in account is ${userEmail}.`}
          />

          <Divider />

          <PolicyItem
            number="02"
            title="Photos and scans"
            text="Photos selected for scans may be processed to identify an item and provide disposal guidance. Saved results may appear in your scan history."
          />

          <Divider />

          <PolicyItem
            number="03"
            title="Why information is used"
            text="Account and scan information helps provide app features, save preferences, protect your account, and improve your SnapSort experience."
          />

          <Divider />

          <PolicyItem
            number="04"
            title="Data storage"
            text="SnapSort AI uses Firebase services for user authentication. App data may be processed or stored by secure services required to operate the application."
          />

          <Divider />

          <PolicyItem
            number="05"
            title="Your controls"
            text="You can update your profile photo, control notifications, sign out, and contact support if you have questions about account information."
          />

          <Divider />

          <PolicyItem
            number="06"
            title="Policy changes"
            text="This policy may be updated when app features or data practices change. The newest version will be available in the app."
          />
        </View>

        <Text style={styles.sectionLabel}>
          NEED HELP?
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.supportCard,
            pressed && styles.pressedCard,
          ]}
          onPress={handleEmailSupport}
          accessibilityRole="button"
          accessibilityLabel="Email privacy support"
        >
          <View style={styles.supportIcon}>
            <MaterialCommunityIcons
              name="email-outline"
              size={19}
              color={FOREST}
            />
          </View>

          <View style={styles.supportCopy}>
            <Text style={styles.supportTitle}>
              Contact privacy support
            </Text>

            <Text style={styles.supportText}>
              Ask a question or request help with account data.
            </Text>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={MUTED}
          />
        </Pressable>

        <View style={styles.noteCard}>
          <MaterialCommunityIcons
            name="information-outline"
            size={18}
            color={FOREST}
          />

          <Text style={styles.noteText}>
            This is an in-app privacy summary. Use a reviewed
            legal privacy policy before releasing your app publicly.
          </Text>
        </View>

        <Text style={styles.footerText}>
          © 2026 SnapSort AI. All rights reserved.
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

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  topNavigation: {
    minHeight: 75,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: BACKGROUND,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  navigationTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 14,
  },

  navigationSpace: {
    width: 42,
    height: 42,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  heroSection: {
    alignItems: "center",
    paddingTop: 15,
    paddingBottom: 24,
  },

  heroIconRing: {
    width: 67,
    height: 67,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D7F0DE",
  },

  heroIcon: {
    width: 53,
    height: 53,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FOREST,
  },

  pageTitle: {
    fontFamily: "Poppins_700Bold",
    color: TEXT,
    fontSize: 22,
    marginTop: 12,
  },

  pageDescription: {
    maxWidth: 300,
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 4,
  },

  updatedCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderRadius: 20,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  updatedIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  updatedCopy: {
    marginLeft: 10,
  },

  updatedLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 8,
    letterSpacing: 1.1,
  },

  updatedDate: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 10,
    marginTop: 2,
  },

  overviewCard: {
    position: "relative",
    overflow: "hidden",
    minHeight: 139,
    marginTop: 14,
    borderRadius: 22,
    backgroundColor: PALE_GREEN,
    borderWidth: 1,
    borderColor: "#D8ECDD",
  },

  overviewAccent: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 5,
    backgroundColor: FOREST,
  },

  overviewCopy: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },

  overviewLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 8,
    letterSpacing: 1.1,
  },

  overviewTitle: {
    fontFamily: "Poppins_700Bold",
    color: TEXT,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 5,
  },

  overviewText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },

  sectionLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 9,
    letterSpacing: 1.2,
    marginTop: 27,
    marginBottom: 9,
    marginLeft: 2,
  },

  policyCard: {
    paddingHorizontal: 14,
    borderRadius: 21,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  policyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 17,
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
    minWidth: 0,
    marginLeft: 11,
  },

  policyTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 11,
  },

  policyText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    lineHeight: 15,
    marginTop: 3,
  },

  divider: {
    height: 1,
    marginLeft: 44,
    backgroundColor: "#E7EEE8",
  },

  supportCard: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    borderRadius: 21,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  pressedCard: {
    opacity: 0.67,
  },

  supportIcon: {
    width: 41,
    height: 41,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  supportCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  supportTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 10,
  },

  supportText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },

  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    marginTop: 15,
    borderRadius: 19,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#CBE8D3",
  },

  noteText: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    color: FOREST,
    fontSize: 9,
    lineHeight: 15,
    marginLeft: 8,
  },

  footerText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    textAlign: "center",
    marginTop: 20,
  },
});