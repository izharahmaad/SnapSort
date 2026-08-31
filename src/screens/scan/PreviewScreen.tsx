import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../constants/theme";
import type { RootStackParamList } from "../../navigation/types";
import { analyzeScanImage } from "../../services/api/scan-api.service";
import { useScanStore } from "../../stores/scan.store";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Preview"
>;

const WHITE = "#FFFFFF";
const FOREST = "#075C34";
const TEXT = "#17271D";
const MUTED = "#6D7B72";
const BORDER = "#E1EBE3";
const LIGHT_GREEN = "#EAF7EE";
const PALE_GREEN = "#F1FAF3";
const GOLD = "#C98718";
const LIGHT_GOLD = "#FFF3DB";

export default function PreviewScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();

  const imageUri = useScanStore(
    (state) => state.imageUri
  );

  const imageBase64 = useScanStore(
    (state) => state.imageBase64
  );

  const setResult = useScanStore(
    (state) => state.setResult
  );

  const isAnalyzing = useScanStore(
    (state) => state.isAnalyzing
  );

  const setIsAnalyzing = useScanStore(
    (state) => state.setIsAnalyzing
  );

  const imageReady = useMemo(() => {
    return Boolean(imageUri && imageBase64);
  }, [imageUri, imageBase64]);

  const retakePhoto = () => {
    if (isAnalyzing) {
      return;
    }

    navigation.goBack();
  };

  const analyzeItem = async () => {
    if (!imageUri) {
      Alert.alert(
        "No image selected",
        "Please capture or choose an image first."
      );
      return;
    }

    if (!imageBase64) {
      Alert.alert(
        "Image data missing",
        "This photo does not contain image data. Please retake it."
      );
      return;
    }

    try {
      setIsAnalyzing(true);

      const result = await analyzeScanImage();

      setResult(result);
      navigation.replace("Result");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "We could not analyze this item. Please try again.";

      Alert.alert("Analysis failed", message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!imageUri) {
    return (
      <View style={styles.emptyScreen}>
        <View style={styles.emptyIcon}>
          <MaterialCommunityIcons
            name="image-off-outline"
            size={42}
            color={FOREST}
          />
        </View>

        <Text style={styles.emptyBrand}>
          SnapSort AI
        </Text>

        <Text style={styles.emptyTitle}>
          No image selected
        </Text>

        <Text style={styles.emptyText}>
          Capture or choose an image before continuing.
        </Text>

        <Pressable
          style={styles.emptyAction}
          onPress={() => navigation.navigate("Camera")}
          accessibilityRole="button"
          accessibilityLabel="Open camera"
        >
          <View style={styles.emptyActionIcon}>
            <MaterialCommunityIcons
              name="camera-outline"
              size={19}
              color={WHITE}
            />
          </View>

          <Text style={styles.emptyActionText}>
            Open camera
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
              styles.circleButton,
              isAnalyzing && styles.disabledButton,
            ]}
            onPress={retakePhoto}
            disabled={isAnalyzing}
            accessibilityRole="button"
            accessibilityLabel="Go back and retake photo"
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color={WHITE}
            />
          </Pressable>

          <View style={styles.headerTitleArea}>
            <Text style={styles.headerTitle}>
              Review item
            </Text>

            <Text style={styles.headerSubtitle}>
              CHECK YOUR PHOTO
            </Text>
          </View>

          <View style={styles.headerStatus}>
            <MaterialCommunityIcons
              name="image-check-outline"
              size={20}
              color={FOREST}
            />
          </View>
        </View>

        <View style={styles.previewCard}>
          <Image
            source={{ uri: imageUri }}
            style={styles.previewImage}
            resizeMode="cover"
          />

          <View style={styles.previewOverlay} />

          <View style={styles.previewTopRow}>
            <View style={styles.readyBadge}>
              <View style={styles.readyDot}>
                <MaterialCommunityIcons
                  name="check"
                  size={10}
                  color={WHITE}
                />
              </View>

              <Text style={styles.readyBadgeText}>
                READY TO ANALYZE
              </Text>
            </View>

            <View style={styles.cameraBadge}>
              <MaterialCommunityIcons
                name="camera-outline"
                size={19}
                color={WHITE}
              />
            </View>
          </View>

          <View style={styles.previewBottom}>
            <View style={styles.previewBottomIcon}>
              <MaterialCommunityIcons
                name="image-outline"
                size={18}
                color={WHITE}
              />
            </View>

            <View style={styles.previewBottomCopy}>
              <Text style={styles.previewBottomTitle}>
                Photo captured
              </Text>

              <Text style={styles.previewBottomText}>
                Ready for AI analysis
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.instructionCard}>
          <View style={styles.instructionIcon}>
            <MaterialCommunityIcons
              name="image-search-outline"
              size={20}
              color={FOREST}
            />
          </View>

          <View style={styles.instructionCopy}>
            <Text style={styles.instructionTitle}>
              One item works best
            </Text>

            <Text style={styles.instructionText}>
              A clear image with one main item helps SnapSort
              identify the material and provide better guidance.
            </Text>
          </View>
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <MaterialCommunityIcons
              name="lightbulb-on-outline"
              size={20}
              color={GOLD}
            />
          </View>

          <View style={styles.tipCopy}>
            <Text style={styles.tipLabel}>
              PHOTO TIP
            </Text>

            <Text style={styles.tipTitle}>
              Better photo, clearer result
            </Text>

            <Text style={styles.tipText}>
              Keep labels and important details visible. Avoid
              shadows, blur, or covering the item.
            </Text>
          </View>
        </View>

        <View style={styles.actionSection}>
          <Text style={styles.actionLabel}>
            READY WHEN YOU ARE
          </Text>

          <View style={styles.actionRow}>
            <Pressable
              style={[
                styles.retakeAction,
                isAnalyzing && styles.disabledButton,
              ]}
              onPress={retakePhoto}
              disabled={isAnalyzing}
              accessibilityRole="button"
              accessibilityLabel="Retake photo"
            >
              <View style={styles.retakeActionIcon}>
                <MaterialCommunityIcons
                  name="camera-retake-outline"
                  size={20}
                  color={FOREST}
                />
              </View>

              <Text style={styles.retakeActionText}>
                Retake
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.analyzeAction,
                (!imageReady || isAnalyzing) &&
                  styles.disabledAnalyzeAction,
              ]}
              onPress={analyzeItem}
              disabled={!imageReady || isAnalyzing}
              accessibilityRole="button"
              accessibilityLabel="Analyze item"
            >
              {isAnalyzing ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color={WHITE}
                  />

                  <Text style={styles.analyzeActionText}>
                    Analyzing...
                  </Text>
                </>
              ) : (
                <>
                  <View style={styles.analyzeActionIcon}>
                    <MaterialCommunityIcons
                      name="star-four-points-outline"
                      size={19}
                      color={WHITE}
                    />
                  </View>

                  <Text style={styles.analyzeActionText}>
                    Analyze item
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

        {isAnalyzing ? (
          <View style={styles.analyzingInfo}>
            <View style={styles.analyzingInfoIcon}>
              <ActivityIndicator
                size="small"
                color={FOREST}
              />
            </View>

            <Text style={styles.analyzingInfoText}>
              SnapSort AI is checking material, disposal guidance,
              and reuse possibilities.
            </Text>
          </View>
        ) : null}

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
    marginBottom: 18,
  },

  circleButton: {
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

  previewCard: {
    position: "relative",
    width: "100%",
    height: 390,
    overflow: "hidden",
    borderRadius: 28,
    backgroundColor: "#DCE8DF",
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },

  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(3,35,25,0.14)",
  },

  previewTopRow: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  readyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 7,
    paddingRight: 12,
    paddingVertical: 7,
    borderRadius: 100,
    backgroundColor: "rgba(5,61,35,0.92)",
  },

  readyDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22965A",
  },

  readyBadgeText: {
    fontFamily: "Poppins_600SemiBold",
    color: WHITE,
    fontSize: 8,
    letterSpacing: 0.8,
    marginLeft: 6,
  },

  cameraBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5,61,35,0.90)",
  },

  previewBottom: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    flexDirection: "row",
    alignItems: "center",
    padding: 11,
    borderRadius: 22,
    backgroundColor: "rgba(3,37,23,0.76)",
  },

  previewBottomIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.19)",
  },

  previewBottomCopy: {
    marginLeft: 9,
  },

  previewBottomTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: WHITE,
    fontSize: 10,
  },

  previewBottomText: {
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.82)",
    fontSize: 8,
    marginTop: 1,
  },

  instructionCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    marginTop: 14,
    borderRadius: 22,
    backgroundColor: PALE_GREEN,
    borderWidth: 1,
    borderColor: "#D6EBDC",
  },

  instructionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },

  instructionCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  instructionTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: TEXT,
    fontSize: 11,
  },

  instructionText: {
    fontFamily: "Poppins_400Regular",
    color: MUTED,
    fontSize: 9,
    lineHeight: 15,
    marginTop: 3,
  },

  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    marginTop: 12,
    borderRadius: 22,
    backgroundColor: LIGHT_GOLD,
    borderWidth: 1,
    borderColor: "#F0DFB7",
  },

  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },

  tipCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  tipLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: GOLD,
    fontSize: 8,
    letterSpacing: 1,
  },

  tipTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#453619",
    fontSize: 11,
    marginTop: 2,
  },

  tipText: {
    fontFamily: "Poppins_400Regular",
    color: "#786441",
    fontSize: 9,
    lineHeight: 15,
    marginTop: 3,
  },

  actionSection: {
    marginTop: 25,
  },

  actionLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 8,
    letterSpacing: 1.25,
    marginBottom: 10,
    marginLeft: 2,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  retakeAction: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 29,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: "#CBE8D3",
  },

  retakeActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LIGHT_GREEN,
  },

  retakeActionText: {
    fontFamily: "Poppins_600SemiBold",
    color: FOREST,
    fontSize: 10,
    marginLeft: 7,
  },

  analyzeAction: {
    flex: 1,
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    marginLeft: 10,
    borderRadius: 29,
    backgroundColor: FOREST,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
  },

  disabledAnalyzeAction: {
    opacity: 0.55,
  },

  analyzeActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  analyzeActionText: {
    fontFamily: "Poppins_600SemiBold",
    color: WHITE,
    fontSize: 10,
    marginLeft: 7,
  },

  analyzingInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 11,
    marginTop: 11,
    borderRadius: 22,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: "#D4EAD9",
  },

  analyzingInfoIcon: {
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },

  analyzingInfoText: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    color: FOREST,
    fontSize: 9,
    lineHeight: 14,
    marginLeft: 8,
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
    marginLeft: 7,
    marginTop: 3,
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