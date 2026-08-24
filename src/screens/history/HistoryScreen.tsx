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
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Button, Card, Chip, Text } from "react-native-paper";

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

type Meta = {
  label: string;
  icon: string;
  color: string;
};

const fallbackMeta: Meta = {
  label: "Other",
  icon: "help-circle-outline",
  color: colors.muted,
};

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

function getDateText(value: unknown): string {
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

function getScore(scan: ScanRecord): number {
  return Math.max(
    0,
    Math.min(10, Number(scan.ecoScore) || 0)
  );
}

export default function HistoryScreen({
  navigation,
}: Props) {
  const user = useAuthStore((state) => state.user);

  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(
    null
  );

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
    if (scans.length === 0) return "0.0";

    const total = scans.reduce(
      (sum, scan) => sum + getScore(scan),
      0
    );

    return (total / scans.length).toFixed(1);
  }, [scans]);

  const confirmDelete = (scanId: string) => {
    if (deletingId) return;

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
            if (!user) return;

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

  const renderItem = ({
    item,
  }: {
    item: ScanRecord;
  }) => {
    const safeCategory = getSafeCategory(item.category);
    const meta =
      categoryMeta[safeCategory] ?? fallbackMeta;

    const warning = item.warning?.trim() ?? "";
    const score = getScore(item);
    const isDeleting = deletingId === item.id;

    return (
      <Card
        style={[
          styles.card,
          isDeleting && styles.cardDeleting,
        ]}
      >
        <Card.Content>
          <View style={styles.cardTop}>
            <View style={styles.itemIcon}>
              <MaterialCommunityIcons
                name={meta.icon as any}
                size={23}
                color={meta.color}
              />
            </View>

            <View style={styles.titleArea}>
              <Text style={styles.itemName}>
                {item.itemName || "Unknown item"}
              </Text>

              <View style={styles.dateRow}>
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={13}
                  color={colors.muted}
                />

                <Text style={styles.date}>
                  {getDateText(item.createdAt)}
                </Text>
              </View>
            </View>

            <Button
              mode="text"
              icon={
                isDeleting
                  ? undefined
                  : "delete-outline"
              }
              textColor={colors.muted}
              compact
              disabled={Boolean(deletingId)}
              loading={isDeleting}
              onPress={() => confirmDelete(item.id)}
              contentStyle={styles.deleteButton}
            >
              {isDeleting ? "" : ""}
            </Button>
          </View>

          <View style={styles.metaRow}>
            <Chip
              icon={meta.icon}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: `${meta.color}20`,
                },
              ]}
              textStyle={{
                color: meta.color,
              }}
            >
              {meta.label}
            </Chip>

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
                {item.confidence || "unknown"} confidence
              </Text>
            </View>
          </View>

          <View style={styles.scorePanel}>
            <View style={styles.scoreIcon}>
              <MaterialCommunityIcons
                name="leaf"
                size={20}
                color={colors.primary}
              />
            </View>

            <View style={styles.scoreCopy}>
              <Text style={styles.scoreLabel}>
                Eco score
              </Text>

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

            <Text style={styles.scoreValue}>
              {score}/10
            </Text>
          </View>

          <Text style={styles.advice} numberOfLines={3}>
            {item.disposalAdvice ||
              "Follow your local disposal guidance."}
          </Text>

          {warning.length > 0 && (
            <View style={styles.warningBox}>
              <MaterialCommunityIcons
                name="alert-outline"
                size={16}
                color={colors.warningText}
              />

              <Text style={styles.warning} numberOfLines={2}>
                {warning}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
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
    <View style={styles.screen}>
      <FlatList
        data={scans}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          scans.length === 0
            ? styles.emptyList
            : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadScans(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.title}>
                  Your history
                </Text>

                <Text style={styles.subtitle}>
                  Every scan is a step toward less waste.
                </Text>
              </View>

              <View style={styles.headerLeaf}>
                <MaterialCommunityIcons
                  name="leaf"
                  size={25}
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
                  icon="leaf-outline"
                  value={averageScore}
                  label="Avg. eco score"
                />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
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
              Analyze an item and save the result to build
              your personal sustainability log.
            </Text>

            <Button
              mode="contained"
              icon="camera-outline"
              onPress={() => navigation.navigate("Camera")}
              contentStyle={styles.scanButton}
            >
              Scan your first item
            </Button>
          </View>
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
  icon: string;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryIcon}>
        <MaterialCommunityIcons
          name={icon as any}
          size={19}
          color={colors.primary}
        />
      </View>

      <View>
        <Text style={styles.summaryValue}>{value}</Text>
        <Text style={styles.summaryLabel}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 20,
    paddingBottom: 34,
  },
  emptyList: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 28,
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  headerLeaf: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 11,
    marginTop: 18,
  },
  summaryCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    padding: 12,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  summaryValue: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 17,
  },
  summaryLabel: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 9,
    marginTop: -2,
  },
  card: {
    marginBottom: 14,
    backgroundColor: colors.surface,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardDeleting: {
    opacity: 0.55,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  itemIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
    marginRight: 11,
  },
  titleArea: {
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
  date: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
  },
  deleteButton: {
    minWidth: 32,
    height: 34,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },
  categoryChip: {
    alignSelf: "flex-start",
  },
  confidence: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  confidenceDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  confidenceText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 11,
  },
  scorePanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 15,
    padding: 10,
    borderRadius: 14,
    backgroundColor: "#F4FAF5",
  },
  scoreIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  scoreCopy: {
    flex: 1,
  },
  scoreLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 11,
  },
  scoreTrack: {
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: "#DCEBDF",
    marginTop: 4,
  },
  scoreFill: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  scoreValue: {
    fontFamily: "Poppins_700Bold",
    color: colors.primary,
    fontSize: 16,
  },
  advice: {
    fontFamily: "Poppins_400Regular",
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 10,
    padding: 9,
    borderRadius: 11,
    backgroundColor: "#FFF4E3",
  },
  warning: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    color: colors.warningText,
    fontSize: 11,
    lineHeight: 17,
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
    marginBottom: 5,
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
    textAlign: "center",
    lineHeight: 20,
  },
  scanButton: {
    height: 50,
    paddingHorizontal: 10,
  },
});