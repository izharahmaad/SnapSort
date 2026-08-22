import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { signOut } from "firebase/auth";

import { colors } from "../../constants/theme";
import { auth } from "../../services/firebase/firebase";
import { useAuthStore } from "../../stores/auth.store";

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your profile</Text>

      <Text style={styles.name}>
        {user?.displayName || "SnapSort user"}
      </Text>

      <Text style={styles.email}>{user?.email}</Text>

      <Button
        mode="outlined"
        icon="logout"
        textColor="#B3261E"
        onPress={handleSignOut}
      >
        Sign out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontFamily: "Poppins_700Bold",
    color: colors.text,
    fontSize: 28,
    marginBottom: 24,
  },
  name: {
    fontFamily: "Poppins_600SemiBold",
    color: colors.text,
    fontSize: 19,
  },
  email: {
    fontFamily: "Poppins_400Regular",
    color: colors.muted,
    marginTop: 5,
    marginBottom: 30,
  },
});