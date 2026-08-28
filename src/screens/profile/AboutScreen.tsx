import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Alert,
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
  "About"
>;

type IconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

const WHITE = "#FFFFFF";
const BACKGROUND = "#FFFEFA";
const FOREST = "#075C34";
const DEEP_FOREST = "#04331D";
const EMERALD = "#16824B";
const TEXT = "#17271D";
const MUTED = "#6D7B72";
const LIGHT_GREEN = "#EAF7EE";
const LIGHT_GOLD = "#FFF3DB";
const GOLD = "#C98718";
const BORDER = "#E2ECE4";

export default function AboutScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();

  const handleSupport = () => {
    Alert.alert(
      "Contact support",
      "Add your real support email address or support link here before publishing the app."
    );
  };

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
            About
          </Text>

          <View style={styles.headerSpace} />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.headerEyebrow}>
            SNAPSort AI
          </Text>

          <Text style={styles.headerDescription}>
            A simpler way to make smarter everyday disposal choices.
          </Text>
        </View>

        <MaterialCommunityIcons
          name="leaf"
          size={78}
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
        <View style={styles.appCard}>
          <View style={styles.appIcon}>
            <MaterialCommunityIcons
              name="leaf"
              size={26}
              color={FOREST}
            />
          </View>

          <View style={styles.appCopy}>
            <Text style={styles.appName}>
              SnapSort AI
            </Text>

            <Text style={styles.appVersion}>
              Version 1.0.0
            </Text>
          </View>
        </View>

        <Text style={styles.description}>
          SnapSort AI helps you understand what to do with
          everyday items. Scan an item, review disposal
          guidance, and make more sustainable choices over time.
        </Text>

        <Text style={styles.sectionLabel}>
          WHAT WE HELP WITH
        </Text>

        <View style={styles.card}>
          <FeatureRow
            icon="camera-outline"
            title="Smart item scans"
            subtitle="Identify everyday items with your camera."
            iconColor={FOREST}
            iconBackground={LIGHT_GREEN}
          />

          <Divider />

          <FeatureRow
            icon="recycle"
            title="Disposal guidance"
            subtitle="Receive simple suggestions for responsible disposal."
            iconColor={FOREST}
            iconBackground={LIGHT_GREEN}
          />

          <Divider />

          <FeatureRow
            icon="sprout"
            title="Better daily habits"
            subtitle="Build practical sustainable habits one action at a time."
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
            title="App version"
            value="1.0.0"
          />

          <Divider />

          <InfoRow
            icon="shield-check-outline"
            title="Authentication"
            value="Firebase connected"
          />

          <Divider />

          <Pressable
            style={styles.supportRow}
            onPress={handleSupport}
            accessibilityRole="button"
            accessibilityLabel="Contact support"
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
                Questions, feedback, or account help
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
            size={21}
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
    right: -9,
    bottom: -14,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
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

  description: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 20,
  },

  sectionLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 9,
    letterSpacing: 1.2,
    marginTop: 26,
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