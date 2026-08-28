import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Alert,
  Linking,
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
const BACKGROUND = "#FFFEFA";
const FOREST = "#075C34";
const TEXT = "#17271D";
const MUTED = "#6D7B72";
const LIGHT_GREEN = "#EAF7EE";
const LIGHT_GOLD = "#FFF3DB";
const GOLD = "#C98718";
const BORDER = "#E2ECE4";
const SUPPORT_EMAIL = "support@snapsort.ai";

export default function AboutScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();

  const appVersion =
    Constants.expoConfig?.version || "1.0.0";

  const handleContactSupport = async () => {
    const subject = encodeURIComponent(
      "SnapSort AI support request"
    );

    const body = encodeURIComponent(
      `Hello SnapSort AI Support,\n\nI need help with the app.\n\nApp version: ${appVersion}\n\n`
    );

    const emailUrl =
      `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    const canOpen = await Linking.canOpenURL(emailUrl);

    if (canOpen) {
      await Linking.openURL(emailUrl);
      return;
    }

    Alert.alert(
      "Email app unavailable",
      `Please contact us at ${SUPPORT_EMAIL}.`
    );
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
              name="information-outline"
              size={16}
              color={FOREST}
            />
          </View>

          <Text style={styles.headerTitle}>
            About
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
        <View style={styles.appCard}>
          <View style={styles.appIcon}>
            <MaterialCommunityIcons
              name="leaf"
              size={25}
              color={FOREST}
            />
          </View>

          <View style={styles.appCopy}>
            <Text style={styles.appName}>
              SnapSort AI
            </Text>

            <Text style={styles.appVersion}>
              Version {appVersion}
            </Text>
          </View>
        </View>

        <Text style={styles.pageTitle}>
          Better disposal starts here.
        </Text>

        <Text style={styles.pageDescription}>
          SnapSort AI helps you identify everyday items and
          make clearer, more responsible disposal decisions.
        </Text>

        <Text style={styles.sectionLabel}>
          APP FEATURES
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
            title="Get disposal guidance"
            subtitle="Understand practical next steps for an item."
            iconColor={FOREST}
            iconBackground={LIGHT_GREEN}
          />

          <Divider />

          <FeatureRow
            icon="history"
            title="Review scan history"
            subtitle="Return to previous scan results when needed."
            iconColor={GOLD}
            iconBackground={LIGHT_GOLD}
          />
        </View>

        <Text style={styles.sectionLabel}>
          APP INFORMATION
        </Text>

        <View style={styles.card}>
          <InfoRow
            icon="information-outline"
            title="Version"
            value={appVersion}
          />

          <Divider />

          <InfoRow
            icon="cellphone"
            title="Platform"
            value={Constants.platform?.ios
              ? "iOS"
              : Constants.platform?.android
              ? "Android"
              : "Expo"}
          />

          <Divider />

          <Pressable
            style={styles.supportRow}
            onPress={handleContactSupport}
            accessibilityRole="button"
            accessibilityLabel="Contact SnapSort AI support"
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
                Contact support
              </Text>

              <Text style={styles.supportSubtitle}>
                Questions, feedback, or technical help
              </Text>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={MUTED}
            />
          </Pressable>
        </View>

        <View style={styles.missionCard}>
          <MaterialCommunityIcons
            name="earth"
            size={20}
            color={FOREST}
          />

          <Text style={styles.missionText}>
            Our goal is to make sustainable disposal easier
            to understand and easier to do.
          </Text>
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

function InfoRow({
  icon,
  title,
  value,
}: {
  icon: IconName;
  title: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={FOREST}
        />
      </View>

      <View style={styles.infoCopy}>
        <Text style={styles.infoTitle}>
          {title}
        </Text>

        <Text style={styles.infoValue}>
          {value}
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

  appCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 20,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  appIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  appCopy: {
    marginLeft: 11,
  },

  appName: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 13,
  },

  appVersion: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    marginTop: 2,
  },

  pageTitle: {
    fontFamily: "Poppins_700Bold",
    color: TEXT,
    fontSize: 23,
    marginTop: 22,
  },

  pageDescription: {
    maxWidth: 335,
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 11,
    lineHeight: 18,
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
    borderRadius: 20,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  featureRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
  },

  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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

  infoRow: {
    minHeight: 63,
    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  infoCopy: {
    flex: 1,
    marginLeft: 10,
  },

  infoTitle: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
  },

  infoValue: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 10,
    marginTop: 2,
  },

  supportRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
  },

  supportIcon: {
    width: 39,
    height: 39,
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
    fontSize: 10,
  },

  supportSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    marginTop: 2,
  },

  divider: {
    height: 1,
    marginLeft: 49,
    backgroundColor: "#E7EEE8",
  },

  missionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginTop: 24,
    borderRadius: 19,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#CBE8D3",
  },

  missionText: {
    flex: 1,
    fontFamily: "Poppins_500Medium",
    color: FOREST,
    fontSize: 10,
    lineHeight: 16,
    marginLeft: 9,
  },

  footerText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    textAlign: "center",
    marginTop: 20,
  },
});