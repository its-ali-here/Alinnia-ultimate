import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PillButton } from "../../components/PillButton";
import { ScreenContainer } from "../../components/ScreenContainer";
import { darkColors, fontFamily, fontSize, spacing } from "../../lib/theme";

export default function Welcome() {
  return (
    <ScreenContainer style={styles.container} topSpacing={0}>
      <View style={styles.hero}>
        <Text style={styles.wordmark}>Mealinnia</Text>
        <Text style={styles.tagline}>Cook What You Crave®</Text>
      </View>

      <View style={styles.footer}>
        <PillButton title="Get Started" variant="coral" onPress={() => router.push("/(setup)/meal-plan")} style={styles.button} />
        <PillButton
          title="I already have an account"
          variant="blue"
          onPress={() => router.push("/(auth)/sign-in")}
          style={styles.button}
        />

        <View style={styles.langRow}>
          <Ionicons name="globe-outline" size={16} color={darkColors.coral} />
          <Text style={styles.langText}>Language: English</Text>
          <Text style={styles.beta}>BETA</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, justifyContent: "space-between" },
  hero: { flex: 1, justifyContent: "center" },
  wordmark: {
    fontSize: 56,
    fontFamily: fontFamily.displayBold,
    color: darkColors.coral,
    lineHeight: 60,
  },
  tagline: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.tagline,
    color: darkColors.text,
    marginTop: spacing.xxl,
  },
  footer: { paddingBottom: spacing.md },
  button: { marginBottom: spacing.md },
  langRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, marginTop: spacing.sm },
  langText: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyMedium, color: darkColors.coral },
  beta: { fontSize: fontSize.xs, fontFamily: fontFamily.bodyBold, color: darkColors.coral, marginLeft: spacing.xs, letterSpacing: 1 },
});
