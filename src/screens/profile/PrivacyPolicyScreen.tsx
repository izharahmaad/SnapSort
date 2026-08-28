import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
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
            size={22}
            color={TEXT}
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Privacy policy
        </Text>

        <View style={styles.headerSpace} />
      </View>

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
        <Text style={styles.pageTitle}>
          Your privacy matters
        </Text>

        <Text style={styles.pageDescription}>
          This policy explains what information SnapSort AI
          uses, why we use it, and the choices you have.
        </Text>

        <View style={styles.updatedCard}>
          <MaterialCommunityIcons
            name="calendar-check-outline"
            size={18}
            color={FOREST}
          />

          <View style={styles.updatedText}>
            <Text style={styles.updatedLabel}>
              LAST UPDATED
            </Text>

            <Text style={styles.updatedDate}>
              August 29, 2026
            </Text>
          </View>
        </View>

        <PolicySection
          number="01"
          title="Information we collect"
          text="When you use SnapSort AI, we may collect account details such as your name, email address, and profile photo. We may also collect app activity related to scans and saved results."
        />

        <PolicySection
          number="02"
          title="Photos and scan results"
          text="Photos you select or scan may be processed to identify an item and provide disposal guidance. Your scan history may be stored with your account when you choose to save it."
        />

        <PolicySection
          number="03"
          title="How we use your information"
          text="We use your information to provide app features, maintain account security, improve disposal guidance, save your preferences, and support your use of SnapSort AI."
        />

        <PolicySection
          number="04"
          title="Data sharing"
          text="We do not sell personal information. We may use trusted service providers for services such as authentication, cloud storage, analytics, and app infrastructure."
        />

        <PolicySection
          number="05"
          title="Your choices"
          text="You can update your profile information, manage notification preferences, sign out of your account, and contact support if you need help with your information."
        />

        <PolicySection
          number="06"
          title="Changes to this policy"
          text="We may update this policy when SnapSort AI changes. The latest version will always be available in the app, along with the date it was last updated."
        />

        <View style={styles.contactCard}>
          <View style={styles.contactIcon}>
            <MaterialCommunityIcons
              name="email-outline"
              size={19}
              color={WHITE}
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
          This page is an in-app privacy summary. Your final
          published policy should be reviewed for your legal,
          country, and app-store requirements.
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
    minHeight: 70,
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
    maxWidth: 330,
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

  updatedText: {
    marginLeft: 9,
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
    backgroundColor: FOREST,
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