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
import type { RootStackParamList } from "../../navigation/types";
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
const DANGER = "#B3261E";
const WARNING_BACKGROUND = "#FFF6E7";
const WARNING_BORDER = "#F6D99F";

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
  {
    value: "hazardous",
    label: "Hazardous",
    icon: "alert-outline",
  },
];

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

function getMeta(
  category: DisposalCategory
): Meta {
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

function getDateText(value: unknown): string {
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
    return "Confidence unavailable";
  }

  return `${value.trim().toLowerCase()} confidence`;
}

function matchesSearch(
  scan: ScanRecord,
  query: string
): boolean {
  const searchValue = query.trim().toLowerCase();

  if (!searchValue) {
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

  return searchableText.includes(searchValue);
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
            : "Could not load your scan history.";

        Alert.alert("History error", message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [user]
  );

  useEffect(() => {
    void loadScans();
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
    return new Set(
      scans.map((scan) =>
        getSafeCategory(scan.category)
      )
    ).size;
  }, [scans]);

  const filteredScans = useMemo(() => {
    return scans.filter((scan) => {
      const category = getSafeCategory(scan.category);

      const filterMatches =
        activeFilter === "all" ||
        category === activeFilter;

      return (
        filterMatches &&
        matchesSearch(scan, searchQuery)
      );
    });
  }, [activeFilter, scans, searchQuery]);

  const confirmDelete = (scanId: string) => {
    if (deletingId || !user) {
      return;
    }

    Alert.alert(
      "Delete this scan?",
      "This saved result will be permanently removed from your scan history.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(scanId);

              await deleteScan(user.uid, scanId);

              setScans((currentScans) =>
                currentScans.filter(
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

  const clearSearchAndFilters = () => {
    setSearchQuery("");
    setActiveFilter("all");
  };

  if (!user) {
    return (
      <View style={styles.centerScreen}>
        <View style={styles.centerIcon}>
          <MaterialCommunityIcons
            name="account-lock-outline"
            size={40}
            color={FOREST}
          />
        </View>

        <Text style={styles.centerTitle}>
          Sign in to view history
        </Text>

        <Text style={styles.centerText}>
          Your saved scan results are available after you sign in.
        </Text>

        <Button
          mode="contained"
          onPress={() => navigation.navigate("Login")}
          buttonColor={FOREST}
          contentStyle={styles.primaryButton}
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
          Loading your scan history...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadScans(true)}
            tintColor={FOREST}
            colors={[FOREST]}
          />
        }
        contentContainerStyle={[
          styles.list,
          {
            paddingTop: Math.max(
              insets.top + 8,
              18
            ),
            paddingBottom: insets.bottom + 32,
          },
          filteredScans.length === 0 &&
            styles.emptyList,
        ]}
        ListHeaderComponent={
          <View>
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
                Scan history
              </Text>

              <View style={styles.navigationSpace} />
            </View>

            <View style={styles.heroSection}>
              <View style={styles.heroIconRing}>
                <View style={styles.heroIcon}>
                  <MaterialCommunityIcons
                    name="history"
                    size={26}
                    color={WHITE}
                  />
                </View>
              </View>

              <Text style={styles.pageTitle}>
                Your scan history
              </Text>

              <Text style={styles.pageDescription}>
                Review your saved results and track the choices
                you have made over time.
              </Text>
            </View>

            {scans.length > 0 ? (
              <>
                <View style={styles.summaryRow}>
                  <SummaryCard
                    icon="barcode-scan"
                    value={String(scans.length)}
                    label="Total scans"
                  />

                  <SummaryCard
                    icon="leaf"
                    value={averageScore}
                    label="Avg. score"
                  />

                  <SummaryCard
                    icon="recycle"
                    value={String(pathwayCount)}
                    label="Pathways"
                  />
                </View>

                <View style={styles.searchBox}>
                  <View style={styles.searchIcon}>
                    <MaterialCommunityIcons
                      name="magnify"
                      size={19}
                      color={FOREST}
                    />
                  </View>

                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search your scans"
                    placeholderTextColor={MUTED}
                    style={styles.searchInput}
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyType="search"
                  />

                  {searchQuery.length > 0 ? (
                    <Pressable
                      style={styles.clearButton}
                      onPress={() => setSearchQuery("")}
                      accessibilityRole="button"
                      accessibilityLabel="Clear search"
                    >
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={18}
                        color={MUTED}
                      />
                    </Pressable>
                  ) : null}
                </View>

                <FlatList
                  horizontal
                  data={filters}
                  keyExtractor={(item) => item.value}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterList}
                  renderItem={({ item }) => {
                    const isActive =
                      activeFilter === item.value;

                    return (
                      <Pressable
                        style={[
                          styles.filterItem,
                          isActive &&
                            styles.filterItemActive,
                        ]}
                        onPress={() =>
                          setActiveFilter(item.value)
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`Filter by ${item.label}`}
                      >
                        <MaterialCommunityIcons
                          name={item.icon}
                          size={15}
                          color={
                            isActive
                              ? WHITE
                              : MUTED
                          }
                        />

                        <Text
                          style={[
                            styles.filterText,
                            isActive &&
                              styles.filterTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  }}
                />

                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsTitle}>
                    {filteredScans.length === scans.length
                      ? "Recent scans"
                      : `${filteredScans.length} result${
                          filteredScans.length === 1
                            ? ""
                            : "s"
                        }`}
                  </Text>

                  {activeFilter !== "all" ||
                  searchQuery.length > 0 ? (
                    <Pressable
                      onPress={clearSearchAndFilters}
                      accessibilityRole="button"
                      accessibilityLabel="Clear filters"
                    >
                      <Text style={styles.clearFiltersText}>
                        Clear filters
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyHistory
            hasScans={scans.length > 0}
            onScan={() => navigation.navigate("Camera")}
            onClear={clearSearchAndFilters}
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
          color={FOREST}
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
            size={22}
            color={meta.color}
          />
        </View>

        <View style={styles.itemInfo}>
          <Text
            style={styles.itemName}
            numberOfLines={1}
          >
            {scan.itemName || "Unknown item"}
          </Text>

          <View style={styles.dateRow}>
            <MaterialCommunityIcons
              name="calendar-outline"
              size={13}
              color={MUTED}
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
          accessibilityRole="button"
          accessibilityLabel={`Delete ${
            scan.itemName || "scan"
          }`}
        >
          {isDeleting ? (
            <ActivityIndicator
              size="small"
              color={MUTED}
            />
          ) : (
            <MaterialCommunityIcons
              name="delete-outline"
              size={20}
              color={MUTED}
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
            size={13}
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

        <View style={styles.confidenceRow}>
          <View
            style={[
              styles.confidenceDot,
              {
                backgroundColor: meta.color,
              },
            ]}
          />

          <Text
            style={styles.confidenceText}
            numberOfLines={1}
          >
            {getConfidence(scan.confidence)}
          </Text>
        </View>
      </View>

      <View style={styles.scoreBox}>
        <View style={styles.scoreTopRow}>
          <View style={styles.scoreLabelRow}>
            <MaterialCommunityIcons
              name="leaf"
              size={15}
              color={FOREST}
            />

            <Text style={styles.scoreLabel}>
              Eco score
            </Text>
          </View>

          <Text style={styles.scoreValue}>
            {score.toFixed(1)}
            <Text style={styles.scoreOutOf}>/10</Text>
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

      <Text
        style={styles.advice}
        numberOfLines={3}
      >
        {scan.disposalAdvice ||
          "Follow your local disposal guidance for this item."}
      </Text>

      {warning.length > 0 ? (
        <View style={styles.warningBox}>
          <MaterialCommunityIcons
            name="alert-outline"
            size={16}
            color={DANGER}
          />

          <Text
            style={styles.warningText}
            numberOfLines={2}
          >
            {warning}
          </Text>
        </View>
      ) : null}
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
      <View style={styles.emptyContent}>
        <View style={styles.emptyIcon}>
          <MaterialCommunityIcons
            name="filter-remove-outline"
            size={34}
            color={FOREST}
          />
        </View>

        <Text style={styles.emptyTitle}>
          No matching scans
        </Text>

        <Text style={styles.emptyText}>
          Try another search term or clear your selected filters.
        </Text>

        <Button
          mode="outlined"
          textColor={FOREST}
          onPress={onClear}
          contentStyle={styles.outlineButton}
          style={styles.emptyButton}
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
          size={39}
          color={FOREST}
        />
      </View>

      <Text style={styles.emptyTitle}>
        No scans yet
      </Text>

      <Text style={styles.emptyText}>
        Scan your first item to begin building your personal
        disposal history.
      </Text>

      <Button
        mode="contained"
        icon="camera-outline"
        buttonColor={FOREST}
        onPress={onScan}
        contentStyle={styles.primaryButton}
        style={styles.emptyButton}
      >
        Scan an item
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  list: {
    paddingHorizontal: 20,
  },

  emptyList: {
    flexGrow: 1,
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
    paddingTop: 23,
    paddingBottom: 24,
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
    maxWidth: 300,
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 4,
  },

  summaryRow: {
    flexDirection: "row",
    marginBottom: 16,
  },

  summaryCard: {
    flex: 1,
    minHeight: 82,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginHorizontal: 3,
    borderRadius: 18,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  summaryIcon: {
    width: 29,
    height: 29,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  summaryValue: {
    fontFamily: "Poppins_700Bold",
    color: TEXT,
    fontSize: 16,
    marginTop: 4,
  },

  summaryLabel: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 8,
    marginTop: -1,
  },

  searchBox: {
    height: 51,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderRadius: 26,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  searchIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  searchInput: {
    flex: 1,
    height: 49,
    paddingHorizontal: 9,
    paddingVertical: 0,
    color: TEXT,
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
  },

  clearButton: {
    padding: 5,
  },

  filterList: {
    paddingVertical: 13,
  },

  filterItem: {
    height: 37,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginRight: 8,
    borderRadius: 19,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  filterItemActive: {
    backgroundColor: FOREST,
    borderColor: FOREST,
  },

  filterText: {
    fontFamily: "Poppins_600SemiBold",
    color: MUTED,
    fontSize: 9,
    marginLeft: 5,
  },

  filterTextActive: {
    color: WHITE,
  },

  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  resultsTitle: {
    fontFamily: "Poppins_700Bold",
    color: TEXT,
    fontSize: 15,
  },

  clearFiltersText: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 9,
  },

  historyCard: {
    padding: 15,
    marginBottom: 12,
    borderRadius: 22,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
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
    minWidth: 0,
    paddingTop: 2,
  },

  itemName: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 15,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  dateText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    marginLeft: 4,
  },

  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAF8",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },

  categoryPill: {
    height: 29,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    borderRadius: 15,
  },

  categoryText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 9,
    marginLeft: 5,
  },

  confidenceRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
    marginLeft: 10,
  },

  confidenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  confidenceText: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
  },

  scoreBox: {
    padding: 11,
    marginTop: 13,
    borderRadius: 15,
    backgroundColor: PALE_GREEN,
  },

  scoreTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  scoreLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  scoreLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 10,
    marginLeft: 5,
  },

  scoreValue: {
    fontFamily: "Poppins_700Bold",
    color: FOREST,
    fontSize: 14,
  },

  scoreOutOf: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
  },

  scoreTrack: {
    height: 5,
    overflow: "hidden",
    marginTop: 7,
    borderRadius: 4,
    backgroundColor: "#D6E8D9",
  },

  scoreFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: FOREST,
  },

  advice: {
    fontFamily: "Poppins_400Regular",
    color: TEXT,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 12,
  },

  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 10,
    marginTop: 10,
    borderRadius: 13,
    backgroundColor: WARNING_BACKGROUND,
    borderWidth: 1,
    borderColor: WARNING_BORDER,
  },

  warningText: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    color: DANGER,
    fontSize: 9,
    lineHeight: 14,
    marginLeft: 7,
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
    backgroundColor: LIGHT_GREEN,
    marginBottom: 14,
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

  emptyContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 43,
    paddingBottom: 45,
  },

  emptyIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
    marginBottom: 13,
  },

  emptyTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 17,
    textAlign: "center",
  },

  emptyText: {
    maxWidth: 280,
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 4,
  },

  emptyButton: {
    marginTop: 17,
  },

  primaryButton: {
    height: 48,
    paddingHorizontal: 10,
  },

  outlineButton: {
    height: 45,
    paddingHorizontal: 8,
  },
});