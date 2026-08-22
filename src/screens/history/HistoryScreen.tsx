import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Card, Chip, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { categoryMeta } from "../../constants/categories";
import { colors } from "../../constants/theme";
import { getUserScans } from "../../services/firebase/scans.service";
import { useAuthStore } from "../../stores/auth.store";
import { SavedScan } from "../../types/scan";

export default function HistoryScreen() {
  const user = useAuthStore((state) => state.user);

  const [scans, setScans] = useState<SavedScan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadScans = useCallback(async () => {
    if (!user) {
      setScans([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const savedScans = await getUserScans(user.uid);
      setScans(savedScans);
    } catch (error) {
      console.warn("Could not load scans:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadScans();
    }, [loadScans])
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your scans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your history</Text>

      <Text style={styles.subtitle}>
        Every scan is a small step toward smarter choices.
      </Text>

      <FlatList
        data={scans}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          scans.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons
                name="history"
                size={42}
                color={colors.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>No saved scans yet</Text>

            <Text style={styles.emptyText}>
              Your saved item results will appear here.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const meta = categoryMeta[item.category];

          return (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardTop}>
                  <View style={styles.itemIcon}>
                    <MaterialCommunityIcons
                      name={meta.icon as never}
                      size={26}
                      color={meta.color}
                    />
                  </View>

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.itemName}</Text>

                    <Text style={styles.date}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>

                  <Text style={styles.score}>{item.ecoScore}/10</Text>
                </View>

                <Chip
                  icon={meta.icon}
                  style={{
                    alignSelf: "flex-start",
                    backgroundColor: `${meta.color}20`,
                  }}
                  textStyle={{ color: meta.color }}
                >
                  {meta.label}
                </Chip>

                <Text style={styles.advice}>{item.disposalAdvice}</Text>
              </Card.Content>
            </Card>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  heading: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 28,
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    lineHeight: 21,
    marginTop: 5,
    marginBottom: 18,
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.surface,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  itemIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 15,
  },
  date: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 11,
    marginTop: 3,
  },
  score: {
    fontFamily: "Poppins_700Bold",
    color: colors.primary,
    fontSize: 17,
  },
  advice: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    lineHeight: 20,
    fontSize: 13,
    marginTop: 12,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    marginTop: 12,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 30,
  },
  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
    marginBottom: 18,
  },
  emptyTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 18,
  },
  emptyText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    textAlign: "center",
    marginTop: 6,
  },
});