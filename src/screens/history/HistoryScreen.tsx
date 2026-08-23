import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
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

const fallbackMeta = {
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

export default function HistoryScreen({
  navigation,
}: Props) {
  const user = useAuthStore((state) => state.user);

  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  useState(() => {
    loadScans();
  });

  const confirmDelete = (scanId: string) => {
    Alert.alert(
      "Delete scan?",
      "This scan will be removed from your history.",
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
              await deleteScan(user?.uid ?? "", scanId);

              setScans((current) =>
                current.filter((scan) => scan.id !== scanId)
              );
            } catch (error: unknown) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Could not delete this scan.";

              Alert.alert("Delete failed", message);
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

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardTop}>
            <View style={styles.titleArea}>
              <Text style={styles.itemName}>
                {item.itemName || "Unknown item"}
              </Text>

              <Text style={styles.date}>
                {getDateText(item.createdAt)}
              </Text>
            </View>

            <Button
              mode="text"
              icon="delete-outline"
              textColor={colors.muted}
              compact
              onPress={() => confirmDelete(item.id)}
            >
              ""
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
              textStyle={{ color: meta.color }}
            >
              {meta.label}
            </Chip>

            <Text style={styles.confidence}>
              {item.confidence || "unknown"} confidence
            </Text>
          </View>

          <View style={styles.scoreRow}>
            <MaterialCommunityIcons
              name="leaf"
              size={19}
              color={colors.primary}
            />

            <Text style={styles.scoreText}>
              Eco score {Number(item.ecoScore) || 0}/10
            </Text>
          </View>

          <Text style={styles.advice} numberOfLines={3}>
            {item.disposalAdvice ||
              "Follow your local disposal guidance."}
          </Text>

          {warning.length > 0 && (
            <Text style={styles.warning} numberOfLines={2}>
              {warning}
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="account-lock-outline"
          size={58}
          color={colors.muted}
        />

        <Text style={styles.emptyTitle}>
          Login required
        </Text>

        <Text style={styles.emptyText}>
          Sign in to view your saved scan history.
        </Text>
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
          Loading history...
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
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Scan history</Text>

            <Text style={styles.subtitle}>
              Your saved sustainability decisions.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContent}>
            <MaterialCommunityIcons
              name="history"
              size={58}
              color={colors.muted}
            />

            <Text style={styles.emptyTitle}>
              No saved scans yet
            </Text>

            <Text style={styles.emptyText}>
              Analyze an item and save it to see it here.
            </Text>

            <Button
              mode="contained"
              icon="camera-outline"
              onPress={() => navigation.navigate("Camera")}
            >
              Scan an item
            </Button>
          </View>
        }
      />
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
    paddingBottom: 32,
  },
  emptyList: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 28,
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  card: {
    marginBottom: 14,
    backgroundColor: colors.surface,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  titleArea: {
    flex: 1,
  },
  itemName: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 17,
  },
  date: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 11,
    marginTop: 3,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },
  categoryChip: {
    alignSelf: "flex-start",
  },
  confidence: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 12,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 14,
  },
  scoreText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 13,
  },
  advice: {
    fontFamily: "Poppins_400Regular",
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
  warning: {
    fontFamily: "Poppins_400Regular",
    color: colors.warningText,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
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
  emptyTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 18,
    textAlign: "center",
  },
  emptyText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});