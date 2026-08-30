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
const BACKGROUND = "#F7FAF7";
const FOREST = "#075C34";
const DARK_FOREST = "#04351E";
const EMERALD = "#16824B";
const TEXT = "#17271D";
const MUTED = "#6D7B72";
const LIGHT_GREEN = "#EAF7EE";
const PALE_GREEN = "#F1FAF3";
const LIGHT_GOLD = "#FFF3DB";
const GOLD = "#B97812";
const BORDER = "#E1EBE3";

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

  const yesterday = new Date();

  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
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
      .filter((item) => item.count > 0)
      .sort((first, second) => second.count - first.count);
  }, [scans, totalScans]);

  const topCategory = useMemo(() => {
    if (!categoryStats.length) {
      return null;
    }

    return categoryStats[0];
  }, [categoryStats]);

  const journalMessage = useMemo(
    () =>
      getJournalMessage({
        totalScans,
        averageScore,
        topCategory,
      }),
    [totalScans, averageScore, topCategory]
  );

  const remainingWeeklyScans = Math.max(
    WEEKLY_GOAL - scansThisWeek,
    0
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
        <View style={styles.loadingIcon}>
          <ActivityIndicator
            size="large"
            color={FOREST}
          />
        </View>

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
          style={[
            styles.hero,
            {
              paddingTop: Math.max(
                insets.top + 10,
                20
              ),
            },
          ]}
          imageStyle={styles.heroImage}
        >
          <LinearGradient
            colors={[
              "rgba(2,28,16,0.24)",
              "rgba(3,40,23,0.18)",
              "rgba(3,43,25,0.93)",
            ]}
            locations={[0, 0.38, 1]}
            style={styles.heroOverlay}
          >
            <View style={styles.heroNavigation}>
              <Pressable
                style={styles.heroNavButton}
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

              <View style={styles.heroNavigationCenter}>
                <Text style={styles.heroNavigationTitle}>
                  Waste Journal
                </Text>

                <Text style={styles.heroNavigationSubtitle}>
                  YOUR ACTIVITY
                </Text>
              </View>

              <Pressable
                style={styles.heroNavButton}
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
                    size={19}
                    color={WHITE}
                  />
                )}
              </Pressable>
            </View>

            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>
                Progress starts
                {"\n"}
                with one choice.
              </Text>

              <Text style={styles.heroDescription}>
                Review the actions you have saved and build
                better disposal habits one scan at a time.
              </Text>

              <View style={styles.heroStats}>
                <HeroStat
                  value={String(totalScans)}
                  label="Saved scans"
                />

                <View style={styles.heroStatsDivider} />

                <HeroStat
                  value={averageScore.toFixed(1)}
                  label="Eco score"
                />

                <View style={styles.heroStatsDivider} />

                <HeroStat
                  value={String(categoryStats.length)}
                  label="Pathways"
                />
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={styles.body}>
          <View style={styles.weekCard}>
            <View style={styles.weekIcon}>
              <MaterialCommunityIcons
                name={
                  scansThisWeek >= WEEKLY_GOAL
                    ? "check-circle-outline"
                    : "calendar-check-outline"
                }
                size={21}
                color={FOREST}
              />
            </View>

            <View style={styles.weekCopy}>
              <View style={styles.weekTopRow}>
                <Text style={styles.weekTitle}>
                  This week
                </Text>

                <Text style={styles.weekProgressText}>
                  <Text style={styles.weekProgressNumber}>
                    {scansThisWeek}
                  </Text>
                  /{WEEKLY_GOAL}
                </Text>
              </View>

              <Text style={styles.weekSubtitle}>
                {scansThisWeek >= WEEKLY_GOAL
                  ? "Weekly goal completed"
                  : `${remainingWeeklyScans} more scan${
                      remainingWeeklyScans === 1
                        ? ""
                        : "s"
                    } to reach your goal`}
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
          </View>

          <View style={styles.metricsRow}>
            <MetricCard
              icon="barcode-scan"
              value={String(totalScans)}
              label="Saved scans"
            />

            <MetricCard
              icon="leaf"
              value={averageScore.toFixed(1)}
              label="Average score"
            />

            <MetricCard
              icon="recycle"
              value={String(categoryStats.length)}
              label="Pathways"
            />
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

function HeroStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <View style={styles.heroStat}>
      <Text style={styles.heroStatValue}>
        {value}
      </Text>

      <Text style={styles.heroStatLabel}>
        {label}
      </Text>
    </View>
  );
}

function MetricCard({
  icon,
  value,
  label,
}: {
  icon: IconName;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={16}
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
    height: 344,
    overflow: "hidden",
    backgroundColor: DARK_FOREST,
  },

  heroImage: {
    resizeMode: "cover",
  },

  heroOverlay: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 22,
  },

  heroNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  heroNavButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.23)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },

  heroNavigationCenter: {
    alignItems: "center",
  },

  heroNavigationTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: WHITE,
    fontSize: 14,
  },

  heroNavigationSubtitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "rgba(255,255,255,0.72)",
    fontSize: 7,
    letterSpacing: 1,
    marginTop: 1,
  },

  heroContent: {
    paddingHorizontal: 22,
  },

  heroTitle: {
    maxWidth: 300,
    fontFamily: "Poppins_700Bold",
    color: WHITE,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.7,
  },

  heroDescription: {
    maxWidth: 315,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.87)",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 6,
  },

  heroStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.24)",
  },

  heroStat: {
    flex: 1,
    alignItems: "center",
  },

  heroStatValue: {
    fontFamily: "Poppins_700Bold",
    color: WHITE,
    fontSize: 18,
  },

  heroStatLabel: {
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.76)",
    fontSize: 8,
    marginTop: 1,
  },

  heroStatsDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.24)",
  },

  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  weekCard: {
    minHeight: 81,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 22,
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

  weekTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  weekTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 11,
  },

  weekProgressText: {
    fontFamily: "Poppins_500Medium",
    color: MUTED,
    fontSize: 10,
  },

  weekProgressNumber: {
    fontFamily: "Poppins_700Bold",
    color: FOREST,
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
    marginTop: 8,
    borderRadius: 3,
    backgroundColor: "#D5E8D9",
  },

  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: FOREST,
  },

  metricsRow: {
    flexDirection: "row",
    marginTop: 12,
    marginHorizontal: -4,
  },

  metricCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 18,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  metricIcon: {
    width: 29,
    height: 29,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  metricValue: {
    fontFamily: "Poppins_700Bold",
    color: FOREST,
    fontSize: 18,
    marginTop: 4,
  },

  metricLabel: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 7,
    textAlign: "center",
    marginTop: 1,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 27,
    marginBottom: 9,
    marginLeft: 2,
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
    fontSize: 16,
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
    borderRadius: 22,
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

  insightCard: {
    flexDirection: "row",
    alignItems: "flex-start",
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
    marginTop: 27,
    marginBottom: 9,
    marginLeft: 2,
  },

  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 2,
  },

  historyButtonText: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 9,
    marginRight: 3,
  },

  entriesCard: {
    paddingHorizontal: 14,
    borderRadius: 21,
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
    borderRadius: 23,
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
    borderRadius: 21,
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

  loadingIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
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