import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import * as Haptics from "expo-haptics";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Button, Card, Chip, Divider, Text } from "react-native-paper";

import { categoryMeta } from "../../constants/categories";
import { colors } from "../../constants/theme";
import { RootStackParamList } from "../../navigation/types";
import { useScanStore } from "../../stores/scan.store";

type Props = NativeStackScreenProps<RootStackParamList, "Result">;

export default function ResultScreen({ navigation }: Props) {
  const result = useScanStore((state) => state.result);
  const resetScan = useScanStore((state) => state.resetScan);

  if (!result) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="file-question-outline"
          size={58}
          color={colors.muted}
        />

        <Text style={styles.emptyTitle}>No scan result found</Text>

        <Button
          mode="contained"
          icon="camera-outline"
          onPress={() => navigation.navigate("Camera")}
        >
          Scan an item
        </Button>
      </View>
    );
  }

  const meta = categoryMeta[result.category];

  const handleSaveDemo = async () => {
    await Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    );

    Alert.alert(
      "Saved successfully",
      "This scan will be saved to your history when Firebase is connected.",
      [
        {
          text: "Scan another",
          onPress: () => {
            resetScan();
            navigation.popToTop();
          },
        },
      ]
    );
  };

  const handleScanAnother = () => {
    resetScan();
    navigation.navigate("Camera");
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.successHeader}>
        <View style={styles.successIcon}>
          <MaterialCommunityIcons
            name="check"
            size={28}
            color="#FFFFFF"
          />
        </View>

        <Text style={styles.successText}>Analysis complete</Text>
      </View>

      <Text style={styles.itemName}>{result.itemName}</Text>

      <View style={styles.categoryRow}>
        <Chip
          icon={meta.icon}
          style={[
            styles.categoryChip,
            { backgroundColor: `${meta.color}20` },
          ]}
          textStyle={{ color: meta.color }}
        >
          {meta.label}
        </Chip>

        <View style={styles.confidence}>
          <View
            style={[
              styles.confidenceDot,
              { backgroundColor: meta.color },
            ]}
          />
          <Text style={styles.confidenceText}>
            {result.confidence} confidence
          </Text>
        </View>
      </View>

      <Card style={styles.scoreCard}>
        <Card.Content style={styles.scoreContent}>
          <View style={styles.scoreIcon}>
            <MaterialCommunityIcons
              name="leaf"
              size={29}
              color={colors.primary}
            />
          </View>

          <View style={styles.scoreCopy}>
            <Text style={styles.scoreLabel}>Eco score</Text>
            <Text style={styles.scoreDescription}>
              Your choice can help reduce waste.
            </Text>
          </View>

          <Text style={styles.scoreValue}>{result.ecoScore}/10</Text>
        </Card.Content>
      </Card>

      <Card style={styles.adviceCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <MaterialCommunityIcons
                name="information-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <Text style={styles.cardTitle}>What should you do?</Text>
          </View>

          <Divider style={styles.divider} />

          <Text style={styles.bodyText}>{result.disposalAdvice}</Text>
        </Card.Content>
      </Card>

      {result.reuseIdea.length > 0 && (
        <Card style={styles.reuseCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.reuseIcon}>
                <MaterialCommunityIcons
                  name="lightbulb-on-outline"
                  size={22}
                  color="#C87912"
                />
              </View>

              <Text style={styles.cardTitle}>Creative reuse idea</Text>
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.bodyText}>{result.reuseIdea}</Text>
          </Card.Content>
        </Card>
      )}

      {result.warning.length > 0 && (
        <Card style={styles.warningCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.warningIcon}>
                <MaterialCommunityIcons
                  name="alert-outline"
                  size={22}
                  color={colors.warningText}
                />
              </View>

              <Text style={styles.warningTitle}>Important</Text>
            </View>

            <Text style={styles.warningText}>{result.warning}</Text>
          </Card.Content>
        </Card>
      )}

      <Button
        mode="contained"
        icon="content-save-outline"
        contentStyle={styles.saveButton}
        onPress={handleSaveDemo}
      >
        Save to history
      </Button>

      <Button
        mode="outlined"
        icon="camera-outline"
        contentStyle={styles.scanAnotherButton}
        onPress={handleScanAnother}
      >
        Scan another item
      </Button>

      <Text style={styles.disclaimer}>
        SnapSort provides general guidance only. Local disposal rules may vary.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 36,
    backgroundColor: colors.background,
  },
  successHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  successIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  successText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 14,
  },
  itemName: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 30,
    lineHeight: 38,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 12,
  },
  categoryChip: {
    alignSelf: "flex-start",
  },
  confidence: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  confidenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  confidenceText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 12,
  },
  scoreCard: {
    marginTop: 22,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: "#C6EAD0",
  },
  scoreContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scoreIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
    fontSize: 15,
  },
  scoreDescription: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  scoreValue: {
    fontFamily: "Poppins_700Bold",
    color: colors.primary,
    fontSize: 22,
  },
  adviceCard: {
    marginTop: 14,
    backgroundColor: colors.surface,
  },
  reuseCard: {
    marginTop: 14,
    backgroundColor: "#FFF9EF",
  },
  warningCard: {
    marginTop: 14,
    backgroundColor: colors.warningBackground,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  reuseIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE6B8",
  },
  warningIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE4BF",
  },
  cardTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 15,
  },
  warningTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.warningText,
    fontSize: 15,
  },
  divider: {
    marginVertical: 14,
  },
  bodyText: {
    fontFamily: "Poppins_400Regular",
    color: colors.text,
    lineHeight: 23,
    fontSize: 14,
  },
  warningText: {
    fontFamily: "Poppins_400Regular",
    color: colors.warningText,
    lineHeight: 21,
    fontSize: 13,
    marginTop: 12,
  },
  saveButton: {
    height: 54,
  },
  scanAnotherButton: {
    height: 52,
  },
  disclaimer: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
    marginTop: 18,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 24,
    backgroundColor: colors.background,
  },
  emptyTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 18,
  },
});