import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Button, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { categoryMeta } from "../../constants/categories";
import { auth } from "../../services/firebase/firebase";
import {
  getUserScans,
} from "../../services/firebase/scans.service";
import { useAuthStore } from "../../stores/auth.store";
import type { RootStackParamList } from "../../navigation/types";
import type {
  DisposalCategory,
  ScanRecord,
} from "../../types/scan";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "WasteJournal"
>;

type IconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

type CategoryKey =
  | "recycle"
  | "reuse"
  | "compost"
  | "trash"
  | "hazardous";

type CategoryStat = {
  key: CategoryKey;
  label: string;
  icon: IconName;
  color: string;
  count: number;
  percentage: number;
};

type CategoryMeta = {
  label: string;
  icon: IconName;
  color: string;
};

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

const WEEKLY_GOAL = 3;

const fallbackCategoryMeta: CategoryMeta = {
  label: "Dispose",
  icon: "delete-outline",
  color: "#7B817C",
};

function getSafeCategory(
  value: unknown
): DisposalCategory {
  if (
    value === "recycle" ||
    value === "reuse" ||
    value === "compost" ||
    value === "trash" ||
    value === "hazardous"
  ) {
    return value;
  }

  return "trash";
}

function getCategoryMeta(
  category: CategoryKey
): CategoryMeta {
  const raw = categoryMeta[category] as
    | {
        label?: string;
        icon?: string;
        color?: string;
      }
    | undefined;

  return {
    label:
      raw?.label ||
      fallbackCategoryMeta.label,
    icon:
      (raw?.icon as IconName) ||
      fallbackCategoryMeta.icon,
    color:
      raw?.color ||
      fallbackCategoryMeta.color,
  };
}

function getDate(value: unknown): Date | null {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    const date = value.toDate();

    return date instanceof Date ? date : null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string") {
    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? null
      : date;
  }

  return null;
}

function getScore(scan: ScanRecord): number {
  return Math.max(
    0,
    Math.min(10, Number(scan.ecoScore) || 0)
  );
}

