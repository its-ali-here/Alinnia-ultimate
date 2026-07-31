import { StyleSheet, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/Button";
import { colors, fontFamily, fontSize, radius, spacing } from "../../lib/theme";

export default function Welcome() {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.badge}
        >
          <Ionicons name="restaurant" size={40} color={colors.primaryText} />
        </LinearGradient>

        <Text style={styles.title}>Alinnia</Text>
        <Text style={styles.subtitle}>
          Dishes you already love, picked to fill this week's nutrient gaps — scaled to your kitchen.
        </Text>

        <View style={styles.stepsList}>
          <Step icon="clipboard-outline" text="Tell us about your kitchen" />
          <Step icon="restaurant-outline" text="Get a dish suggestion each day" />
          <Step icon="cart-outline" text="Get a shopping list, scaled for you" />
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="Get started" icon="arrow-forward" onPress={() => router.push("/(setup)/household")} />
        <Link href="/(auth)/sign-in" style={styles.link}>
          Already have an account? Sign in
        </Link>
      </View>
    </View>
  );
}

function Step({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: "space-between" },
  hero: { flex: 1, justifyContent: "center", alignItems: "center" },
  badge: {
    width: 88,
    height: 88,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: { fontSize: fontSize.display, fontFamily: fontFamily.displayBold, color: colors.text, textAlign: "center" },
  subtitle: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  stepsList: { width: "100%", gap: spacing.md },
  stepRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyMedium, color: colors.text, flex: 1 },
  footer: { paddingBottom: spacing.md },
  link: { marginTop: spacing.lg, textAlign: "center", color: colors.primary, fontFamily: fontFamily.bodyMedium, fontSize: fontSize.sm },
});
