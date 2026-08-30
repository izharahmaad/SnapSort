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
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Button, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { categoryMeta } from "../../constants/categories";
import { getUserScans } from "../../services/firebase/scans.service";
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

type CategoryMeta = {
  label: string;
  icon: IconName;
  color: string;
};

type CategoryStat = CategoryMeta & {
  key: CategoryKey;
  count: number;
  percentage: number;
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
const GOLD = "#C98718";
const BORDER = "#E1EBE3";
const ORANGE = "#F57C22";
const SOFT_ORANGE = "#FFF0E3";

const WEEKLY_GOAL = 3;

const journalHeroImage = require(
  "../../../assets/images/waste-journal-hero.png"
);

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

  if (date.toDateString() === now.toDateString()) {
    return `Today, ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  const yesterday = new Date(now);

  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
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

function getJournalMessage({
  totalScans,
  averageScore,
  topCategory,
}: {
  totalScans: number;
  averageScore: number;
  topCategory: CategoryStat | null;
}) {
  if (!totalScans) {
    return "Start with one scan. Your journal will show a clearer picture of the habits you build over time.";
  }

  if (averageScore >= 8) {
    return "Your average eco score is strong. Keep using each scan to make clear and thoughtful decisions.";
  }

  if (topCategory) {
    return `${topCategory.label} is your most used pathway so far. Every saved scan helps you understand your habits better.`;
  }

  return "Every saved scan helps you build a clearer picture of your disposal habits.";
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

        const sortedScans = [...result].sort(
          (first, second) => {
            const firstTime =
              getDate(first.createdAt)?.getTime() || 0;

            const secondTime =
              getDate(second.createdAt)?.getTime() || 0;

            return secondTime - firstTime;
          }
        );

        setScans(sortedScans);
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

    const scoreTotal = scans.reduce(
      (sum, scan) => sum + getScore(scan),
      0
    );

    return scoreTotal / totalScans;
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
          ...meta,
          count: counts[key],
          percentage: totalScans
            ? Math.round(
                (counts[key] / totalScans) * 100
              )
            : 0,
        };
      })
      .filter((item) => item.count > 0)
      .sort((first, second) => second.count - first.count);
  }, [scans, totalScans]);

  const topCategory: CategoryStat | null =
    categoryStats[0] || null;

  const remainingWeeklyScans = Math.max(
    WEEKLY_GOAL - scansThisWeek,
    0
  );

  const journalMessage = useMemo(
    () =>
      getJournalMessage({
        totalScans,
        averageScore,
        topCategory,
      }),
    [totalScans, averageScore, topCategory]
  );

  if (!user) {
    return (
      <View style={styles.centerScreen}>
        <View style={styles.centerIcon}>
          <MaterialCommunityIcons
            name="account-lock-outline"
            size={39}
            color={FOREST}
          />
        </View>

        <Text style={styles.centerTitle}>
          Sign in to view your journal
        </Text>

        <Text style={styles.centerText}>
          Your saved scan activity will appear here after you sign in.
        </Text>

        <Button
          mode="contained"
          buttonColor={FOREST}
          contentStyle={styles.authButtonContent}
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

        <Text style={styles.centerTitle}>
          Loading your journal
        </Text>

        <Text style={styles.centerText}>
          Bringing together your saved scan activity.
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
            tintColor={WHITE}
            colors={[FOREST]}
          />
        }
        contentContainerStyle={{
          paddingBottom: Math.max(
            insets.bottom + 34,
            44
          ),
        }}
      >
        <ImageBackground
          source={journalHeroImage}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <LinearGradient
            colors={[
              "rgba(3,32,24,0.30)",
              "rgba(3,32,24,0.04)",
              "rgba(3,32,24,0.90)",
            ]}
            locations={[0, 0.42, 1]}
            style={styles.heroOverlay}
          >
            <View
              style={[
                styles.topBar,
                {
                  paddingTop: Math.max(
                    insets.top,
                    10
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
                  size={23}
                  color={WHITE}
                />
              </Pressable>

              <View style={styles.headerCenter}>
                <Text style={styles.brand}>
                  Waste Journal
                </Text>

                <Text style={styles.headerSubtitle}>
                  YOUR ACTIVITY
                </Text>
              </View>

              <Pressable
                style={styles.headerButton}
                onPress={() => loadJournal(true)}
                disabled={isRefreshing}
                accessibilityRole="button"
                accessibilityLabel="Refresh journal"
              >
                {isRefreshing ? (
                  <ActivityIndicator
                    size="small"
                    color={WHITE}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="refresh"
                    size={22}
                    color={WHITE}
                  />
                )}
              </Pressable>
            </View>

            <View style={styles.heroCopy}>
              <Text style={styles.heroKicker}>
                YOUR WASTE JOURNEY
              </Text>

              <Text style={styles.heroTitle}>
                Progress starts,
                {"\n"}
                with one choice.
              </Text>

              <Text style={styles.heroDescription}>
                Review your decisions, understand your habits,
                and make a positive impact with every scan.
              </Text>

              <View style={styles.heroSummaryRow}>
                <HeroMetric
                  value={String(totalScans)}
                  label="Saved scans"
                />

                <View style={styles.heroSummaryDivider} />

                <HeroMetric
                  value={averageScore.toFixed(1)}
                  label="Eco score"
                />

                <View style={styles.heroSummaryDivider} />

                <HeroMetric
                  value={String(categoryStats.length)}
                  label="Pathways"
                />
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={styles.body}>
          <View style={styles.weeklyCard}>
            <View style={styles.weeklyTop}>
              <View style={styles.weeklyLeft}>
                <View style={styles.weeklyIcon}>
                  <MaterialCommunityIcons
                    name="calendar-check-outline"
                    size={18}
                    color={FOREST}
                  />
                </View>

                <View style={styles.weeklyTextContainer}>
                  <Text style={styles.weeklyTitle}>
                    This week
                  </Text>

                  <Text style={styles.weeklySubtitle}>
                    {scansThisWeek} of {WEEKLY_GOAL} scans completed
                  </Text>
                </View>
              </View>

              <Text style={styles.weeklyPercent}>
                {Math.round(weeklyProgress * 100)}%
              </Text>
            </View>

            <View style={styles.weeklyTrack}>
              <View
                style={[
                  styles.weeklyValue,
                  {
                    width: `${
                      weeklyProgress * 100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionLabel}>
                DISPOSAL BREAKDOWN
              </Text>

              <Text style={styles.sectionTitle}>
                Your sorting mix
              </Text>
            </View>

            {topCategory ? (
              <View style={styles.topCategoryPill}>
                <MaterialCommunityIcons
                  name={topCategory.icon}
                  size={13}
                  color={topCategory.color}
                />

                <Text
                  style={[
                    styles.topCategoryText,
                    {
                      color: topCategory.color,
                    },
                  ]}
                >
                  Top: {topCategory.label}
                </Text>
              </View>
            ) : null}
          </View>

          {categoryStats.length > 0 ? (
            <View style={styles.chartCard}>
              <View style={styles.chartTopRow}>
                <Text style={styles.chartTitle}>
                  Distribution of saved scans
                </Text>

                <Text style={styles.chartTotal}>
                  {totalScans} total
                </Text>
              </View>

              <View style={styles.distributionTrack}>
                {categoryStats.map((item) => (
                  <View
                    key={item.key}
                    style={[
                      styles.distributionSegment,
                      {
                        flex: item.count,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                ))}
              </View>

              <View style={styles.legendList}>
                {categoryStats.map((item) => (
                  <View
                    key={item.key}
                    style={styles.legendRow}
                  >
                    <View
                      style={[
                        styles.legendDot,
                        {
                          backgroundColor: item.color,
                        },
                      ]}
                    />

                    <MaterialCommunityIcons
                      name={item.icon}
                      size={15}
                      color={item.color}
                      style={styles.legendIcon}
                    />

                    <Text style={styles.legendLabel}>
                      {item.label}
                    </Text>

                    <Text style={styles.legendValue}>
                      <Text
                        style={[
                          styles.legendNumber,
                          {
                            color: item.color,
                          },
                        ]}
                      >
                        {item.count}
                      </Text>
                      {"  "}
                      {item.percentage}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <EmptyJournalCard
              title="Your sorting mix is empty"
              text="Scan an item to begin tracking the pathways you use."
            />
          )}

          <View style={styles.targetCard}>
            <View style={styles.targetIcon}>
              <MaterialCommunityIcons
                name="target"
                size={23}
                color={FOREST}
              />
            </View>

            <View style={styles.targetCopy}>
              <Text style={styles.targetLabel}>
                WEEKLY ECO TARGET
              </Text>

              <Text style={styles.targetTitle}>
                Keep your momentum growing
              </Text>

              <Text style={styles.targetText}>
                {scansThisWeek >= WEEKLY_GOAL
                  ? "You completed your goal for this week. Great work keeping your sustainable habit active."
                  : `You need ${remainingWeeklyScans} more scan${
                      remainingWeeklyScans === 1
                        ? ""
                        : "s"
                    } to complete this week's goal.`}
              </Text>
            </View>

            <View style={styles.targetProgress}>
              <Text style={styles.targetProgressText}>
                {Math.round(weeklyProgress * 100)}%
              </Text>
            </View>
          </View>

          <View style={styles.insightSection}>
            <Text style={styles.sectionLabel}>
              JOURNAL INSIGHT
            </Text>

            <View style={styles.insightCard}>
              <View style={styles.insightIcon}>
                <MaterialCommunityIcons
                  name="lightbulb-outline"
                  size={22}
                  color={GOLD}
                />
              </View>

              <View style={styles.insightCopy}>
                <Text style={styles.insightLabel}>
                  BASED ON YOUR ACTIVITY
                </Text>

                <Text style={styles.insightTitle}>
                  Keep learning with every scan
                </Text>

                <Text style={styles.insightText}>
                  {journalMessage}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.entriesHeader}>
            <View>
              <Text style={styles.sectionLabel}>
                RECENT ENTRIES
              </Text>

              <Text style={styles.sectionTitle}>
                Your latest activity
              </Text>
            </View>

            {scans.length > 0 ? (
              <Pressable
                style={styles.historyButton}
                onPress={() => navigation.navigate("History")}
                accessibilityRole="button"
                accessibilityLabel="View full scan history"
              >
                <Text style={styles.historyButtonText}>
                  History
                </Text>

                <MaterialCommunityIcons
                  name="arrow-right"
                  size={14}
                  color={FOREST}
                />
              </Pressable>
            ) : null}
          </View>

          {scans.length > 0 ? (
            <View style={styles.entriesCard}>
              {scans.slice(0, 5).map((scan, index) => (
                <JournalEntry
                  key={scan.id}
                  scan={scan}
                  isLast={
                    index ===
                    Math.min(scans.length, 5) - 1
                  }
                />
              ))}
            </View>
          ) : (
            <EmptyJournalCard
              title="No journal entries yet"
              text="Your saved scan results will appear here after your first scan."
            />
          )}

          <Pressable
            style={({ pressed }) => [
              styles.scanButton,
              pressed && styles.scanButtonPressed,
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

            <View style={styles.scanButtonArrow}>
              <MaterialCommunityIcons
                name="arrow-right"
                size={18}
                color={FOREST}
              />
            </View>
          </Pressable>

          <Text style={styles.footerText}>
            Your journal is calculated from your saved scan history.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function HeroMetric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <View style={styles.heroMetric}>
      <Text style={styles.heroMetricValue}>
        {value}
      </Text>

      <Text style={styles.heroMetricLabel}>
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
  const score = getScore(scan);

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

          <Text
            style={styles.entrySubtitle}
            numberOfLines={1}
          >
            {meta.label} · {getDateLabel(scan.createdAt)}
          </Text>
        </View>

        <View style={styles.entryScore}>
          <Text style={styles.entryScoreValue}>
            {score.toFixed(1)}
          </Text>

          <Text style={styles.entryScoreLabel}>
            SCORE
          </Text>
        </View>
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
          size={24}
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

  hero: {
    height: 470,
    overflow: "hidden",
    backgroundColor: DARK_FOREST,
  },

  heroImage: {
    resizeMode: "cover",
  },

  heroOverlay: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 31,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FOREST,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.32)",
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.14)",
  },

  headerCenter: {
    alignItems: "center",
  },

  brand: {
    fontFamily: "Poppins_700Bold",
    color: WHITE,
    fontSize: 17,
    letterSpacing: -0.4,
  },

  headerSubtitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#D7F7E2",
    fontSize: 7,
    letterSpacing: 1.25,
    marginTop: 1,
  },

  heroCopy: {
    maxWidth: 350,
    paddingHorizontal: 24,
  },

  heroKicker: {
    fontFamily: "Poppins_600SemiBold",
    color: "#D7F7E2",
    fontSize: 9,
    letterSpacing: 1.3,
    marginBottom: 10,
  },

  heroTitle: {
    fontFamily: "Poppins_700Bold",
    color: WHITE,
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: -1,
  },

  heroDescription: {
    maxWidth: 320,
    fontFamily: "Poppins_400Regular",
    color: "#F2FFF6",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 11,
  },

  heroSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.25)",
  },

  heroMetric: {
    flex: 1,
    alignItems: "center",
  },

  heroMetricValue: {
    fontFamily: "Poppins_700Bold",
    color: ORANGE,
    fontSize: 22,
  },

  heroMetricLabel: {
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.82)",
    fontSize: 8,
    marginTop: 1,
  },

  heroSummaryDivider: {
    width: 1,
    height: 34,
    backgroundColor: "rgba(255,255,255,0.25)",
  },

  body: {
    paddingHorizontal: 22,
    paddingTop: 24,
  },

  weeklyCard: {
    padding: 13,
    borderRadius: 19,
    backgroundColor: PALE_GREEN,
    borderWidth: 1,
    borderColor: "#D8EBDC",
  },

  weeklyTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  weeklyLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  weeklyIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },

  weeklyTextContainer: {
    flex: 1,
    marginLeft: 10,
  },

  weeklyTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 12,
  },

  weeklySubtitle: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    marginTop: 1,
  },

  weeklyPercent: {
    fontFamily: "Poppins_700Bold",
    color: FOREST,
    fontSize: 13,
  },

  weeklyTrack: {
    height: 6,
    overflow: "hidden",
    borderRadius: 4,
    marginTop: 11,
    backgroundColor: "#CEE3D3",
  },

  weeklyValue: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: FOREST,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 30,
    marginBottom: 13,
  },

  sectionLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 8,
    letterSpacing: 1.15,
  },

  sectionTitle: {
    fontFamily: "Poppins_700Bold",
    color: TEXT,
    fontSize: 20,
    letterSpacing: -0.4,
    marginTop: 2,
  },

  topCategoryPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 13,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  topCategoryText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 8,
    marginLeft: 4,
  },

  chartCard: {
    padding: 14,
    borderRadius: 21,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  chartTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  chartTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 10,
  },

  chartTotal: {
    fontFamily: "Poppins_500Medium",
    color: MUTED,
    fontSize: 8,
  },

  distributionTrack: {
    height: 14,
    flexDirection: "row",
    overflow: "hidden",
    marginTop: 14,
    borderRadius: 7,
    backgroundColor: "#EEF2EE",
  },

  distributionSegment: {
    height: "100%",
  },

  legendList: {
    marginTop: 13,
  },

  legendRow: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  legendIcon: {
    marginLeft: 7,
  },

  legendLabel: {
    flex: 1,
    fontFamily: "Poppins_500Medium",
    color: TEXT,
    fontSize: 9,
    marginLeft: 6,
  },

  legendValue: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
  },

  legendNumber: {
    fontFamily: "Poppins_700Bold",
    fontSize: 10,
  },

  targetCard: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginTop: 22,
    borderRadius: 19,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#CBE8D3",
  },

  targetIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },

  targetCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  targetLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 8,
    letterSpacing: 1,
  },

  targetTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 11,
    marginTop: 2,
  },

  targetText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 3,
  },

  targetProgress: {
    width: 45,
    height: 45,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 9,
    backgroundColor: SOFT_ORANGE,
  },

  targetProgressText: {
    fontFamily: "Poppins_700Bold",
    color: ORANGE,
    fontSize: 12,
  },

  insightSection: {
    marginTop: 28,
  },

  insightCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    marginTop: 8,
    borderRadius: 19,
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
    minWidth: 0,
    marginLeft: 10,
  },

  insightLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: GOLD,
    fontSize: 8,
    letterSpacing: 1,
  },

  insightTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 10,
    marginTop: 2,
  },

  insightText: {
    fontFamily: "Poppins_400Regular",
    color: "#766342",
    fontSize: 9,
    lineHeight: 15,
    marginTop: 3,
  },

  entriesHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 30,
    marginBottom: 12,
  },

  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 3,
  },

  historyButtonText: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 9,
    marginRight: 3,
  },

  entriesCard: {
    paddingHorizontal: 14,
    borderRadius: 19,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  entryRow: {
    minHeight: 68,
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
    width: 36,
    alignItems: "flex-end",
    marginLeft: 8,
  },

  entryScoreValue: {
    fontFamily: "Poppins_700Bold",
    color: FOREST,
    fontSize: 15,
  },

  entryScoreLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: MUTED,
    fontSize: 6,
    letterSpacing: 0.8,
    marginTop: -1,
  },

  entryDivider: {
    height: 1,
    marginLeft: 49,
    backgroundColor: "#E7EEE8",
  },

  scanButton: {
    minHeight: 75,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginTop: 24,
    borderRadius: 20,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#CBE8D3",
  },

  scanButtonPressed: {
    opacity: 0.72,
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

  scanButtonArrow: {
    width: 33,
    height: 33,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
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
    padding: 24,
    borderRadius: 19,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  emptyCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  emptyCardTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 11,
    marginTop: 10,
  },

  emptyCardText: {
    maxWidth: 250,
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    lineHeight: 14,
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

  authButtonContent: {
    height: 46,
    paddingHorizontal: 12,
  },
});