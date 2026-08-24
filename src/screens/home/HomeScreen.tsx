import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Button, Card, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../constants/theme";
import { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../stores/auth.store";
import {
  getUserScans,
} from "../../services/firebase/scans.service";
import type {
  DisposalCategory,
  ScanRecord,
} from "../../types/scan";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Home"
>;

type CategoryCard = {
  category: DisposalCategory;
  icon: string;
  label: string;
  description: string;
  color: string;
  background: string;
};

const categoryCards: CategoryCard[] = [
  {
    category: "recycle",
    icon: "recycle",
    label: "Recycle",
    description: "Give materials another life",
    color: "#287A4A",
    background: "#E4F6E9",
  },
  {
    category: "reuse",
    icon: "refresh",
    label: "Reuse",
    description: "Find a second purpose",
    color: "#B36D12",
    background: "#FFF0D5",
  },
  {
    category: "compost",
    icon: "leaf",
    label: "Compost",
    description: "Return nutrients to soil",
    color: "#7A633A",
    background: "#F1E9D5",
  },
  {
    category: "trash",
    icon: "delete-outline",
    label: "Dispose",
    description: "Choose the safer option",
    color: "#59636B",
    background: "#EAEFF1",
  },
];

function getFirstName(
  displayName: string | null | undefined
): string {
  const cleanName = displayName?.trim();

  if (!cleanName) return "there";

  return cleanName.split(/\s+/)[0];
}

function getScore(scan: ScanRecord): number {
  return Math.max(
    0,
    Math.min(10, Number(scan.ecoScore) || 0)
  );
}

function getDateLabel(value: unknown): string {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate().toLocaleDateString();
  }

  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  if (typeof value === "string") {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString();
    }
  }

  return "Recently";
}

