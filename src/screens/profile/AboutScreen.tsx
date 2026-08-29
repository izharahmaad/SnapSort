import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Constants from "expo-constants";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "About"
>;

type IconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

const WHITE = "#FFFFFF";
const BACKGROUND = "#F8FBF8";
const FOREST = "#075C34";
const DARK_FOREST = "#053D23";
const TEXT = "#17271D";
const MUTED = "#6D7B72";
const LIGHT_GREEN = "#EAF7EE";
const PALE_GREEN = "#F1FAF3";
const LIGHT_GOLD = "#FFF3DB";
const GOLD = "#B97812";
const BORDER = "#E1EBE3";

const SUPPORT_EMAIL = "support@snapsort.ai";
const WEBSITE_URL = "https://snapsort.ai";

export default function AboutScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();

  const appVersion =
    Constants.expoConfig?.version || "1.0.0";

  const platformName =
    Platform.OS === "android"
      ? "Android"
      : Platform.OS === "ios"
      ? "iOS"
      : "Web";

  const buildNumber = getBuildNumber();

  const handleContactSupport = async () => {
    const subject = encodeURIComponent(
      "SnapSort AI support request"
    );

    const body = encodeURIComponent(
      [
        "Hello SnapSort AI Support,",
        "",
        "I need help with the app.",
        "",
        `App version: ${appVersion}`,
        `Build: ${buildNumber}`,
        `Platform: ${platformName}`,
        "",
        "Please describe your issue below:",
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

  const handleOpenWebsite = async () => {
    try {
      const canOpen =
        await Linking.canOpenURL(WEBSITE_URL);

      if (!canOpen) {
        Alert.alert(
          "Website unavailable",
          "Please try again later."
        );
        return;
      }

      await Linking.openURL(WEBSITE_URL);
    } catch {
      Alert.alert(
        "Website unavailable",
        "Please try again later."
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
          About SnapSort AI
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
        <View style={styles.introSection}>
          <View style={styles.brandMark}>
            <MaterialCommunityIcons
              name="leaf"
              size={29}
              color={WHITE}
            />
          </View>

          <Text style={styles.appName}>
            SnapSort AI
          </Text>

          <Text style={styles.tagline}>
            Clearer choices for everyday items.
          </Text>

          <View style={styles.versionBadge}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={13}
              color={FOREST}
            />

            <Text style={styles.versionText}>
              Version {appVersion}
            </Text>
          </View>
        </View>

        <View style={styles.overviewCard}>
          <View style={styles.overviewAccent} />

          <View style={styles.overviewContent}>
            <Text style={styles.overviewLabel}>
              OUR PURPOSE
            </Text>

            <Text style={styles.overviewTitle}>
              Better disposal starts with understanding.
            </Text>

            <Text style={styles.overviewText}>
              SnapSort AI helps you identify everyday items,
              understand useful disposal guidance, and build
              more sustainable habits over time.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>
          WHAT YOU CAN DO
        </Text>

        <View style={styles.card}>
          <FeatureRow
            icon="camera-outline"
            title="Scan everyday items"
            subtitle="Use your camera to identify items quickly."
            iconColor={FOREST}
            iconBackground={LIGHT_GREEN}
          />

          <Divider />

          <FeatureRow
            icon="recycle"
            title="Understand disposal guidance"
            subtitle="See practical next steps for the item you scanned."
            iconColor={FOREST}
            iconBackground={LIGHT_GREEN}
          />

          <Divider />

          <FeatureRow
            icon="history"
            title="Review scan history"
            subtitle="Return to saved scan results when you need them."
            iconColor={GOLD}
            iconBackground={LIGHT_GOLD}
          />
        </View>

        <Text style={styles.sectionLabel}>
          APPLICATION DETAILS
        </Text>

        <View style={styles.card}>
          <DetailRow
            icon="information-outline"
            title="App version"
            value={appVersion}
          />

          <Divider />

          <DetailRow
            icon="cellphone"
            title="Current platform"
            value={platformName}
          />

          <Divider />

          <DetailRow
            icon="source-branch"
            title="Build"
            value={buildNumber}
          />
        </View>

        <Text style={styles.sectionLabel}>
          HELP AND SUPPORT
        </Text>

        <View style={styles.card}>
          <Pressable
            style={({ pressed }) => [
              styles.actionRow,
              pressed && styles.pressedRow,
            ]}
            onPress={handleContactSupport}
            accessibilityRole="button"
            accessibilityLabel="Contact SnapSort AI support"
          >
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons
                name="email-outline"
                size={19}
                color={FOREST}
              />
            </View>

            <View style={styles.actionCopy}>
              <Text style={styles.actionTitle}>
                Contact support
              </Text>

              <Text style={styles.actionSubtitle}>
                Get help, report an issue, or send feedback.
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={MUTED}
            />
          </Pressable>

          <Divider />

          <Pressable
            style={({ pressed }) => [
              styles.actionRow,
              pressed && styles.pressedRow,
            ]}
            onPress={handleOpenWebsite}
            accessibilityRole="button"
            accessibilityLabel="Visit SnapSort AI website"
          >
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons
                name="web"
                size={19}
                color={FOREST}
              />
            </View>

            <View style={styles.actionCopy}>
              <Text style={styles.actionTitle}>
                Visit our website
              </Text>

              <Text style={styles.actionSubtitle}>
                Learn more about SnapSort AI.
              </Text>
            </View>

            <MaterialCommunityIcons
              name="open-in-new"
              size={18}
              color={MUTED}
            />
          </Pressable>
        </View>

        <View style={styles.missionCard}>
          <View style={styles.missionIcon}>
            <MaterialCommunityIcons
              name="earth"
              size={20}
              color={FOREST}
            />
          </View>

          <View style={styles.missionCopy}>
            <Text style={styles.missionLabel}>
              OUR MISSION
            </Text>

            <Text style={styles.missionText}>
              Make sustainable disposal easier to understand,
              easier to access, and easier to do.
            </Text>
          </View>
        </View>

        <Text style={styles.footerText}>
          © 2026 SnapSort AI. All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
}

function FeatureRow({
  icon,
  title,
  subtitle,
  iconColor,
  iconBackground,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  iconColor: string;
  iconBackground: string;
}) {
  return (
    <View style={styles.featureRow}>
      <View
        style={[
          styles.featureIcon,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={19}
          color={iconColor}
        />
      </View>

      <View style={styles.featureCopy}>
        <Text style={styles.featureTitle}>
          {title}
        </Text>

        <Text style={styles.featureSubtitle}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function DetailRow({
  icon,
  title,
  value,
}: {
  icon: IconName;
  title: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={FOREST}
        />
      </View>

      <View style={styles.detailCopy}>
        <Text style={styles.detailTitle}>
          {title}
        </Text>

        <Text style={styles.detailValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function getBuildNumber() {
  const androidBuild =
    Constants.expoConfig?.android?.versionCode;

  const iosBuild =
    Constants.expoConfig?.ios?.buildNumber;

  if (Platform.OS === "android" && androidBuild) {
    return String(androidBuild);
  }

  if (Platform.OS === "ios" && iosBuild) {
    return iosBuild;
  }

  return "Development";
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

  introSection: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 25,
  },

  brandMark: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FOREST,
    shadowColor: FOREST,
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },

  appName: {
    fontFamily: "Poppins_700Bold",
    color: TEXT,
    fontSize: 22,
    marginTop: 11,
  },

  tagline: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
  },

  versionBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 11,
    borderRadius: 13,
    backgroundColor: LIGHT_GREEN,
  },

  versionText: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 8,
    marginLeft: 4,
  },

  overviewCard: {
    position: "relative",
    overflow: "hidden",
    minHeight: 145,
    borderRadius: 23,
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

  overviewContent: {
    paddingHorizontal: 20,
    paddingVertical: 19,
  },

  overviewLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 8,
    letterSpacing: 1.2,
  },

  overviewTitle: {
    fontFamily: "Poppins_700Bold",
    color: TEXT,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 6,
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

  card: {
    paddingHorizontal: 14,
    borderRadius: 21,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  featureRow: {
    minHeight: 73,
    flexDirection: "row",
    alignItems: "center",
  },

  featureIcon: {
    width: 41,
    height: 41,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  featureCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  featureTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 10,
  },

  featureSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },

  detailRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
  },

  detailIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  detailCopy: {
    flex: 1,
    marginLeft: 10,
  },

  detailTitle: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
  },

  detailValue: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 10,
    marginTop: 2,
  },

  actionRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
  },

  pressedRow: {
    opacity: 0.65,
  },

  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  actionCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  actionTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 10,
  },

  actionSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    marginTop: 2,
  },

  divider: {
    height: 1,
    marginLeft: 51,
    backgroundColor: "#E7EEE8",
  },

  missionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginTop: 24,
    borderRadius: 21,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#CBE8D3",
  },

  missionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },

  missionCopy: {
    flex: 1,
    marginLeft: 10,
  },

  missionLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 8,
    letterSpacing: 1.1,
  },

  missionText: {
    fontFamily: "Poppins_500Medium",
    color: FOREST,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 3,
  },

  footerText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    textAlign: "center",
    marginTop: 21,
  },
});