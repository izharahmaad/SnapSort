import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  View,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Button, Card, Text } from "react-native-paper";

import { colors } from "../../constants/theme";
import { RootStackParamList } from "../../navigation/types";
import { useScanStore } from "../../stores/scan.store";
import { analyzeScanImage } from "../../services/api/scan-api.service";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Preview"
>;

export default function PreviewScreen({ navigation }: Props) {
  const imageUri = useScanStore((state) => state.imageUri);
  const imageBase64 = useScanStore((state) => state.imageBase64);
  const setResult = useScanStore((state) => state.setResult);
  const isAnalyzing = useScanStore(
    (state) => state.isAnalyzing
  );
  const setIsAnalyzing = useScanStore(
    (state) => state.setIsAnalyzing
  );

  const retakePhoto = () => {
    if (isAnalyzing) return;

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
        "The photo does not contain image data. Please retake the photo."
      );
      return;
    }

    try {
      setIsAnalyzing(true);

      // The API service reads imageBase64 from the Zustand store.
      const result = await analyzeScanImage();

      setResult(result);
      navigation.navigate("Result");
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
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="image-off-outline"
          size={56}
          color={colors.muted}
        />

        <Text style={styles.emptyTitle}>
          No image selected
        </Text>

        <Button
          mode="contained"
          icon="camera-outline"
          onPress={() => navigation.navigate("Camera")}
        >
          Open camera
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="cover"
      />

      <Card style={styles.tipCard}>
        <Card.Content style={styles.tipContent}>
          <View style={styles.tipIcon}>
            <MaterialCommunityIcons
              name="lightbulb-on-outline"
              size={25}
              color={colors.primary}
            />
          </View>

          <View style={styles.tipCopy}>
            <Text style={styles.tipTitle}>
              Clear photo = better result
            </Text>

            <Text style={styles.tipText}>
              Make sure one main item is visible and well lit.
            </Text>
          </View>
        </Card.Content>
      </Card>

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

        {isAnalyzing ? (
          <View style={styles.analyzingContainer}>
            <ActivityIndicator
              size="small"
              color={colors.primary}
            />

            <Text style={styles.analyzingText}>
              Understanding item...
            </Text>
          </View>
        ) : (
          <Button
            mode="contained"
            icon="sparkles"
            style={styles.analyzeButtonWrapper}
            contentStyle={styles.actionButton}
            onPress={analyzeItem}
          >
            Analyze item
          </Button>
        )}
      </View>

      <Text style={styles.disclaimer}>
        SnapSort uses AI for general guidance. Local disposal
        rules may vary.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  image: {
    width: "100%",
    height: 400,
    borderRadius: 24,
    backgroundColor: "#DCE8DF",
  },
  tipCard: {
    backgroundColor: colors.surface,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tipIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  tipCopy: {
    flex: 1,
  },
  tipTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 14,
  },
  tipText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: "auto",
    paddingTop: 20,
  },
  retakeButton: {
    flex: 1,
    borderColor: colors.primary,
  },
  analyzeButtonWrapper: {
    flex: 1.35,
  },
  actionButton: {
    height: 52,
  },
  analyzingContainer: {
    flex: 1.35,
    minHeight: 52,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
    backgroundColor: colors.primaryLight,
  },
  analyzingText: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.primary,
    fontSize: 12,
  },
  disclaimer: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
    marginTop: 16,
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