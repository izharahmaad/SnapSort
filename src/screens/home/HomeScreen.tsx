import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

import { colors } from "../../constants/theme";
import { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>SnapSort</Text>
        <Text style={styles.tagline}>Scan. Sort. Reuse smarter.</Text>
      </View>

      <LinearGradient
        colors={[colors.primary, "#4AA66D"]}
        style={styles.heroCard}
      >
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroTitle}>What are you holding? 🌿</Text>

          <Text style={styles.heroDescription}>
            Take a photo of an everyday item and discover whether you can
            recycle, reuse, donate, sell, or safely dispose of it.
          </Text>
        </View>

        <Button
          mode="contained"
          icon="camera-outline"
          buttonColor="#FFFFFF"
          textColor={colors.primary}
          contentStyle={styles.scanButton}
          labelStyle={styles.scanButtonLabel}
          onPress={() => navigation.navigate("Camera")}
        >
          Scan an item
        </Button>
      </LinearGradient>

      <Card style={styles.challengeCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>Today&apos;s mini challenge</Text>

          <Text style={styles.cardText}>
            Find one item you can reuse before throwing it away.
          </Text>

          <View style={styles.progressTrack}>
            <View style={styles.progressValue} />
          </View>

          <Text style={styles.progressText}>0 of 1 completed</Text>
        </Card.Content>
      </Card>

      <Card style={styles.tipCard}>
        <Card.Content>
          <View style={styles.tipHeader}>
            <Text style={styles.tipEmoji}>💡</Text>
            <Text style={styles.tipTitle}>Quick tip</Text>
          </View>

          <Text style={styles.tipText}>
            Keep batteries, medicines, chemicals, and electronics out of
            regular household trash.
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  header: {
    marginBottom: 26,
  },
  logo: {
    fontFamily: "Poppins_700Bold",
    fontSize: 30,
    color: colors.text,
  },
  tagline: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: colors.muted,
    marginTop: 2,
  },
  heroCard: {
    minHeight: 260,
    borderRadius: 24,
    padding: 22,
    justifyContent: "space-between",
    elevation: 5,
    shadowColor: "#155C34",
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 7,
    },
  },
  heroTextContainer: {
    gap: 14,
  },
  heroTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
    color: "#FFFFFF",
  },
  heroDescription: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    lineHeight: 22,
    color: "#ECFFF1",
  },
  scanButton: {
    height: 52,
  },
  scanButtonLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
  },
  challengeCard: {
    backgroundColor: colors.surface,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 16,
  },
  cardText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    marginTop: 5,
    lineHeight: 20,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    marginTop: 16,
  },
  progressValue: {
    width: "5%",
    height: "100%",
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  progressText: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    fontSize: 11,
    marginTop: 7,
  },
  tipCard: {
    backgroundColor: colors.warningBackground,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.warningBorder,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tipEmoji: {
    fontSize: 20,
  },
  tipTitle: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.warningText,
    fontSize: 16,
  },
  tipText: {
    fontFamily: "Poppins_400Regular",
    color: colors.warningText,
    marginTop: 7,
    lineHeight: 20,
  },
});