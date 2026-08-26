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
import { Button, Card, Chip, Text } from "react-native-paper";
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

type Meta = {
  label: string;
  icon: IconName | string;
  color: string;
};

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

function getConfidenceLabel(value: unknown): string {
  if (typeof value !== "string") {
    return "Unknown confidence";
  }

  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return "Unknown confidence";
  }

  return `${normalized} confidence`;
}

function getMeta(category: DisposalCategory): Meta {
  const meta = categoryMeta[category] as
    | {
        label?: string;
        icon?: string;
        color?: string;
      }
    | undefined;

  return {
    label: meta?.label || fallbackMeta.label,
    icon: (meta?.icon ||
      fallbackMeta.icon) as IconName,
    color: meta?.color || fallbackMeta.color,
  };
}

function matchesSearch(
  scan: ScanRecord,
  query: string
): boolean {
  if (!query.trim()) {
    return true;
  }

  const text = [
    scan.itemName,
    scan.category,
    scan.disposalAdvice,
    scan.warning,
    scan.confidence,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return text.includes(query.trim().toLowerCase());
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

        const records = await getUserScans(user.uid);

        const sortedRecords = [...records].sort(
          (first, second) => {
            const firstDate =
              getDate(first.createdAt)?.getTime() || 0;
            const secondDate =
              getDate(second.createdAt)?.getTime() || 0;

            return secondDate - firstDate;
          }
        );

        setScans(sortedRecords);
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

  const topCategory = useMemo(() => {
    if (scans.length === 0) {
      return "No data";
    }

    const counts = scans.reduce<Record<string, number>>(
      (result, scan) => {
        const category = getSafeCategory(scan.category);
        result[category] = (result[category] || 0) + 1;
        return result;
      },
      {}
    );

    const category = Object.entries(counts).sort(
      (first, second) => second[1] - first[1]
    )[0]?.[0];

    return category ? getMeta(category as DisposalCategory).label : "Other";
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

        <Text style={styles.emptyDescription}>
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

        <Text style={styles.emptyDescription}>
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
          paddingTop: Math.max(insets.top, 16),
        },
      ]}
    >
      <FlatList
        data={filteredScans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ScanHistoryCard
            scan={item}
            deletingId={deletingId}
            onDelete={confirmDelete}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom: insets.bottom + 28,
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
            <View style={styles.headerTop}>
              <View style={styles.headerText}>
                <Text style={styles.title}>
                  Your history
                </Text>

                <Text style={styles.subtitle}>
                  Every scan is a step toward less waste.
                </Text>
              </View>

              <View style={styles.headerIcon}>
                <MaterialCommunityIcons
                  name="history"
                  size={24}
                  color={colors.primary}
                />
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
                  value={topCategory}
                  label="Top pathway"
                  compact
                />
              </View>
            )}

            <View style={styles.searchBox}>
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color={colors.muted}
              />

              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search your scans"
                placeholderTextColor={colors.muted}
                style={styles.searchInput}
              />

              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => setSearchQuery("")}
                  style={styles.clearButton}
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
                  <Chip
                    icon={item.icon}
                    selected={active}
                    onPress={() =>
                      setActiveFilter(item.value)
                    }
                    style={[
                      styles.filterChip,
                      active && styles.activeFilterChip,
                    ]}
                    textStyle={[
                      styles.filterText,
                      active && styles.activeFilterText,
                    ]}
                    selectedColor="#FFFFFF"
                  >
                    {item.label}
                  </Chip>
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
  compact = false,
}: {
  icon: IconName;
  value: string;
  label: string;
  compact?: boolean;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={colors.primary}
        />
      </View>

      <View style={styles.summaryCopy}>
        <Text
          style={[
            styles.summaryValue,
            compact && styles.compactSummaryValue,
          ]}
          numberOfLines={1}
        >
          {value}
        </Text>

        <Text style={styles.summaryLabel}>
          {label}
        </Text>
      </View>
    </View>
  );
}

function ScanHistoryCard({
  scan,
  deletingId,
  onDelete,
}: {
  scan: ScanRecord;
  deletingId: string | null;
  onDelete: (scanId: string) => void;
}) {
  const safeCategory = getSafeCategory(scan.category);
  const meta = getMeta(safeCategory);
  const warning = scan.warning?.trim() || "";
  const score = getScore(scan);
  const isDeleting = deletingId === scan.id;

  return (
    <Card
      style={[
        styles.scanCard,
        isDeleting && styles.deletingCard,
      ]}
    >
      <Card.Content>
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
              name={meta.icon as IconName}
              size={23}
              color={meta.color}
            />
          </View>

          <View style={styles.itemTitleArea}>
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
            onPress={() => onDelete(scan.id)}
            disabled={Boolean(deletingId)}
            style={styles.deleteButton}
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
              name={meta.icon as IconName}
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
              {getConfidenceLabel(scan.confidence)}
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
      </Card.Content>
    </Card>
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
          Try a different search term or clear your filters.
        </Text>

        <Button
          mode="outlined"
          onPress={onClear}
          textColor={colors.primary}
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

      <Text style={styles.emptyDescription}>
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
    paddingBottom: 30,
  },
  emptyList: {
    flexGrow: 1,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 28,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
  },
  summaryCard: {
    flex: 1,
    minHeight: 70,
    padding: 9,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryIcon: {
    width: 29,
    height: 29,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  summaryCopy: {
    marginTop: 5,
  },
  summaryValue: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 16,
  },
  compactSummaryValue: {
    fontSize: 11,
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
    height: 48,
    paddingHorizontal: 13,
    marginTop: 18,
    borderRadius: 15,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 9,
    paddingVertical: 0,
    fontFamily: "Poppins_400Regular",
    color: colors.text,
    fontSize: 12,
  },
  clearButton: {
    padding: 3,
  },
  filterList: {
    gap: 8,
    paddingVertical: 13,
  },
  filterChip: {
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.muted,
    fontSize: 10,
  },
  activeFilterText: {
    color: "#FFFFFF",
  },
  scanCard: {
    marginBottom: 13,
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
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  itemTitleArea: {
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
    paddingHorizontal: 10,
    height: 30,
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
    borderRadius: 11,
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
    paddingVertical: 70,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
    marginBottom: 7,
  },
  emptyTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 18,
    textAlign: "center",
  },
  emptyDescription: {
    maxWidth: 290,
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  emptyResults: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyResultsIcon: {
    width: 66,
    height: 66,
    borderRadius: 23,
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