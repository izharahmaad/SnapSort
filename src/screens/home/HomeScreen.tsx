import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../constants/theme";
import { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 24),
          paddingBottom: Math.max(insets.bottom, 24),
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>SnapSort</Text>
          <Text style={styles.tagline}>
            Scan. Sort. Reuse smarter.
          </Text>
        </View>

        <Button
          mode="text"
          icon="account-circle-outline"
          compact
          textColor={colors.primary}
          onPress={() => navigation.navigate("Profile")}
          contentStyle={styles.profileButtonContent}
          labelStyle={styles.profileButtonLabel}
        >
          Profile
        </Button>
      </View>

      <LinearGradient
        colors={[colors.primary, "#4AA66D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroDecorationOne} />
        <View style={styles.heroDecorationTwo} />

        <View style={styles.heroTextContainer}>
          <Text style={styles.heroBadge}>SMART ITEM SCANNER</Text>

          <Text style={styles.heroTitle}>
            What are you holding? 🌿
          </Text>

          <Text style={styles.heroDescription}>
            Take a photo of an everyday item and discover whether
            you can recycle, reuse, donate, sell, or safely dispose
            of it.
          </Text>
        </View>

        <Button
          mode="contained"
          icon="camera-outline"
          buttonColor="#FFFFFF"
          textColor={colors.primary}
          contentStyle={styles.scanButton}
          labelStyle={styles.scanButtonLabel}
          onPress={() => navigation.navigate("Camera")}
        >
          Scan an item
        </Button>
      </LinearGradient>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your progress</Text>

        <Button
          mode="text"
          compact
          textColor={colors.primary}
          onPress={() => navigation.navigate("History")}
        >
          View history
        </Button>
      </View>

      <Card style={styles.challengeCard}>
        <Card.Content>
          <View style={styles.challengeTopRow}>
            <View style={styles.challengeIcon}>
              <Text style={styles.challengeEmoji}>🌱</Text>
            </View>

            <View style={styles.challengeTextContainer}>
              <Text style={styles.cardTitle}>
                Today&apos;s mini challenge
              </Text>

              <Text style={styles.cardText}>
                Find one item you can reuse before throwing it away.
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={styles.progressValue} />
          </View>

          <View style={styles.progressFooter}>
            <Text style={styles.progressText}>
              0 of 1 completed
            </Text>

            <Text style={styles.progressPercent}>0%</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.tipCard}>
        <Card.Content>
          <View style={styles.tipHeader}>
            <View style={styles.tipIcon}>
              <Text style={styles.tipEmoji}>💡</Text>
            </View>

            <Text style={styles.tipTitle}>Quick tip</Text>
          </View>

          <Text style={styles.tipText}>
            Keep batteries, medicines, chemicals, and electronics
            out of regular household trash.
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick actions</Text>

        <View style={styles.actionRow}>
          <Button
            mode="outlined"
            icon="history"
            textColor={colors.primary}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
            onPress={() => navigation.navigate("History")}
          >
            Scan history
          </Button>

          <Button
            mode="outlined"
            icon="camera-plus-outline"
            textColor={colors.primary}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
            onPress={() => navigation.navigate("Camera")}
          >
            New scan
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  logo: {
    fontFamily: "Poppins_700Bold",
    fontSize: 30,
    color: colors.text,
  },
  tagline: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: colors.muted,
    marginTop: 2,
  },
  profileButtonContent: {
    paddingHorizontal: 0,
  },
  profileButtonLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
  },
  heroCard: {
    minHeight: 280,
    borderRadius: 26,
    padding: 22,
    justifyContent: "space-between",
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#155C34",
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 7,
    },
  },
  heroDecorationOne: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    right: -50,
    top: -50,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  heroDecorationTwo: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    left: -45,
    bottom: -40,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  heroTextContainer: {
    gap: 14,
  },
  heroBadge: {
    alignSelf: "flex-start",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 10,
    letterSpacing: 1.2,
    color: "#D8FFE4",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
  },
  heroTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
    lineHeight: 31,
    color: "#FFFFFF",
  },
  heroDescription: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    lineHeight: 22,
    color: "#ECFFF1",
  },
  scanButton: {
    height: 52,
  },
  scanButtonLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 17,
  },
  challengeCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  challengeTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  challengeIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
    marginRight: 12,
  },
  challengeEmoji: {
    fontSize: 25,
  },
  challengeTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 15,
  },
  cardText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    marginTop: 4,
    lineHeight: 19,
    fontSize: 13,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    marginTop: 18,
    overflow: "hidden",
  },
  progressValue: {
    width: "5%",
    height: "100%",
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  progressFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 7,
  },
  progressText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 11,
  },
  progressPercent: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 11,
  },
  tipCard: {
    backgroundColor: colors.warningBackground,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.warningBorder,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  tipIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFECC7",
  },
  tipEmoji: {
    fontSize: 18,
  },
  tipTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.warningText,
    fontSize: 16,
  },
  tipText: {
    fontFamily: "Poppins_400Regular",
    color: colors.warningText,
    marginTop: 9,
    lineHeight: 20,
    fontSize: 13,
  },
  quickActions: {
    marginTop: 22,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    borderColor: colors.primary,
  },
  actionButtonContent: {
    height: 48,
  },
});