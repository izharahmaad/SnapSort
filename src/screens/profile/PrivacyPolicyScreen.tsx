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
const CREAM = "#FFFEFA";
const FOREST = "#075C34";
const DEEP_FOREST = "#04331D";
const EMERALD = "#16824B";
const TEXT = "#17271D";
const MUTED = "#6D7B72";
const LIGHT_GREEN = "#EAF7EE";

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
              22
            ),
          },
        ]}
      >
        <View style={styles.topBar}>
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

          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <MaterialCommunityIcons
                name="leaf"
                size={14}
                color={FOREST}
              />
            </View>

            <Text style={styles.brandText}>
              SnapSort AI
            </Text>
          </View>

          <View style={styles.topSpace} />
        </View>

        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons
              name="shield-lock-outline"
              size={30}
              color={WHITE}
            />
          </View>

          <Text style={styles.headerTitle}>
            Privacy policy
          </Text>

          <Text style={styles.headerSubtitle}>
            How SnapSort AI handles and protects your information.
          </Text>
        </View>

        <View style={styles.headerLeafOne}>
          <MaterialCommunityIcons
            name="leaf"
            size={31}
            color="rgba(255,255,255,0.14)"
          />
        </View>

        <View style={styles.headerLeafTwo}>
          <MaterialCommunityIcons
            name="sprout"
            size={22}
            color="rgba(255,255,255,0.14)"
          />
        </View>
      </LinearGradient>

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
              August 28, 2026
            </Text>
          </View>
        </View>

        <Text style={styles.introText}>
          Your privacy matters to us. SnapSort AI only uses
          information that helps provide disposal guidance,
          save your scans, and improve your experience.
        </Text>

        <PolicySection
          number="01"
          icon="account-outline"
          title="Information we collect"
          text="We may collect basic account information such as your name, email address, and profile photo when you choose to provide them."
        />

        <PolicySection
          number="02"
          icon="camera-outline"
          title="Photos and scan results"
          text="When you scan an item, SnapSort AI may process the photo to identify the item and provide disposal guidance. Your saved scan history is linked to your account."
        />

        <PolicySection
          number="03"
          icon="chart-line"
          title="How we use information"
          text="We use your information to operate the app, show your scan history, improve accuracy, maintain account security, and support your sustainability journey."
        />

        <PolicySection
          number="04"
          icon="shield-check-outline"
          title="How we protect your data"
          text="We use reasonable safeguards to protect your account information. Keep your sign-in details private and sign out when using a shared device."
        />

        <PolicySection
          number="05"
          icon="share-variant-outline"
          title="When data is shared"
          text="We do not sell your personal information. Data may only be shared with trusted services that help operate SnapSort AI, such as authentication and cloud storage providers."
        />

        <PolicySection
          number="06"
          icon="delete-outline"
          title="Your choices"
          text="You can update your profile photo, review your scan history, sign out, or contact us if you need help with your account information."
        />

        <View style={styles.contactCard}>
          <View style={styles.contactIcon}>
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color={WHITE}
            />
          </View>

          <View style={styles.contactCopy}>
            <Text style={styles.contactTitle}>
              Questions about privacy?
            </Text>

            <Text style={styles.contactText}>
              Contact the SnapSort AI support team for help.
            </Text>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={FOREST}
          />
        </View>

        <Text style={styles.footerText}>
          This privacy policy is a general in-app summary.
          Your final production policy should be reviewed
          for your country and app-store requirements.
        </Text>
      </ScrollView>
    </View>
  );
}

function PolicySection({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];
  title: string;
  text: string;
}) {
  return (
    <View style={styles.policyCard}>
      <View style={styles.policyTopRow}>
        <View style={styles.policyNumber}>
          <Text style={styles.policyNumberText}>
            {number}
          </Text>
        </View>

        <View style={styles.policyIcon}>
          <MaterialCommunityIcons
            name={icon}
            size={18}
            color={FOREST}
          />
        </View>
      </View>

      <Text style={styles.policyTitle}>
        {title}
      </Text>

      <Text style={styles.policyText}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: CREAM,
  },

  header: {
    minHeight: 250,
    overflow: "hidden",
    paddingHorizontal: 20,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandIcon: {
    width: 29,
    height: 29,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
    marginRight: 7,
  },

  brandText: {
    fontFamily: "Poppins_600SemiBold",
    color: WHITE,
    fontSize: 11,
  },

  topSpace: {
    width: 43,
    height: 43,
  },

  headerContent: {
    alignItems: "center",
    marginTop: 22,
  },

  headerIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },

  headerTitle: {
    fontFamily: "Poppins_700Bold",
    color: WHITE,
    fontSize: 26,
    marginTop: 12,
  },

  headerSubtitle: {
    maxWidth: 290,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.81)",
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 3,
  },

  headerLeafOne: {
    position: "absolute",
    top: 122,
    right: 26,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  headerLeafTwo: {
    position: "absolute",
    bottom: 20,
    left: 33,
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },

  updatedCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 18,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#CDE9D5",
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
    marginBottom: 3,
  },

  policyCard: {
    padding: 16,
    marginTop: 12,
    borderRadius: 22,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: "#E3ECE5",
  },

  policyTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  policyNumber: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 11,
    backgroundColor: LIGHT_GREEN,
  },

  policyNumberText: {
    fontFamily: "Poppins_700Bold",
    color: FOREST,
    fontSize: 9,
  },

  policyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  policyTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 13,
    marginTop: 12,
  },

  policyText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 4,
  },

  contactCard: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginTop: 20,
    borderRadius: 22,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#C7E8D1",
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