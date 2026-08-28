import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "PrivacyPolicy"
>;

const WHITE = "#FFFFFF";
const BACKGROUND = "#FFFEFA";
const FOREST = "#075C34";
const DEEP_FOREST = "#04331D";
const EMERALD = "#16824B";
const TEXT = "#17271D";
const MUTED = "#6D7B72";
const LIGHT_GREEN = "#EAF7EE";
const BORDER = "#E2ECE4";

export default function PrivacyPolicyScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[DEEP_FOREST, FOREST, EMERALD]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
        <View style={styles.headerTopRow}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={21}
              color={WHITE}
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Privacy policy
          </Text>

          <View style={styles.headerSpace} />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.headerEyebrow}>
            YOUR INFORMATION
          </Text>

          <Text style={styles.headerDescription}>
            Learn how SnapSort AI uses and protects your account information.
          </Text>
        </View>

        <MaterialCommunityIcons
          name="shield-lock-outline"
          size={74}
          color="rgba(255,255,255,0.10)"
          style={styles.headerIcon}
        />
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(
              insets.bottom + 28,
              36
            ),
          },
        ]}
      >
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
              August 29, 2026
            </Text>
          </View>
        </View>

        <Text style={styles.introText}>
          Your privacy matters to us. This policy explains
          what information SnapSort AI may use, why we use it,
          and the choices available to you.
        </Text>

        <PolicySection
          number="01"
          title="Information we collect"
          text="We may collect account information such as your name, email address, and profile photo. We may also collect information connected to your use of scans and saved results."
        />

        <PolicySection
          number="02"
          title="Photos and scan results"
          text="Photos you select or scan may be processed to identify items and provide disposal guidance. Saved scan results may remain linked to your account."
        />

        <PolicySection
          number="03"
          title="How we use information"
          text="Your information helps us provide app features, save preferences, protect your account, improve guidance, and support your use of SnapSort AI."
        />

        <PolicySection
          number="04"
          title="Data sharing"
          text="SnapSort AI does not sell your personal information. We may use trusted providers for services such as authentication, cloud storage, analytics, and app infrastructure."
        />

        <PolicySection
          number="05"
          title="Your choices"
          text="You can update profile information, manage notification preferences, sign out, and contact support if you need help with your account information."
        />

        <PolicySection
          number="06"
          title="Policy changes"
          text="We may update this privacy policy as SnapSort AI changes. The latest version and its last-updated date will remain available in the app."
        />

        <View style={styles.contactCard}>
          <View style={styles.contactIcon}>
            <MaterialCommunityIcons
              name="email-outline"
              size={19}
              color={FOREST}
            />
          </View>

          <View style={styles.contactCopy}>
            <Text style={styles.contactTitle}>
              Privacy questions?
            </Text>

            <Text style={styles.contactText}>
              Contact support if you need help with your account data.
            </Text>
          </View>
        </View>

        <Text style={styles.footerText}>
          This is an in-app privacy summary. Your final policy
          should be reviewed for legal and app-store requirements.
        </Text>
      </ScrollView>
    </View>
  );
}

function PolicySection({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.policySection}>
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
    minHeight: 165,
    overflow: "hidden",
    paddingHorizontal: 20,
  },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },

  headerTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: WHITE,
    fontSize: 15,
  },

  headerSpace: {
    width: 42,
    height: 42,
  },

  headerContent: {
    maxWidth: 275,
    marginTop: 20,
  },

  headerEyebrow: {
    fontFamily: "Poppins_600SemiBold",
    color: "#D7F8E1",
    fontSize: 8,
    letterSpacing: 1.2,
  },

  headerDescription: {
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.82)",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },

  headerIcon: {
    position: "absolute",
    right: -8,
    bottom: -11,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },

  updatedCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderRadius: 18,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#CBE8D3",
  },

  updatedIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
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

  introText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 20,
  },

  policySection: {
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

  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginTop: 24,
    borderRadius: 20,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  contactIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  contactCopy: {
    flex: 1,
    marginLeft: 10,
  },

  contactTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 11,
  },

  contactText: {
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