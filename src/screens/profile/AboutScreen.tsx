import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Alert,
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

export default function AboutScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();

  const handleSupport = () => {
    Alert.alert(
      "Contact support",
      "Add your real support email or support form link here before publishing the app."
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
            size={22}
            color={TEXT}
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          About
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
        <View style={styles.introBlock}>
          <View style={styles.introIcon}>
            <MaterialCommunityIcons
              name="leaf"
              size={29}
              color={FOREST}
            />
          </View>

          <Text style={styles.pageTitle}>
            SnapSort AI
          </Text>

          <Text style={styles.versionText}>
            Version 1.0.0
          </Text>
        </View>

        <Text style={styles.description}>
          SnapSort AI helps you make better decisions about
          everyday items. Scan an item, understand the right
          disposal approach, and build more sustainable habits
          one step at a time.
        </Text>

        <Text style={styles.sectionLabel}>
          WHAT WE DO
        </Text>

        <View style={styles.card}>
          <FeatureRow
            icon="camera-outline"
            title="Identify everyday items"
            subtitle="Use your camera to scan and identify items."
            color={FOREST}
            background={LIGHT_GREEN}
          />

          <Divider />

          <FeatureRow
            icon="recycle"
            title="Support better disposal"
            subtitle="Get simple guidance for smarter choices."
            color={FOREST}
            background={LIGHT_GREEN}
          />

          <Divider />

          <FeatureRow
            icon="sprout"
            title="Build sustainable habits"
            subtitle="Turn everyday actions into positive impact."
            color={GOLD}
            background={LIGHT_GOLD}
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
            title="Account protection"
            value="Firebase authentication"
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
            Our goal is simple: make sustainable disposal
            easier to understand and easier to do.
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
  color,
  background,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  color: string;
  background: string;
}) {
  return (
    <View style={styles.featureRow}>
      <View
        style={[
          styles.featureIcon,
          {
            backgroundColor: background,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={19}
          color={color}
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
    paddingTop: 28,
  },

  introBlock: {
    alignItems: "center",
  },

  introIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  pageTitle: {
    fontFamily: "Poppins_700Bold",
    color: TEXT,
    fontSize: 24,
    marginTop: 12,
  },

  versionText: {
    fontFamily: "Poppins_500Medium",
    color: MUTED,
    fontSize: 10,
    marginTop: 2,
  },

  description: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 21,
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