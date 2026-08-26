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
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Button, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { categoryMeta } from "../../constants/categories";
import { colors } from "../../constants/theme";
import { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../stores/auth.store";
import {
  deleteScan,
  getUserScans,
} from "../../services/firebase/scans.service";
import type {
  DisposalCategory,
  ScanRecord,
} from "../../types/scan";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "History"
>;

type IconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

type FilterValue =
  | "all"
  | "recycle"
  | "reuse"
  | "compost"
  | "trash"
  | "hazardous";

type FilterItem = {
  value: FilterValue;
  label: string;
  icon: IconName;
};

type Meta = {
  label: string;
  icon: IconName;
  color: string;
};

const fallbackMeta: Meta = {
  label: "Other",
  icon: "help-circle-outline",
  color: "#7B817C",
};

const filters: FilterItem[] = [
  {
    value: "all",
    label: "All",
    icon: "view-grid-outline",
  },
  {
    value: "recycle",
    label: "Recycle",
    icon: "recycle",
  },
  {
    value: "reuse",
    label: "Reuse",
    icon: "refresh",
  },
  {
    value: "compost",
    label: "Compost",
    icon: "leaf",
  },
  {
    value: "trash",
    label: "Dispose",
    icon: "delete-outline",
  },
];

const historyImage = require(
  "../../../assets/images/pathway-recycle.png"
);

function getSafeCategory(
  value: unknown
): DisposalCategory {
  if (
    value === "recycle" ||
    value === "compost" ||
    value === "trash" ||
    value === "reuse" ||
    value === "hazardous"
  ) {
    return value;
  }

  return "trash";
}

function getMeta(category: DisposalCategory): Meta {
  const raw = categoryMeta[category] as
    | {
        label?: string;
        icon?: string;
        color?: string;
      }
    | undefined;

  return {
    label: raw?.label || fallbackMeta.label,
    icon: (raw?.icon || fallbackMeta.icon) as IconName,
    color: raw?.color || fallbackMeta.color,
  };
}

function getDate(value: unknown): Date | null {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    const result = value.toDate();

    return result instanceof Date ? result : null;
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

function getDateText(value: unknown): string {
  const date = getDate(value);

  if (!date) {
    return "Recently";
  }

  const today = new Date();

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

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

function getScore(scan: ScanRecord): number {
  return Math.max(
    0,
    Math.min(10, Number(scan.ecoScore) || 0)
  );
}

function getConfidence(value: unknown): string {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    return "Unknown confidence";
  }

  return `${value.trim().toLowerCase()} confidence`;
}

function matchesSearch(
  scan: ScanRecord,
  query: string
): boolean {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const searchableText = [
    scan.itemName,
    scan.category,
    scan.disposalAdvice,
    scan.warning,
    scan.confidence,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(normalizedQuery);
}

export default function HistoryScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);

  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<FilterValue>("all");

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
            : "Could not load scan history.";

        Alert.alert("History error", message);
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
    if (scans.length === 0) {
      return "0.0";
    }

    const total = scans.reduce(
      (sum, scan) => sum + getScore(scan),
      0
    );

    return (total / scans.length).toFixed(1);
  }, [scans]);

  const pathwayCount = useMemo(() => {
    const categories = new Set(
      scans.map((scan) =>
        getSafeCategory(scan.category)
      )
    );

    return categories.size;
  }, [scans]);

  const filteredScans = useMemo(() => {
    return scans.filter((scan) => {
      const category = getSafeCategory(scan.category);

      const matchesCategory =
        activeFilter === "all" ||
        category === activeFilter;

      return (
        matchesCategory &&
        matchesSearch(scan, searchQuery)
      );
    });
  }, [activeFilter, scans, searchQuery]);

  const confirmDelete = (scanId: string) => {
    if (deletingId) {
      return;
    }

    Alert.alert(
      "Delete this scan?",
      "This result will be removed from your history.",
      [
        {
          text: "Keep it",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!user) {
              return;
            }

            try {
              setDeletingId(scanId);

              await deleteScan(user.uid, scanId);

              setScans((current) =>
                current.filter(
                  (scan) => scan.id !== scanId
                )
              );
            } catch (error: unknown) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Could not delete this scan.";

              Alert.alert("Delete failed", message);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <MaterialCommunityIcons
            name="account-lock-outline"
            size={42}
            color={colors.primary}
          />
        </View>

        <Text style={styles.emptyTitle}>
          Login required
        </Text>

        <Text style={styles.emptyText}>
          Sign in to view your saved scan history.
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
          Loading your history...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: Math.max(insets.top, 12),
        },
      ]}
    >
      <FlatList
        data={filteredScans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HistoryCard
            scan={item}
            deletingId={deletingId}
            onDelete={confirmDelete}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom: insets.bottom + 30,
          },
          filteredScans.length === 0 &&
            styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadScans(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <Pressable
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={21}
                  color="#FFFFFF"
                />
              </Pressable>

              <View style={styles.headerTitleArea}>
                <Text style={styles.title}>
                  Your scans
                </Text>

                <Text style={styles.subtitle}>
                  Your sustainability journey
                </Text>
              </View>

              <View style={styles.headerLeaf}>
                <MaterialCommunityIcons
                  name="leaf"
                  size={22}
                  color={colors.primary}
                />
              </View>
            </View>

            <View style={styles.heroCard}>
              <Image
                source={historyImage}
                style={styles.heroImage}
              />

              <View style={styles.heroOverlay} />

              <View style={styles.heroContent}>
                <View style={styles.heroIcon}>
                  <MaterialCommunityIcons
                    name="chart-line"
                    size={21}
                    color="#FFFFFF"
                  />
                </View>

                <View style={styles.heroText}>
                  <Text style={styles.heroTitle}>
                    Your impact, captured
                  </Text>

                  <Text style={styles.heroDescription}>
                    Review your choices and keep improving one
                    scan at a time.
                  </Text>
                </View>
              </View>
            </View>

            {scans.length > 0 && (
              <View style={styles.summaryRow}>
                <SummaryCard
                  icon="barcode-scan"
                  value={String(scans.length)}
                  label="Total scans"
                />

                <SummaryCard
                  icon="leaf"
                  value={averageScore}
                  label="Average score"
                />

                <SummaryCard
                  icon="recycle"
                  value={String(pathwayCount)}
                  label="Pathways"
                />
              </View>
            )}

            <View style={styles.searchBox}>
              <View style={styles.searchIcon}>
                <MaterialCommunityIcons
                  name="magnify"
                  size={19}
                  color={colors.primary}
                />
              </View>

              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search scans"
                placeholderTextColor={colors.muted}
                style={styles.searchInput}
              />

              {searchQuery.length > 0 && (
                <Pressable
                  style={styles.clearButton}
                  onPress={() => setSearchQuery("")}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={18}
                    color={colors.muted}
                  />
                </Pressable>
              )}
            </View>

            <FlatList
              horizontal
              data={filters}
              keyExtractor={(item) => item.value}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
              renderItem={({ item }) => {
                const active =
                  activeFilter === item.value;

                return (
                  <Pressable
                    style={[
                      styles.filterItem,
                      active && styles.activeFilterItem,
                    ]}
                    onPress={() =>
                      setActiveFilter(item.value)
                    }
                  >
                    <View
                      style={[
                        styles.filterIcon,
                        active &&
                          styles.activeFilterIcon,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={16}
                        color={
                          active
                            ? colors.primary
                            : colors.muted
                        }
                      />
                    </View>

                    <Text
                      style={[
                        styles.filterText,
                        active && styles.activeFilterText,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyHistory
            hasScans={scans.length > 0}
            onScan={() => navigation.navigate("Camera")}
            onClear={() => {
              setSearchQuery("");
              setActiveFilter("all");
            }}
          />
        }
      />
    </View>
  );
}

function SummaryCard({
  icon,
  value,
  label,
}: {
  icon: IconName;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={17}
          color={colors.primary}
        />
      </View>

      <Text style={styles.summaryValue}>
        {value}
      </Text>

      <Text style={styles.summaryLabel}>
        {label}
      </Text>
    </View>
  );
}

function HistoryCard({
  scan,
  deletingId,
  onDelete,
}: {
  scan: ScanRecord;
  deletingId: string | null;
  onDelete: (scanId: string) => void;
}) {
  const category = getSafeCategory(scan.category);
  const meta = getMeta(category);
  const score = getScore(scan);
  const warning = scan.warning?.trim() || "";
  const isDeleting = deletingId === scan.id;

  return (
    <View
      style={[
        styles.historyCard,
        isDeleting && styles.deletingCard,
      ]}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.itemIcon,
            {
              backgroundColor: `${meta.color}18`,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={meta.icon}
            size={23}
            color={meta.color}
          />
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>
            {scan.itemName || "Unknown item"}
          </Text>

          <View style={styles.dateRow}>
            <MaterialCommunityIcons
              name="calendar-outline"
              size={13}
              color={colors.muted}
            />

            <Text style={styles.dateText}>
              {getDateText(scan.createdAt)}
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.deleteButton}
          onPress={() => onDelete(scan.id)}
          disabled={Boolean(deletingId)}
        >
          {isDeleting ? (
            <ActivityIndicator
              size="small"
              color={colors.muted}
            />
          ) : (
            <MaterialCommunityIcons
              name="delete-outline"
              size={21}
              color={colors.muted}
            />
          )}
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        <View
          style={[
            styles.categoryPill,
            {
              backgroundColor: `${meta.color}18`,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={meta.icon}
            size={14}
            color={meta.color}
          />

          <Text
            style={[
              styles.categoryText,
              {
                color: meta.color,
              },
            ]}
          >
            {meta.label}
          </Text>
        </View>

        <View style={styles.confidence}>
          <View
            style={[
              styles.confidenceDot,
              {
                backgroundColor: meta.color,
              },
            ]}
          />

          <Text style={styles.confidenceText}>
            {getConfidence(scan.confidence)}
          </Text>
        </View>
      </View>

      <View style={styles.scorePanel}>
        <View style={styles.scoreIcon}>
          <MaterialCommunityIcons
            name="leaf"
            size={19}
            color={colors.primary}
          />
        </View>

        <View style={styles.scoreContent}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreLabel}>
              Eco score
            </Text>

            <Text style={styles.scoreValue}>
              {score.toFixed(1)}/10
            </Text>
          </View>

          <View style={styles.scoreTrack}>
            <View
              style={[
                styles.scoreFill,
                {
                  width: `${score * 10}%`,
                },
              ]}
            />
          </View>
        </View>
      </View>

      <Text style={styles.advice} numberOfLines={3}>
        {scan.disposalAdvice ||
          "Follow your local disposal guidance."}
      </Text>

      {warning.length > 0 && (
        <View style={styles.warningBox}>
          <View style={styles.warningIcon}>
            <MaterialCommunityIcons
              name="alert-outline"
              size={15}
              color={colors.warningText}
            />
          </View>

          <Text style={styles.warningText} numberOfLines={2}>
            {warning}
          </Text>
        </View>
      )}
    </View>
  );
}

function EmptyHistory({
  hasScans,
  onScan,
  onClear,
}: {
  hasScans: boolean;
  onScan: () => void;
  onClear: () => void;
}) {
  if (hasScans) {
    return (
      <View style={styles.emptyResults}>
        <View style={styles.emptyResultsIcon}>
          <MaterialCommunityIcons
            name="filter-remove-outline"
            size={30}
            color={colors.primary}
          />
        </View>

        <Text style={styles.emptyResultsTitle}>
          No matching scans
        </Text>

        <Text style={styles.emptyResultsText}>
          Try another search or clear your filters.
        </Text>

        <Button
          mode="outlined"
          textColor={colors.primary}
          onPress={onClear}
        >
          Clear filters
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.emptyContent}>
      <View style={styles.emptyIcon}>
        <MaterialCommunityIcons
          name="history"
          size={43}
          color={colors.primary}
        />
      </View>

      <Text style={styles.emptyTitle}>
        Your history is waiting
      </Text>

      <Text style={styles.emptyText}>
        Analyze an item and save the result to build your
        personal sustainability log.
      </Text>

      <Button
        mode="contained"
        icon="camera-outline"
        onPress={onScan}
        contentStyle={styles.scanButton}
      >
        Scan your first item
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingHorizontal: 20,
  },
  emptyList: {
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  headerTitleArea: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 10,
  },
  title: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 24,
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
    marginTop: 1,
  },
  headerLeaf: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  heroCard: {
    height: 108,
    overflow: "hidden",
    borderRadius: 21,
    marginBottom: 14,
    backgroundColor: colors.primary,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.42,
    resizeMode: "cover",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(4,67,48,0.64)",
  },
  heroContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  heroIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  heroText: {
    flex: 1,
    marginLeft: 11,
  },
  heroTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 15,
  },
  heroDescription: {
    fontFamily: "Poppins_400Regular",
    color: "#DDF5E5",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 15,
  },
  summaryCard: {
    flex: 1,
    minHeight: 75,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  summaryValue: {
    maxWidth: 90,
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 16,
    marginTop: 4,
  },
  summaryLabel: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 8,
    marginTop: -1,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    paddingHorizontal: 8,
    borderRadius: 26,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  searchInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 9,
    paddingVertical: 0,
    color: colors.text,
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
  },
  clearButton: {
    padding: 5,
  },
  filterList: {
    gap: 8,
    paddingVertical: 13,
  },
  filterItem: {
    flexDirection: "row",
    alignItems: "center",
    height: 37,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterItem: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterIcon: {
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  activeFilterIcon: {
    backgroundColor: "#FFFFFF",
  },
  filterText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.muted,
    fontSize: 10,
    marginLeft: 5,
  },
  activeFilterText: {
    color: "#FFFFFF",
  },
  historyCard: {
    marginBottom: 13,
    padding: 15,
    borderRadius: 21,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deletingCard: {
    opacity: 0.55,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  itemIcon: {
    width: 47,
    height: 47,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  itemInfo: {
    flex: 1,
    paddingTop: 2,
  },
  itemName: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 16,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  dateText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
  },
  deleteButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  categoryText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 10,
  },
  confidence: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
  },
  confidenceDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  confidenceText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
  },
  scorePanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 14,
    padding: 10,
    borderRadius: 14,
    backgroundColor: "#F2F9F3",
  },
  scoreIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  scoreContent: {
    flex: 1,
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scoreLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 11,
  },
  scoreValue: {
    fontFamily: "Poppins_700Bold",
    color: colors.primary,
    fontSize: 15,
  },
  scoreTrack: {
    height: 5,
    marginTop: 5,
    overflow: "hidden",
    borderRadius: 4,
    backgroundColor: "#DCEBDF",
  },
  scoreFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  advice: {
    fontFamily: "Poppins_400Regular",
    color: colors.text,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 12,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    marginTop: 10,
    padding: 9,
    borderRadius: 12,
    backgroundColor: "#FFF4E3",
  },
  warningIcon: {
    width: 23,
    height: 23,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE6B7",
  },
  warningText: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    color: colors.warningText,
    fontSize: 10,
    lineHeight: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: colors.background,
  },
  emptyContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 65,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
    marginBottom: 8,
  },
  emptyTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 18,
    textAlign: "center",
  },
  emptyText: {
    maxWidth: 290,
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  emptyResults: {
    alignItems: "center",
    paddingTop: 55,
  },
  emptyResultsIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
    marginBottom: 12,
  },
  emptyResultsTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 17,
  },
  emptyResultsText: {
    maxWidth: 260,
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 14,
  },
  scanButton: {
    height: 50,
    paddingHorizontal: 10,
  },
});