export default function HomeScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);

  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const firstName = getFirstName(user?.displayName);

  const loadScans = useCallback(
    async (refresh = false) => {
      if (!user) {
        setScans([]);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      try {
        if (refresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const records = await getUserScans(user.uid);
        setScans(records);
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Could not load your scan data.";

        Alert.alert("Could not load dashboard", message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [user]
  );

  useEffect(() => {
    loadScans();
  }, [loadScans]);

  const averageScore = useMemo(() => {
    if (scans.length === 0) return "0.0";

    const total = scans.reduce(
      (sum, scan) => sum + getScore(scan),
      0
    );

    return (total / scans.length).toFixed(1);
  }, [scans]);

  const recentScans = scans.slice(0, 2);

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="account-lock-outline"
          size={56}
          color={colors.primary}
        />

        <Text style={styles.emptyTitle}>
          Sign in to continue
        </Text>

        <Text style={styles.emptyText}>
          Your personalized sustainability dashboard is
          waiting for you.
        </Text>

        <Button
          mode="contained"
          icon="login"
          onPress={() => navigation.navigate("Login")}
        >
          Sign in
        </Button>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.emptyText}>
          Preparing your dashboard...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom + 18, 30),
        },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => loadScans(true)}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.greeting}>
            Good day, {firstName} 🌿
          </Text>

          <Text style={styles.headerSubtitle}>
            Ready to make a smarter choice?
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
        colors={[colors.primary, "#4AA66D", "#75B987"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroCircleOne} />
        <View style={styles.heroCircleTwo} />
        <View style={styles.heroLeaf}>
          <MaterialCommunityIcons
            name="leaf"
            size={22}
            color="rgba(255,255,255,0.6)"
          />
        </View>

        <View style={styles.heroTopRow}>
          <View style={styles.heroBadge}>
            <MaterialCommunityIcons
              name="sparkles"
              size={13}
              color="#D9FFE4"
            />

            <Text style={styles.heroBadgeText}>
              AI-POWERED SCANNING
            </Text>
          </View>

          <View style={styles.heroCameraIcon}>
            <MaterialCommunityIcons
              name="camera-outline"
              size={24}
              color="#FFFFFF"
            />
          </View>
        </View>

        <Text style={styles.heroTitle}>
          What are you holding?
        </Text>

        <Text style={styles.heroDescription}>
          Snap an everyday item and get clear guidance on how
          to recycle, reuse, compost, or dispose of it.
        </Text>

        <Button
          mode="contained"
          icon="camera-outline"
          buttonColor="#FFFFFF"
          textColor={colors.primary}
          onPress={() => navigation.navigate("Camera")}
          contentStyle={styles.scanButton}
          labelStyle={styles.scanButtonLabel}
          style={styles.scanButtonWrapper}
        >
          Scan an item
        </Button>
      </LinearGradient>

      <View style={styles.statsRow}>
        <StatCard
          icon="barcode-scan"
          value={String(scans.length)}
          label="Total scans"
        />

        <StatCard
          icon="leaf"
          value={averageScore}
          label="Average score"
        />
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Your impact
          </Text>

          <Text style={styles.sectionSubtitle}>
            Every small decision adds up.
          </Text>
        </View>

        <Button
          mode="text"
          compact
          textColor={colors.primary}
          onPress={() => navigation.navigate("History")}
          labelStyle={styles.viewButtonLabel}
        >
          History
        </Button>
      </View>

      <Card style={styles.missionCard}>
        <Card.Content>
          <View style={styles.missionRow}>
            <View style={styles.missionIcon}>
              <MaterialCommunityIcons
                name="target"
                size={26}
                color="#C87912"
              />
            </View>

            <View style={styles.missionCopy}>
              <Text style={styles.missionEyebrow}>
                TODAY&apos;S MISSION
              </Text>

              <Text style={styles.missionTitle}>
                Give one item a second chance
              </Text>

              <Text style={styles.missionText}>
                Before throwing something away, ask whether
                it can be reused, repaired, or donated.
              </Text>
            </View>
          </View>

          <View style={styles.missionFooter}>
            <View style={styles.missionProgressTrack}>
              <View style={styles.missionProgressValue} />
            </View>

            <Text style={styles.missionProgressText}>
              0%
            </Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Choose a path
          </Text>

          <Text style={styles.sectionSubtitle}>
            Explore better ways to handle everyday items.
          </Text>
        </View>
      </View>

      <View style={styles.categoryGrid}>
        {categoryCards.map((item) => (
          <CategoryCard
            key={item.category}
            item={item}
            onPress={() => navigation.navigate("Camera")}
          />
        ))}
      </View>

      <Card style={styles.tipCard}>
        <Card.Content style={styles.tipContent}>
          <View style={styles.tipIcon}>
            <MaterialCommunityIcons
              name="lightbulb-on-outline"
              size={23}
              color="#C87912"
            />
          </View>

          <View style={styles.tipCopy}>
            <Text style={styles.tipTitle}>
              Quick eco tip
            </Text>

            <Text style={styles.tipText}>
              Keep batteries, medicines, chemicals, and
              electronics out of regular household trash.
            </Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            Recent activity
          </Text>

          <Text style={styles.sectionSubtitle}>
            Your latest sustainability decisions.
          </Text>
        </View>

        {recentScans.length > 0 && (
          <Button
            mode="text"
            compact
            textColor={colors.primary}
            onPress={() => navigation.navigate("History")}
            labelStyle={styles.viewButtonLabel}
          >
            See all
          </Button>
        )}
      </View>

      {recentScans.length > 0 ? (
        <View style={styles.recentList}>
          {recentScans.map((scan) => (
            <RecentScanCard
              key={scan.id}
              scan={scan}
            />
          ))}
        </View>
      ) : (
        <Card style={styles.emptyRecentCard}>
          <Card.Content style={styles.emptyRecentContent}>
            <View style={styles.emptyRecentIcon}>
              <MaterialCommunityIcons
                name="history"
                size={24}
                color={colors.primary}
              />
            </View>

            <View style={styles.emptyRecentCopy}>
              <Text style={styles.emptyRecentTitle}>
                No scans yet
              </Text>

              <Text style={styles.emptyRecentText}>
                Your recent results will appear here.
              </Text>
            </View>

            <Button
              mode="text"
              compact
              textColor={colors.primary}
              onPress={() => navigation.navigate("Camera")}
            >
              Start
            </Button>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <MaterialCommunityIcons
          name={icon as any}
          size={20}
          color={colors.primary}
        />
      </View>

      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

function CategoryCard({
  item,
  onPress,
}: {
  item: CategoryCard;
  onPress: () => void;
}) {
  return (
    <Card
      style={[
        styles.categoryCard,
        {
          backgroundColor: item.background,
        },
      ]}
      onPress={onPress}
    >
      <Card.Content style={styles.categoryContent}>
        <View
          style={[
            styles.categoryIcon,
            {
              backgroundColor: "rgba(255,255,255,0.75)",
            },
          ]}
        >
          <MaterialCommunityIcons
            name={item.icon as any}
            size={23}
            color={item.color}
          />
        </View>

        <Text
          style={[
            styles.categoryLabel,
            {
              color: item.color,
            },
          ]}
        >
          {item.label}
        </Text>

        <Text style={styles.categoryDescription}>
          {item.description}
        </Text>

        <MaterialCommunityIcons
          name="arrow-top-right"
          size={18}
          color={item.color}
          style={styles.categoryArrow}
        />
      </Card.Content>
    </Card>
  );
}

function RecentScanCard({
  scan,
}: {
  scan: ScanRecord;
}) {
  const score = getScore(scan);

  return (
    <Card style={styles.recentCard}>
      <Card.Content style={styles.recentContent}>
        <View style={styles.recentIcon}>
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={24}
            color={colors.primary}
          />
        </View>

        <View style={styles.recentCopy}>
          <Text style={styles.recentName}>
            {scan.itemName || "Unknown item"}
          </Text>

          <Text style={styles.recentDate}>
            {getDateLabel(scan.createdAt)}
          </Text>
        </View>

        <View style={styles.recentScore}>
          <Text style={styles.recentScoreValue}>
            {score}/10
          </Text>

          <Text style={styles.recentScoreLabel}>
            eco score
          </Text>
        </View>
      </Card.Content>
    </Card>
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
    marginBottom: 21,
  },
  headerCopy: {
    flex: 1,
  },
  greeting: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 22,
  },
  headerSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  profileButtonContent: {
    paddingHorizontal: 0,
  },
  profileButtonLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 11,
  },
  heroCard: {
    minHeight: 315,
    borderRadius: 28,
    padding: 21,
    justifyContent: "space-between",
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#155C34",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
  },
  heroCircleOne: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    right: -70,
    top: -75,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  heroCircleTwo: {
    position: "absolute",
    width: 135,
    height: 135,
    borderRadius: 68,
    left: -65,
    bottom: -60,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  heroLeaf: {
    position: "absolute",
    right: 30,
    top: 88,
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  heroBadgeText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 9,
    letterSpacing: 1,
    color: "#D8FFE4",
  },
  heroCameraIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.13)",
  },
  heroTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 27,
    lineHeight: 35,
    color: "#FFFFFF",
    marginTop: 14,
  },
  heroDescription: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    lineHeight: 21,
    color: "#ECFFF1",
    maxWidth: 315,
    marginTop: 3,
  },
  scanButtonWrapper: {
    marginTop: 12,
    borderRadius: 13,
    overflow: "hidden",
  },
  scanButton: {
    height: 53,
  },
  scanButtonLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 11,
    marginTop: 15,
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    padding: 12,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  statValue: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 18,
  },
  statLabel: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 9,
    marginTop: -2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 23,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 17,
  },
  sectionSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
    marginTop: 2,
  },
  viewButtonLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 11,
  },
  missionCard: {
    borderRadius: 21,
    backgroundColor: "#FFF8EA",
    borderWidth: 1,
    borderColor: "#F3DEB1",
  },
  missionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
  },
  missionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE7B4",
  },
  missionCopy: {
    flex: 1,
  },
  missionEyebrow: {
    fontFamily: "Poppins_600SemiBold",
    color: "#B36D12",
    fontSize: 9,
    letterSpacing: 1,
  },
  missionTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 14,
    marginTop: 2,
  },
  missionText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  missionFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 16,
  },
  missionProgressTrack: {
    flex: 1,
    height: 7,
    borderRadius: 5,
    overflow: "hidden",
    backgroundColor: "#F2E2BF",
  },
  missionProgressValue: {
    width: "6%",
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#D8912F",
  },
  missionProgressText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#B36D12",
    fontSize: 11,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 11,
  },
  categoryCard: {
    width: "48.2%",
    minHeight: 139,
    borderRadius: 20,
    elevation: 0,
  },
  categoryContent: {
    minHeight: 139,
    padding: 13,
  },
  categoryIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    marginTop: 10,
  },
  categoryDescription: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
    maxWidth: 120,
  },
  categoryArrow: {
    position: "absolute",
    right: 13,
    bottom: 13,
  },
  tipCard: {
    marginTop: 18,
    borderRadius: 20,
    backgroundColor: colors.warningBackground,
    borderWidth: 1,
    borderColor: colors.warningBorder,
  },
  tipContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  tipIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE8B7",
  },
  tipCopy: {
    flex: 1,
  },
  tipTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.warningText,
    fontSize: 14,
  },
  tipText: {
    fontFamily: "Poppins_400Regular",
    color: colors.warningText,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },
  recentList: {
    gap: 10,
  },
  recentCard: {
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recentContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  recentIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  recentCopy: {
    flex: 1,
  },
  recentName: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 13,
  },
  recentDate: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
    marginTop: 2,
  },
  recentScore: {
    alignItems: "flex-end",
  },
  recentScoreValue: {
    fontFamily: "Poppins_700Bold",
    color: colors.primary,
    fontSize: 15,
  },
  recentScoreLabel: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 9,
  },
  emptyRecentCard: {
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyRecentContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  emptyRecentIcon: {
    width: 41,
    height: 41,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  emptyRecentCopy: {
    flex: 1,
  },
  emptyRecentTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 13,
  },
  emptyRecentText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: colors.background,
  },
  emptyTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 19,
    textAlign: "center",
  },
  emptyText: {
    maxWidth: 290,
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});