function getDateLabel(value: unknown): string {
  const date = getDate(value);

  if (!date) {
    return "Recently";
  }

  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return `Today, ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStartOfWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  const start = new Date(now);

  start.setDate(now.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);

  return start;
}

function getHabitInsight(
  scans: ScanRecord[],
  averageScore: number
): string {
  if (scans.length === 0) {
    return "Your journal starts with one scan. Identify an item to begin.";
  }

  if (averageScore >= 8) {
    return "Your average score is strong. Keep making thoughtful choices.";
  }

  const counts = scans.reduce<
    Record<CategoryKey, number>
  >(
    (result, scan) => {
      const category = getSafeCategory(scan.category);

      result[category] += 1;

      return result;
    },
    {
      recycle: 0,
      reuse: 0,
      compost: 0,
      trash: 0,
      hazardous: 0,
    }
  );

  const mostUsed = Object.entries(counts).sort(
    (first, second) => second[1] - first[1]
  )[0];

  if (mostUsed?.[1] > 0) {
    const meta = getCategoryMeta(
      mostUsed[0] as CategoryKey
    );

    return `${meta.label} is your most common pathway so far. Keep learning from each scan.`;
  }

  return "Every scan is a chance to learn and improve your next disposal decision.";
}

export default function WasteJournalScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);

  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const loadJournal = useCallback(
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

        const result = await getUserScans(user.uid);

        const sorted = [...result].sort(
          (first, second) => {
            const firstTime =
              getDate(first.createdAt)?.getTime() || 0;

            const secondTime =
              getDate(second.createdAt)?.getTime() || 0;

            return secondTime - firstTime;
          }
        );

        setScans(sorted);
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Could not load your waste journal.";

        Alert.alert("Journal error", message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [user]
  );

  useEffect(() => {
    void loadJournal();
  }, [loadJournal]);

  const totalScans = scans.length;

  const averageScore = useMemo(() => {
    if (!totalScans) {
      return 0;
    }

    const total = scans.reduce(
      (sum, scan) => sum + getScore(scan),
      0
    );

    return total / totalScans;
  }, [scans, totalScans]);

  const scansThisWeek = useMemo(() => {
    const weekStart = getStartOfWeek();

    return scans.filter((scan) => {
      const date = getDate(scan.createdAt);

      return Boolean(date && date >= weekStart);
    }).length;
  }, [scans]);

  const weeklyProgress = Math.min(
    scansThisWeek / WEEKLY_GOAL,
    1
  );

  const categoryStats = useMemo(() => {
    const keys: CategoryKey[] = [
      "recycle",
      "reuse",
      "compost",
      "trash",
      "hazardous",
    ];

    const counts = scans.reduce<
      Record<CategoryKey, number>
    >(
      (result, scan) => {
        const category = getSafeCategory(scan.category);

        result[category] += 1;

        return result;
      },
      {
        recycle: 0,
        reuse: 0,
        compost: 0,
        trash: 0,
        hazardous: 0,
      }
    );

    return keys
      .map((key) => {
        const meta = getCategoryMeta(key);

        return {
          key,
          label: meta.label,
          icon: meta.icon,
          color: meta.color,
          count: counts[key],
          percentage: totalScans
            ? Math.round(
                (counts[key] / totalScans) * 100
              )
            : 0,
        };
      })
      .filter((item) => item.count > 0);
  }, [scans, totalScans]);

  const insight = useMemo(
    () => getHabitInsight(scans, averageScore),
    [scans, averageScore]
  );

  if (!user) {
    return (
      <View style={styles.centerScreen}>
        <View style={styles.centerIcon}>
          <MaterialCommunityIcons
            name="account-lock-outline"
            size={38}
            color={FOREST}
          />
        </View>

        <Text style={styles.centerTitle}>
          Sign in to view your journal
        </Text>

        <Text style={styles.centerText}>
          Your saved scans will appear here after you sign in.
        </Text>

        <Button
          mode="contained"
          buttonColor={FOREST}
          onPress={() => navigation.navigate("Login")}
        >
          Sign in
        </Button>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator
          size="large"
          color={FOREST}
        />

        <Text style={styles.centerText}>
          Loading your waste journal...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadJournal(true)}
            tintColor={FOREST}
            colors={[FOREST]}
          />
        }
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(
              insets.top + 10,
              20
            ),
            paddingBottom: Math.max(
              insets.bottom + 32,
              42
            ),
          },
        ]}
      >
        <View style={styles.topNavigation}>
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
            Waste Journal
          </Text>

          <View style={styles.navigationSpace} />
        </View>

        <View style={styles.heroSection}>
          <View style={styles.heroIconRing}>
            <View style={styles.heroIcon}>
              <MaterialCommunityIcons
                name="notebook-outline"
                size={25}
                color={WHITE}
              />
            </View>
          </View>

          <Text style={styles.pageTitle}>
            Your everyday progress
          </Text>

          <Text style={styles.pageDescription}>
            A clearer view of your disposal habits over time.
          </Text>
        </View>

        <View style={styles.overviewRow}>
          <OverviewMetric
            icon="barcode-scan"
            value={String(totalScans)}
            label="Saved scans"
          />

          <OverviewMetric
            icon="leaf"
            value={averageScore.toFixed(1)}
            label="Average score"
          />
        </View>

        <View style={styles.weekCard}>
          <View style={styles.weekIcon}>
            <MaterialCommunityIcons
              name="calendar-check-outline"
              size={21}
              color={FOREST}
            />
          </View>

          <View style={styles.weekCopy}>
            <Text style={styles.weekTitle}>
              This week
            </Text>

            <Text style={styles.weekSubtitle}>
              {scansThisWeek} of {WEEKLY_GOAL} scans completed
            </Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${weeklyProgress * 100}%`,
                  },
                ]}
              />
            </View>
          </View>

          <Text style={styles.weekPercent}>
            {Math.round(weeklyProgress * 100)}%
          </Text>
        </View>

        <Text style={styles.sectionLabel}>
          YOUR DISPOSAL MIX
        </Text>

        {categoryStats.length > 0 ? (
          <View style={styles.card}>
            {categoryStats.map((item, index) => (
              <View key={item.key}>
                <View style={styles.categoryRow}>
                  <View
                    style={[
                      styles.categoryIcon,
                      {
                        backgroundColor: `${item.color}18`,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={17}
                      color={item.color}
                    />
                  </View>

                  <View style={styles.categoryCopy}>
                    <Text style={styles.categoryTitle}>
                      {item.label}
                    </Text>

                    <View style={styles.categoryTrack}>
                      <View
                        style={[
                          styles.categoryFill,
                          {
                            width: `${item.percentage}%`,
                            backgroundColor: item.color,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.categoryCount}>
                    <Text style={styles.categoryCountValue}>
                      {item.count}
                    </Text>

                    <Text style={styles.categoryPercentage}>
                      {item.percentage}%
                    </Text>
                  </View>
                </View>

                {index < categoryStats.length - 1 ? (
                  <View style={styles.categoryDivider} />
                ) : null}
              </View>
            ))}
          </View>
        ) : (
          <EmptyJournalCard
            title="Your disposal mix is empty"
            text="Scan an item to start building your journal."
          />
        )}

        <Text style={styles.sectionLabel}>
          JOURNAL INSIGHT
        </Text>

        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <MaterialCommunityIcons
              name="lightbulb-outline"
              size={21}
              color={GOLD}
            />
          </View>

          <View style={styles.insightCopy}>
            <Text style={styles.insightTitle}>
              A note from your activity
            </Text>

            <Text style={styles.insightText}>
              {insight}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>
          RECENT ENTRIES
        </Text>

        {scans.length > 0 ? (
          <View style={styles.card}>
            {scans.slice(0, 5).map((scan, index) => (
              <JournalEntry
                key={scan.id}
                scan={scan}
                isLast={index === Math.min(scans.length, 5) - 1}
              />
            ))}
          </View>
        ) : (
          <EmptyJournalCard
            title="No journal entries yet"
            text="Your saved scan results will appear here."
          />
        )}

        <Pressable
          style={({ pressed }) => [
            styles.scanButton,
            pressed && styles.pressedButton,
          ]}
          onPress={() => navigation.navigate("Camera")}
          accessibilityRole="button"
          accessibilityLabel="Scan a new item"
        >
          <View style={styles.scanButtonIcon}>
            <MaterialCommunityIcons
              name="camera-plus-outline"
              size={21}
              color={WHITE}
            />
          </View>

          <View style={styles.scanButtonCopy}>
            <Text style={styles.scanButtonTitle}>
              Scan a new item
            </Text>

            <Text style={styles.scanButtonSubtitle}>
              Add another entry to your journal.
            </Text>
          </View>

          <MaterialCommunityIcons
            name="arrow-right"
            size={19}
            color={FOREST}
          />
        </Pressable>

        <Text style={styles.footerText}>
          Your journal is calculated from your saved scan history.
        </Text>
      </ScrollView>
    </View>
  );
}

function OverviewMetric({
  icon,
  value,
  label,
}: {
  icon: IconName;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.overviewMetric}>
      <View style={styles.metricIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={FOREST}
        />
      </View>

      <Text style={styles.metricValue}>
        {value}
      </Text>

      <Text style={styles.metricLabel}>
        {label}
      </Text>
    </View>
  );
}

function JournalEntry({
  scan,
  isLast,
}: {
  scan: ScanRecord;
  isLast: boolean;
}) {
  const category = getSafeCategory(scan.category);
  const meta = getCategoryMeta(category);

  return (
    <View>
      <View style={styles.entryRow}>
        <View
          style={[
            styles.entryIcon,
            {
              backgroundColor: `${meta.color}18`,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={meta.icon}
            size={18}
            color={meta.color}
          />
        </View>

        <View style={styles.entryCopy}>
          <Text
            style={styles.entryTitle}
            numberOfLines={1}
          >
            {scan.itemName || "Unknown item"}
          </Text>

          <Text style={styles.entrySubtitle}>
            {meta.label} · {getDateLabel(scan.createdAt)}
          </Text>
        </View>

        <Text style={styles.entryScore}>
          {getScore(scan).toFixed(1)}
        </Text>
      </View>

      {!isLast ? (
        <View style={styles.entryDivider} />
      ) : null}
    </View>
  );
}

function EmptyJournalCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyCardIcon}>
        <MaterialCommunityIcons
          name="notebook-outline"
          size={23}
          color={FOREST}
        />
      </View>

      <Text style={styles.emptyCardTitle}>
        {title}
      </Text>

      <Text style={styles.emptyCardText}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  content: {
    paddingHorizontal: 20,
  },

  topNavigation: {
    minHeight: 44,
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

  heroSection: {
    alignItems: "center",
    paddingTop: 25,
    paddingBottom: 25,
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
    maxWidth: 290,
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 4,
  },

  overviewRow: {
    flexDirection: "row",
    marginHorizontal: -4,
  },

  overviewMetric: {
    flex: 1,
    minHeight: 105,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  metricValue: {
    fontFamily: "Poppins_700Bold",
    color: TEXT,
    fontSize: 22,
    marginTop: 5,
  },

  metricLabel: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    marginTop: -1,
  },

  weekCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginTop: 12,
    borderRadius: 21,
    backgroundColor: PALE_GREEN,
    borderWidth: 1,
    borderColor: "#D5EADB",
  },

  weekIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },

  weekCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  weekTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 11,
  },

  weekSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    marginTop: 2,
  },

  progressTrack: {
    height: 5,
    overflow: "hidden",
    marginTop: 7,
    borderRadius: 3,
    backgroundColor: "#D5E8D9",
  },

  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: FOREST,
  },

  weekPercent: {
    fontFamily: "Poppins_700Bold",
    color: FOREST,
    fontSize: 14,
    marginLeft: 10,
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

  categoryRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
  },

  categoryIcon: {
    width: 37,
    height: 37,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  categoryTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 10,
  },

  categoryTrack: {
    height: 4,
    overflow: "hidden",
    marginTop: 6,
    borderRadius: 2,
    backgroundColor: "#EDF2EE",
  },

  categoryFill: {
    height: "100%",
    borderRadius: 2,
  },

  categoryCount: {
    alignItems: "flex-end",
    marginLeft: 10,
  },

  categoryCountValue: {
    fontFamily: "Poppins_700Bold",
    color: TEXT,
    fontSize: 13,
  },

  categoryPercentage: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 8,
    marginTop: -1,
  },

  categoryDivider: {
    height: 1,
    marginLeft: 47,
    backgroundColor: "#E7EEE8",
  },

  insightCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 21,
    backgroundColor: LIGHT_GOLD,
    borderWidth: 1,
    borderColor: "#F0DFB7",
  },

  insightIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },

  insightCopy: {
    flex: 1,
    marginLeft: 10,
  },

  insightTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 10,
  },

  insightText: {
    fontFamily: "Poppins_400Regular",
    color: "#766342",
    fontSize: 9,
    lineHeight: 15,
    marginTop: 3,
  },

  entryRow: {
    minHeight: 67,
    flexDirection: "row",
    alignItems: "center",
  },

  entryIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  entryCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  entryTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 11,
  },

  entrySubtitle: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    marginTop: 3,
  },

  entryScore: {
    fontFamily: "Poppins_700Bold",
    color: FOREST,
    fontSize: 15,
    marginLeft: 8,
  },

  entryDivider: {
    height: 1,
    marginLeft: 49,
    backgroundColor: "#E7EEE8",
  },

  scanButton: {
    minHeight: 73,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginTop: 24,
    borderRadius: 24,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#CBE8D3",
  },

  pressedButton: {
    opacity: 0.7,
  },

  scanButtonIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FOREST,
  },

  scanButtonCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  scanButtonTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 11,
  },

  scanButtonSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    marginTop: 2,
  },

  footerText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    textAlign: "center",
    marginTop: 18,
  },

  emptyCard: {
    alignItems: "center",
    padding: 22,
    borderRadius: 21,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  emptyCardIcon: {
    width: 49,
    height: 49,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  emptyCardTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 11,
    marginTop: 9,
  },

  emptyCardText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    textAlign: "center",
    marginTop: 3,
  },

  centerScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: BACKGROUND,
  },

  centerIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    backgroundColor: LIGHT_GREEN,
  },

  centerTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 18,
    textAlign: "center",
  },

  centerText: {
    maxWidth: 285,
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 5,
    marginBottom: 16,
  },
});