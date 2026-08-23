import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Button, Text } from "react-native-paper";

import { colors } from "../../constants/theme";
import { RootStackParamList } from "../../navigation/types";
import { useScanStore } from "../../stores/scan.store";

type Props = NativeStackScreenProps<RootStackParamList, "Camera">;

export default function CameraScreen({ navigation }: Props) {
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const setImage = useScanStore((state) => state.setImage);

  const openPreview = (
    uri: string,
    base64: string,
    mimeType = "image/jpeg"
  ) => {
    if (!base64) {
      Alert.alert(
        "Image error",
        "Image data was not available. Please choose another image."
      );
      return;
    }

    setImage(uri, base64, mimeType);
    navigation.navigate("Preview");
  };

  const takePhoto = async () => {
    if (!cameraRef.current || !isCameraReady || isTakingPhoto) {
      return;
    }

    try {
      setIsTakingPhoto(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.65,
        base64: true,
        skipProcessing: false,
      });

      if (!photo?.uri || !photo?.base64) {
        throw new Error(
          "The camera did not return Base64 image data."
        );
      }

      openPreview(photo.uri, photo.base64, "image/jpeg");
    } catch (error: any) {
      Alert.alert(
        "Camera error",
        error?.message ??
          "We could not take this photo. Please try again."
      );
    } finally {
      setIsTakingPhoto(false);
    }
  };

  const chooseFromGallery = async () => {
    try {
      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.65,
          base64: true,
        });

      if (result.canceled) return;

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
        asset.mimeType ?? "image/jpeg"
      );
    } catch (error: any) {
      Alert.alert(
        "Gallery error",
        error?.message ??
          "We could not select this image. Please try again."
      );
    }
  };

  const switchCamera = () => {
    setFacing((current) =>
      current === "back" ? "front" : "back"
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
        onCameraReady={() => setIsCameraReady(true)}
      />

      <View style={styles.overlay}>
        <View style={styles.topOverlay}>
          <View style={styles.tipPill}>
            <MaterialCommunityIcons
              name="lightbulb-outline"
              size={17}
              color="#FFFFFF"
            />

            <Text style={styles.tipText}>
              Keep one item clearly visible
            </Text>
          </View>

          <TouchableOpacity
            style={styles.flipButton}
            activeOpacity={0.8}
            onPress={switchCamera}
          >
            <MaterialCommunityIcons
              name="camera-flip-outline"
              size={25}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>

        <View style={styles.bottomOverlay}>
          <TouchableOpacity
            style={styles.galleryButton}
            activeOpacity={0.8}
            disabled={isTakingPhoto}
            onPress={chooseFromGallery}
          >
            <MaterialCommunityIcons
              name="image-outline"
              size={28}
              color="#FFFFFF"
            />

            <Text style={styles.galleryText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.captureOuter,
              (!isCameraReady || isTakingPhoto) &&
                styles.captureDisabled,
            ]}
            activeOpacity={0.85}
            disabled={!isCameraReady || isTakingPhoto}
            onPress={takePhoto}
          >
            <View style={styles.captureInner}>
              <MaterialCommunityIcons
                name={isTakingPhoto ? "loading" : "camera"}
                size={31}
                color={colors.primary}
              />
            </View>
          </TouchableOpacity>

          <View style={styles.rightSpacer} />
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
    paddingTop: 20,
    paddingBottom: 34,
    paddingHorizontal: 24,
  },
  topOverlay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tipPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(0,0,0,0.48)",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 22,
  },
  tipText: {
    fontFamily: "Poppins_400Regular",
    color: "#FFFFFF",
    fontSize: 12,
  },
  flipButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.48)",
  },
  scanFrame: {
    width: "88%",
    aspectRatio: 1,
    alignSelf: "center",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 42,
    height: 42,
    borderColor: "#FFFFFF",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
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
  galleryText: {
    fontFamily: "Poppins_400Regular",
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 4,
  },
  captureOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureDisabled: {
    opacity: 0.45,
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  rightSpacer: {
    width: 70,
  },
  permissionContainer: {
    flex: 1,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 24,
    color: colors.text,
    textAlign: "center",
  },
  permissionText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 24,
  },
  permissionButton: {
    height: 52,
    paddingHorizontal: 14,
  },
});