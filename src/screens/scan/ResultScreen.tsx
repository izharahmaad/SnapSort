import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { categoryMeta } from "../../constants/categories";
import { colors } from "../../constants/theme";
import type { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../stores/auth.store";
import { useScanStore } from "../../stores/scan.store";
import { saveScan } from "../../services/firebase/scans.service";
import type { DisposalCategory } from "../../types/scan";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Result"
>;

type IconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

const WHITE = "#FFFFFF";
const FOREST = "#075C34";
const DARK_FOREST = "#053D23";
const TEXT = "#17271D";
const MUTED = "#6D7B72";
const BORDER = "#E1EBE3";
const LIGHT_GREEN = "#EAF7EE";
const PALE_GREEN = "#F1FAF3";
const LIGHT_GOLD = "#FFF3DB";
const GOLD = "#C98718";
const SOFT_ORANGE = "#FFF0E3";
const ORANGE = "#F57C22";
const SOFT_RED = "#FFF0EE";
const RED = "#C84A3D";

const fallbackMeta = {
  label: "Other",
  icon: "help-circle-outline" as IconName,
  color: MUTED,
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

function getScoreMessage(score: number): string {
  if (score >= 8) {
    return "A thoughtful choice with a lower environmental impact.";
  }

  if (score >= 5) {
    return "A balanced choice with room for a better next step.";
  }

  if (score > 0) {
    return "Every choice counts. Explore the guidance below.";
  }

  return "Use the guidance below to make the best next choice.";
}

function getConfidenceLabel(value: unknown): string {
  const confidence = String(value || "").trim();

  if (!confidence) {
    return "Analysis ready";
  }

  return `${confidence.charAt(0).toUpperCase()}${confidence
    .slice(1)
    .toLowerCase()} confidence`;
}

export default function ResultScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();

  const result = useScanStore((state) => state.result);
  const imageUri = useScanStore((state) => state.imageUri);
  const resetScan = useScanStore((state) => state.resetScan);

  const user = useAuthStore((state) => state.user);

  const [isSaving, setIsSaving] = useState(false);

  if (!result) {
    return (
      <View
        style={[
          styles.emptyScreen,
          {
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        <View style={styles.emptyIcon}>
          <MaterialCommunityIcons
            name="file-question-outline"
            size={42}
            color={FOREST}
          />
        </View>

        <Text style={styles.emptyBrand}>
          SnapSort AI
        </Text>

        <Text style={styles.emptyTitle}>
          No scan result found
        </Text>

        <Text style={styles.emptyText}>
          Capture an item and let SnapSort guide you toward a
          better disposal choice.
        </Text>

        <Pressable
          style={styles.emptyAction}
          onPress={() => navigation.navigate("Camera")}
          accessibilityRole="button"
          accessibilityLabel="Scan an item"
        >
          <View style={styles.emptyActionIcon}>
            <MaterialCommunityIcons
              name="camera-outline"
              size={19}
              color={WHITE}
            />
          </View>

          <Text style={styles.emptyActionText}>
            Scan an item
          </Text>

          <View style={styles.emptyActionArrow}>
            <MaterialCommunityIcons
              name="arrow-right"
              size={17}
              color={FOREST}
            />
          </View>
        </Pressable>
      </View>
    );
  }

  const safeCategory = getSafeCategory(result.category);

  const rawMeta = categoryMeta[safeCategory] as
    | {
        label?: string;
        icon?: string;
        color?: string;
      }
    | undefined;

  const meta = {
    label: rawMeta?.label || fallbackMeta.label,
    icon:
      (rawMeta?.icon as IconName) ||
      fallbackMeta.icon,
    color: rawMeta?.color || fallbackMeta.color,
  };

  const itemName =
    result.itemName?.trim() || "Unknown item";

  const disposalAdvice =
    result.disposalAdvice?.trim() ||
    "Follow your local disposal guidance.";

  const reuseIdea = result.reuseIdea?.trim() || "";

  const warning = result.warning?.trim() || "";

  const ecoScore = Math.max(
    0,
    Math.min(10, Number(result.ecoScore) || 0)
  );

  const scorePercentage = `${ecoScore * 10}%`;

  const scoreMessage = getScoreMessage(ecoScore);

  const confidenceLabel = getConfidenceLabel(
    result.confidence
  );

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    if (!user) {
      Alert.alert(
        "Login required",
        "Please sign in before saving a scan."
      );
      return;
    }

    try {
      setIsSaving(true);

      await saveScan(
        user.uid,
        {
          ...result,
          category: safeCategory,
        },
        imageUri ?? undefined
      );

      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );

      Alert.alert(
        "Saved to history",
        "Your scan result has been added to your personal history.",
        [
          {
            text: "Done",
            onPress: () => {
              resetScan();
              navigation.popToTop();
            },
          },
        ]
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not save this scan.";

      Alert.alert("Save failed", message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleScanAnother = () => {
    if (isSaving) {
      return;
    }

    resetScan();
    navigation.navigate("Camera");
  };

  const handleGoBack = () => {
    if (isSaving) {
      return;
    }

    navigation.goBack();
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: Math.max(insets.top + 8, 20),
            paddingBottom: insets.bottom + 30,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <Pressable
            style={[
              styles.backButton,
              isSaving && styles.disabledButton,
            ]}
            onPress={handleGoBack}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color={WHITE}
            />
          </Pressable>

          <View style={styles.headerTitleArea}>
            <Text style={styles.headerTitle}>
              Scan result
            </Text>

            <Text style={styles.headerSubtitle}>
              ANALYSIS COMPLETE
            </Text>
          </View>

          <View style={styles.headerStatus}>
            <MaterialCommunityIcons
              name="check"
              size={21}
              color={FOREST}
            />
          </View>
        </View>

        <View style={styles.resultHero}>
          <View style={styles.resultHeroTop}>
            <View
              style={[
                styles.categoryIcon,
                {
                  backgroundColor: `${meta.color}20`,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={meta.icon}
                size={28}
                color={meta.color}
              />
            </View>

            <View
              style={[
                styles.categoryPill,
                {
                  backgroundColor: `${meta.color}18`,
                },
              ]}
            >
              <View
                style={[
                  styles.categoryPillDot,
                  {
                    backgroundColor: meta.color,
                  },
                ]}
              />

              <Text
                style={[
                  styles.categoryPillText,
                  {
                    color: meta.color,
                  },
                ]}
              >
                {meta.label}
              </Text>
            </View>
          </View>

          <Text
            style={styles.itemName}
            numberOfLines={2}
          >
            {itemName}
          </Text>

          <View style={styles.confidenceRow}>
            <View
              style={[
                styles.confidenceDot,
                {
                  backgroundColor: meta.color,
                },
              ]}
            />

            <Text style={styles.confidenceText}>
              {confidenceLabel}
            </Text>
          </View>
        </View>

        <View style={styles.scoreCard}>
          <View style={styles.scoreTop}>
            <View style={styles.scoreIcon}>
              <MaterialCommunityIcons
                name="leaf"
                size={23}
                color={FOREST}
              />
            </View>

            <View style={styles.scoreCopy}>
              <Text style={styles.scoreLabel}>
                Eco score
              </Text>

              <Text style={styles.scoreDescription}>
                {scoreMessage}
              </Text>
            </View>

            <View style={styles.scoreNumber}>
              <Text style={styles.scoreValue}>
                {ecoScore.toFixed(1)}
              </Text>

              <Text style={styles.scoreOutOf}>
                /10
              </Text>
            </View>
          </View>

          <View style={styles.scoreTrack}>
            <View
              style={[
                styles.scoreFill,
                {
                  width: scorePercentage,
                },
              ]}
            />
          </View>

          <View style={styles.scoreScale}>
            <Text style={styles.scoreScaleText}>
              Lower impact
            </Text>

            <Text style={styles.scoreScaleText}>
              Better choice
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>
          DISPOSAL GUIDANCE
        </Text>

        <View style={styles.guidanceCard}>
          <View style={styles.guidanceHeader}>
            <View style={styles.guidanceIcon}>
              <MaterialCommunityIcons
                name="map-marker-path"
                size={21}
                color={FOREST}
              />
            </View>

            <View style={styles.guidanceHeaderCopy}>
              <Text style={styles.guidanceTitle}>
                What should you do?
              </Text>

              <Text style={styles.guidanceSubtitle}>
                Recommended next step
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <Text style={styles.guidanceText}>
            {disposalAdvice}
          </Text>
        </View>

        {reuseIdea.length > 0 ? (
          <View style={styles.reuseCard}>
            <View style={styles.reuseHeader}>
              <View style={styles.reuseIcon}>
                <MaterialCommunityIcons
                  name="lightbulb-on-outline"
                  size={21}
                  color={GOLD}
                />
              </View>

              <View style={styles.reuseHeaderCopy}>
                <Text style={styles.reuseLabel}>
                  REUSE POSSIBILITY
                </Text>

                <Text style={styles.reuseTitle}>
                  Give it another purpose
                </Text>
              </View>
            </View>

            <Text style={styles.reuseText}>
              {reuseIdea}
            </Text>
          </View>
        ) : null}

        {warning.length > 0 ? (
          <View style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <View style={styles.warningIcon}>
                <MaterialCommunityIcons
                  name="alert-outline"
                  size={21}
                  color={RED}
                />
              </View>

              <View style={styles.warningHeaderCopy}>
                <Text style={styles.warningLabel}>
                  IMPORTANT
                </Text>

                <Text style={styles.warningTitle}>
                  Handle with care
                </Text>
              </View>
            </View>

            <Text style={styles.warningText}>
              {warning}
            </Text>
          </View>
        ) : null}

        <View style={styles.actionSection}>
          <Text style={styles.actionLabel}>
            SAVE YOUR PROGRESS
          </Text>

          <Pressable
            style={[
              styles.saveAction,
              isSaving && styles.disabledSaveAction,
            ]}
            onPress={handleSave}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel="Save scan to history"
          >
            {isSaving ? (
              <>
                <View style={styles.saveActionIcon}>
                  <ActivityIndicator
                    size="small"
                    color={WHITE}
                  />
                </View>

                <View style={styles.saveActionCopy}>
                  <Text style={styles.saveActionTitle}>
                    Saving your scan
                  </Text>

                  <Text style={styles.saveActionSubtitle}>
                    Adding this result to your history
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.saveActionIcon}>
                  <MaterialCommunityIcons
                    name="content-save-outline"
                    size={20}
                    color={WHITE}
                  />
                </View>

                <View style={styles.saveActionCopy}>
                  <Text style={styles.saveActionTitle}>
                    Save to history
                  </Text>

                  <Text style={styles.saveActionSubtitle}>
                    Keep this result in your journal
                  </Text>
                </View>

                <View style={styles.saveActionArrow}>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={18}
                    color={WHITE}
                  />
                </View>
              </>
            )}
          </Pressable>

          <Pressable
            style={[
              styles.scanAnotherAction,
              isSaving && styles.disabledButton,
            ]}
            onPress={handleScanAnother}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel="Scan another item"
          >
            <View style={styles.scanAnotherIcon}>
              <MaterialCommunityIcons
                name="camera-plus-outline"
                size={20}
                color={FOREST}
              />
            </View>

            <Text style={styles.scanAnotherText}>
              Scan another item
            </Text>

            <View style={styles.scanAnotherArrow}>
              <MaterialCommunityIcons
                name="arrow-right"
                size={17}
                color={FOREST}
              />
            </View>
          </Pressable>
        </View>

        <View style={styles.disclaimerCard}>
          <View style={styles.disclaimerIcon}>
            <MaterialCommunityIcons
              name="information-outline"
              size={17}
              color={MUTED}
            />
          </View>

          <Text style={styles.disclaimer}>
            SnapSort AI provides general guidance only. Local
            disposal rules may vary by area.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    paddingHorizontal: 20,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 19,
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FOREST,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },

  disabledButton: {
    opacity: 0.55,
  },

  headerTitleArea: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 12,
  },

  headerTitle: {
    fontFamily: "Poppins_700Bold",
    color: TEXT,
    fontSize: 19,
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    fontFamily: "Poppins_600SemiBold",
    color: MUTED,
    fontSize: 7,
    letterSpacing: 1.15,
    marginTop: 2,
  },

  headerStatus: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#D3EBD9",
  },

  resultHero: {
    padding: 17,
    borderRadius: 26,
    backgroundColor: PALE_GREEN,
    borderWidth: 1,
    borderColor: "#D6EBDC",
  },

  resultHeroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  categoryIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },

  categoryPillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  categoryPillText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 9,
    marginLeft: 6,
  },

  itemName: {
    fontFamily: "Poppins_700Bold",
    color: TEXT,
    fontSize: 25,
    lineHeight: 31,
    letterSpacing: -0.7,
    marginTop: 15,
  },

  confidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  confidenceDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  confidenceText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    marginLeft: 6,
  },

  scoreCard: {
    padding: 15,
    marginTop: 14,
    borderRadius: 23,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  scoreTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  scoreIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  scoreCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  scoreLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 12,
  },

  scoreDescription: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 8,
    lineHeight: 13,
    marginTop: 2,
  },

  scoreNumber: {
    flexDirection: "row",
    alignItems: "flex-end",
  },

  scoreValue: {
    fontFamily: "Poppins_700Bold",
    color: FOREST,
    fontSize: 26,
    lineHeight: 30,
  },

  scoreOutOf: {
    fontFamily: "Poppins_500Medium",
    color: MUTED,
    fontSize: 10,
    marginLeft: 2,
    marginBottom: 4,
  },

  scoreTrack: {
    height: 8,
    overflow: "hidden",
    borderRadius: 5,
    marginTop: 14,
    backgroundColor: "#DDE9DF",
  },

  scoreFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: FOREST,
  },

  scoreScale: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },

  scoreScaleText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 7,
  },

  sectionLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 8,
    letterSpacing: 1.15,
    marginTop: 27,
    marginLeft: 2,
    marginBottom: 9,
  },

  guidanceCard: {
    padding: 15,
    borderRadius: 23,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },

  guidanceHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  guidanceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  guidanceHeaderCopy: {
    flex: 1,
    marginLeft: 10,
  },

  guidanceTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 12,
  },

  guidanceSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 8,
    marginTop: 2,
  },

  cardDivider: {
    height: 1,
    marginVertical: 13,
    backgroundColor: "#E7EEE8",
  },

  guidanceText: {
    fontFamily: "Poppins_400Regular",
    color: TEXT,
    fontSize: 11,
    lineHeight: 18,
  },

  reuseCard: {
    padding: 15,
    marginTop: 13,
    borderRadius: 23,
    backgroundColor: LIGHT_GOLD,
    borderWidth: 1,
    borderColor: "#F0DFB7",
  },

  reuseHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  reuseIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },

  reuseHeaderCopy: {
    flex: 1,
    marginLeft: 10,
  },

  reuseLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: GOLD,
    fontSize: 8,
    letterSpacing: 1,
  },

  reuseTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#453619",
    fontSize: 12,
    marginTop: 2,
  },

  reuseText: {
    fontFamily: "Poppins_400Regular",
    color: "#786441",
    fontSize: 10,
    lineHeight: 17,
    marginTop: 11,
  },

  warningCard: {
    padding: 15,
    marginTop: 13,
    borderRadius: 23,
    backgroundColor: SOFT_RED,
    borderWidth: 1,
    borderColor: "#F0CBC6",
  },

  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  warningIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },

  warningHeaderCopy: {
    flex: 1,
    marginLeft: 10,
  },

  warningLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: RED,
    fontSize: 8,
    letterSpacing: 1,
  },

  warningTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#5C2C26",
    fontSize: 12,
    marginTop: 2,
  },

  warningText: {
    fontFamily: "Poppins_400Regular",
    color: "#784A43",
    fontSize: 10,
    lineHeight: 17,
    marginTop: 11,
  },

  actionSection: {
    marginTop: 27,
  },

  actionLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 8,
    letterSpacing: 1.25,
    marginBottom: 10,
    marginLeft: 2,
  },

  saveAction: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    borderRadius: 38,
    backgroundColor: FOREST,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
  },

  disabledSaveAction: {
    opacity: 0.72,
  },

  saveActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  saveActionCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  saveActionTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: WHITE,
    fontSize: 12,
  },

  saveActionSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.78)",
    fontSize: 8,
    marginTop: 2,
  },

  saveActionArrow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  scanAnotherAction: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: 11,
    borderRadius: 33,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#CBE8D3",
  },

  scanAnotherIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },

  scanAnotherText: {
    flex: 1,
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 11,
    marginLeft: 10,
  },

  scanAnotherArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },

  disclaimerCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 4,
    marginTop: 18,
  },

  disclaimerIcon: {
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2EE",
  },

  disclaimer: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    lineHeight: 15,
    marginTop: 3,
    marginLeft: 7,
  },

  emptyScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },

  emptyIcon: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  emptyBrand: {
    fontFamily: "Poppins_700Bold",
    color: FOREST,
    fontSize: 15,
    marginTop: 15,
  },

  emptyTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 19,
    textAlign: "center",
    marginTop: 8,
  },

  emptyText: {
    maxWidth: 280,
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 5,
  },

  emptyAction: {
    minWidth: 195,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    marginTop: 20,
    borderRadius: 30,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#CBE8D3",
  },

  emptyActionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FOREST,
  },

  emptyActionText: {
    flex: 1,
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 11,
    marginLeft: 9,
  },

  emptyActionArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },
});