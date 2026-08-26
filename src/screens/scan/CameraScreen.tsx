import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useRef, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import {
  CameraType,
  CameraView,
  FlashMode,
  useCameraPermissions,
} from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Button, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../constants/theme";
import { RootStackParamList } from "../../navigation/types";
import { useScanStore } from "../../stores/scan.store";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Camera"
>;

type IconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

export default function CameraScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] =
    useCameraPermissions();

  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [isTakingPhoto, setIsTakingPhoto] =
    useState(false);
  const [isCameraReady, setIsCameraReady] =
    useState(false);

  const setImage = useScanStore((state) => state.setImage);

  const openPreview = (
    uri: string,
    base64: string,
    mimeType = "image/jpeg"
  ) => {
    if (!uri || !base64) {
      Alert.alert(
        "Image error",
        "Image data was not available. Please try again."
      );
      return;
    }

    setImage(uri, base64, mimeType);
    navigation.navigate("Preview");
  };

  const takePhoto = async () => {
    if (
      !cameraRef.current ||
      !isCameraReady ||
      isTakingPhoto
    ) {
      return;
    }

    try {
      setIsTakingPhoto(true);

      const photo =
        await cameraRef.current.takePictureAsync({
          quality: 0.75,
          base64: true,
          skipProcessing: false,
        });

      if (!photo?.uri || !photo.base64) {
        throw new Error(
          "The camera did not return image data."
        );
      }

      openPreview(
        photo.uri,
        photo.base64,
        "image/jpeg"
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "We could not take this photo.";

      Alert.alert("Camera error", message);
    } finally {
      setIsTakingPhoto(false);
    }
  };

  const chooseFromGallery = async () => {
    if (isTakingPhoto) {
      return;
    }

    try {
      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.75,
          base64: true,
        });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      if (!asset?.uri || !asset.base64) {
        Alert.alert(
          "Image error",
          "The selected image did not include image data."
        );
        return;
      }

      openPreview(
        asset.uri,
        asset.base64,
        asset.mimeType || "image/jpeg"
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "We could not select this image.";

      Alert.alert("Gallery error", message);
    }
  };

  const switchCamera = () => {
    setFacing((current) =>
      current === "back" ? "front" : "back"
    );
  };

  const toggleFlash = () => {
    setFlash((current) =>
      current === "off" ? "on" : "off"
    );
  };

  if (!permission) {
    return <View style={styles.blackScreen} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionIcon}>
          <MaterialCommunityIcons
            name="camera-outline"
            size={54}
            color={colors.primary}
          />
        </View>

        <Text style={styles.permissionTitle}>
          Camera access needed
        </Text>

        <Text style={styles.permissionText}>
          SnapSort needs camera access so you can photograph an
          item and get sorting guidance.
        </Text>

        <Button
          mode="contained"
          icon="camera"
          contentStyle={styles.permissionButton}
          onPress={requestPermission}
        >
          Allow camera
        </Button>

        <Button
          mode="text"
          textColor={colors.muted}
          onPress={chooseFromGallery}
        >
          Choose from gallery instead
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
        onCameraReady={() => setIsCameraReady(true)}
      />

      <View
        style={[
          styles.overlay,
          {
            paddingTop: Math.max(insets.top + 8, 22),
            paddingBottom: Math.max(insets.bottom + 18, 32),
          },
        ]}
      >
        <View style={styles.topOverlay}>
          <View style={styles.tipPill}>
            <View style={styles.tipIcon}>
              <MaterialCommunityIcons
                name="lightbulb-outline"
                size={16}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.tipText}>
              Keep one item clearly visible
            </Text>
          </View>

          <View style={styles.topControls}>
            <Pressable
              style={styles.roundControl}
              onPress={toggleFlash}
              accessibilityRole="button"
              accessibilityLabel="Toggle flash"
            >
              <MaterialCommunityIcons
                name={
                  flash === "on"
                    ? "flash"
                    : "flash-off"
                }
                size={20}
                color="#FFFFFF"
              />
            </Pressable>

            <Pressable
              style={styles.roundControl}
              onPress={switchCamera}
              accessibilityRole="button"
              accessibilityLabel="Switch camera"
            >
              <MaterialCommunityIcons
                name="camera-flip-outline"
                size={21}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.scanArea}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            <View style={styles.frameCenter}>
              <MaterialCommunityIcons
                name="scan-helper"
                size={32}
                color="rgba(255,255,255,0.82)"
              />
            </View>
          </View>

          <Text style={styles.frameHint}>
            Center the item inside the frame
          </Text>
        </View>

        <View style={styles.bottomOverlay}>
          <Pressable
            style={styles.galleryButton}
            disabled={isTakingPhoto}
            onPress={chooseFromGallery}
            accessibilityRole="button"
            accessibilityLabel="Choose image from gallery"
          >
            <View style={styles.galleryIcon}>
              <MaterialCommunityIcons
                name="image-outline"
                size={22}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.galleryText}>
              Gallery
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.captureOuter,
              (!isCameraReady || isTakingPhoto) &&
                styles.captureDisabled,
            ]}
            disabled={!isCameraReady || isTakingPhoto}
            onPress={takePhoto}
            accessibilityRole="button"
            accessibilityLabel="Take photo"
          >
            <View style={styles.captureInner}>
              <MaterialCommunityIcons
                name={
                  isTakingPhoto
                    ? "loading"
                    : "camera"
                }
                size={31}
                color={colors.primary}
              />
            </View>
          </Pressable>

          <View style={styles.bottomSpacer} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  blackScreen: {
    flex: 1,
    backgroundColor: "#000000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  topOverlay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tipPill: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 225,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.48)",
  },
  tipIcon: {
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(11,78,62,0.9)",
  },
  tipText: {
    flexShrink: 1,
    fontFamily: "Poppins_400Regular",
    color: "#FFFFFF",
    fontSize: 10,
    marginLeft: 7,
  },
  topControls: {
    flexDirection: "row",
    gap: 8,
  },
  roundControl: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.48)",
  },
  scanArea: {
    alignItems: "center",
    justifyContent: "center",
  },
  scanFrame: {
    position: "relative",
    width: "86%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  frameCenter: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(11,78,62,0.2)",
  },
  frameHint: {
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.84)",
    fontSize: 11,
    marginTop: 18,
  },
  corner: {
    position: "absolute",
    width: 43,
    height: 43,
    borderColor: "#FFFFFF",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 17,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 17,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 17,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 17,
  },
  bottomOverlay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  galleryButton: {
    alignItems: "center",
    width: 70,
  },
  galleryIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.48)",
  },
  galleryText: {
    fontFamily: "Poppins_400Regular",
    color: "#FFFFFF",
    fontSize: 10,
    marginTop: 5,
  },
  captureOuter: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.52)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.85)",
  },
  captureDisabled: {
    opacity: 0.45,
  },
  captureInner: {
    width: 67,
    height: 67,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  bottomSpacer: {
    width: 70,
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    backgroundColor: colors.background,
  },
  permissionIcon: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
    marginBottom: 24,
  },
  permissionTitle: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 24,
    textAlign: "center",
  },
  permissionText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 13,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 24,
  },
  permissionButton: {
    height: 52,
    paddingHorizontal: 14,
  },
});