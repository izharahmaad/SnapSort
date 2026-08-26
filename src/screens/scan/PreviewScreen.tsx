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
import { Button, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../constants/theme";
import { RootStackParamList } from "../../navigation/types";
import { useScanStore } from "../../stores/scan.store";
import { analyzeScanImage } from "../../services/api/scan-api.service";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Preview"
>;

type IconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

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
            size={45}
            color={colors.primary}
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

        <Button
          mode="contained"
          icon="camera-outline"
          onPress={() => navigation.navigate("Camera")}
          contentStyle={styles.emptyButton}
        >
          Open camera
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: Math.max(insets.top, 12),
            paddingBottom: insets.bottom + 28,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable
            style={styles.backButton}
            onPress={retakePhoto}
            disabled={isAnalyzing}
            accessibilityRole="button"
            accessibilityLabel="Go back and retake photo"
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={21}
              color="#FFFFFF"
            />
          </Pressable>

          <View style={styles.headerTitleArea}>
            <Text style={styles.headerTitle}>
              Review item
            </Text>

            <Text style={styles.headerSubtitle}>
              SnapSort AI scanner
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <MaterialCommunityIcons
              name="image-check-outline"
              size={21}
              color={colors.primary}
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

          <View style={styles.previewBadge}>
            <MaterialCommunityIcons
              name="check"
              size={13}
              color="#FFFFFF"
            />

            <Text style={styles.previewBadgeText}>
              READY TO ANALYZE
            </Text>
          </View>

          <View style={styles.previewCornerTop}>
            <MaterialCommunityIcons
              name="camera-outline"
              size={22}
              color="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.photoMeta}>
          <View style={styles.photoMetaIcon}>
            <MaterialCommunityIcons
              name="image-outline"
              size={18}
              color={colors.primary}
            />
          </View>

          <View style={styles.photoMetaCopy}>
            <Text style={styles.photoMetaTitle}>
              One item per scan
            </Text>

            <Text style={styles.photoMetaText}>
              A clear, well-lit image helps SnapSort AI provide
              better guidance.
            </Text>
          </View>
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <MaterialCommunityIcons
              name="lightbulb-on-outline"
              size={21}
              color="#B5650B"
            />
          </View>

          <View style={styles.tipCopy}>
            <Text style={styles.tipTitle}>
              Clear photo = better result
            </Text>

            <Text style={styles.tipText}>
              Keep one main item visible and make sure important
              details are not covered.
            </Text>
          </View>
        </View>

        <View style={styles.actionSection}>
          <Text style={styles.actionLabel}>
            READY WHEN YOU ARE
          </Text>

          <View style={styles.actions}>
            <Button
              mode="outlined"
              icon="camera-retake-outline"
              textColor={colors.primary}
              style={styles.retakeButton}
              contentStyle={styles.actionButton}
              disabled={isAnalyzing}
              onPress={retakePhoto}
            >
              Retake
            </Button>

            <View style={styles.analyzeArea}>
              {isAnalyzing ? (
                <View style={styles.analyzingContainer}>
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />

                  <Text style={styles.analyzingText}>
                    Understanding...
                  </Text>
                </View>
              ) : (
                <Button
                  mode="contained"
                  icon="star-four-points-outline"
                  buttonColor={colors.primary}
                  textColor="#FFFFFF"
                  style={styles.analyzeButton}
                  contentStyle={styles.actionButton}
                  onPress={analyzeItem}
                  disabled={!imageReady}
                >
                  Analyze item
                </Button>
              )}
            </View>
          </View>
        </View>

        <View style={styles.disclaimerCard}>
          <MaterialCommunityIcons
            name="information-outline"
            size={17}
            color={colors.muted}
          />

          <Text style={styles.disclaimer}>
            SnapSort AI provides general guidance only. Local
            disposal rules may vary.
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
  headerTitle: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 22,
  },
  headerSubtitle: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 9,
    marginTop: 2,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  previewCard: {
    position: "relative",
    width: "100%",
    height: 390,
    overflow: "hidden",
    borderRadius: 25,
    backgroundColor: "#DCE8DF",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(3,35,25,0.10)",
  },
  previewBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: "rgba(11,78,62,0.9)",
  },
  previewBadgeText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 8,
    letterSpacing: 0.8,
  },
  previewCornerTop: {
    position: "absolute",
    right: 14,
    top: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(11,78,62,0.86)",
  },
  photoMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 13,
    marginTop: 14,
    borderRadius: 17,
    backgroundColor: "#EAF6EE",
    borderWidth: 1,
    borderColor: "#D6EBDC",
  },
  photoMetaIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  photoMetaCopy: {
    flex: 1,
  },
  photoMetaTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 13,
  },
  photoMetaText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 13,
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: "#FFF1D5",
    borderWidth: 1,
    borderColor: "#F1D6A0",
  },
  tipIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE2AE",
  },
  tipCopy: {
    flex: 1,
  },
  tipTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: "#523915",
    fontSize: 13,
  },
  tipText: {
    fontFamily: "Poppins_400Regular",
    color: "#765D2C",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 3,
  },
  actionSection: {
    marginTop: 25,
  },
  actionLabel: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.muted,
    fontSize: 9,
    letterSpacing: 1.4,
    marginLeft: 3,
    marginBottom: 9,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  retakeButton: {
    flex: 0.85,
    borderColor: colors.primary,
    borderRadius: 13,
  },
  analyzeArea: {
    flex: 1.35,
  },
  analyzeButton: {
    borderRadius: 13,
  },
  actionButton: {
    height: 52,
  },
  analyzingContainer: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 13,
    backgroundColor: colors.primary,
  },
  analyzingText: {
    fontFamily: "Poppins_600SemiBold",
    color: "#FFFFFF",
    fontSize: 11,
  },
  disclaimerCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    paddingHorizontal: 9,
    marginTop: 15,
  },
  disclaimer: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 9,
    lineHeight: 15,
  },
  emptyScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: colors.background,
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
  emptyBrand: {
    fontFamily: "Poppins_700Bold",
    color: colors.primary,
    fontSize: 16,
  },
  emptyTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 19,
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
  emptyButton: {
    height: 50,
  },
});