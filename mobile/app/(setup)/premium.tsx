import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PillButton } from "../../components/PillButton";
import { ScreenContainer } from "../../components/ScreenContainer";
import { darkColors, fontFamily, fontSize, radius, spacing } from "../../lib/theme";

type Plan = "monthly" | "yearly";

const FEATURES = ["Plan a week of meals at a time", "Instant grocery lists, delivered", "Automatic leftovers planning"];

function notImplemented(what: string) {
  Alert.alert("Coming soon", `${what} isn't built yet.`);
}

export default function Premium() {
  const [plan, setPlan] = useState<Plan>("yearly");

  function finish() {
    router.push("/(setup)/create-account");
  }

  return (
    <ScreenContainer>
      <Pressable style={styles.closeButton} onPress={finish} hitSlop={12}>
        <Ionicons name="close" size={26} color={darkColors.text} />
      </Pressable>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headline}>Put your diet on autopilot</Text>
        <Text style={styles.withText}>with</Text>
        <Text style={styles.brandLine}>
          <Text style={styles.brandName}>Mealinnia</Text> <Text style={styles.brandPremium}>Premium</Text>
        </Text>

        <View style={styles.features}>
          {FEATURES.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <View style={styles.featureCheck}>
                <Ionicons name="checkmark" size={14} color={darkColors.text} />
              </View>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.andMore}>And more!</Text>
        <Pressable onPress={() => notImplemented("The full feature list")}>
          <Text style={styles.seeAll}>See all the extra features</Text>
        </Pressable>

        <Text style={styles.trial}>Try it risk-free with a 14 day free trial</Text>

        <View style={styles.plansRow}>
          <Pressable style={[styles.planCard, plan === "monthly" && styles.planCardSelected]} onPress={() => setPlan("monthly")}>
            <Text style={styles.planTitle}>Mealinnia Subscription</Text>
            <Text style={styles.planPrice}>Rs 3,900.00 / month</Text>
            <View style={styles.planFooterRow}>
              <Text style={styles.planFooterText}>Billed monthly after free trial</Text>
              <Ionicons
                name={plan === "monthly" ? "checkmark-circle" : "ellipse-outline"}
                size={22}
                color={plan === "monthly" ? darkColors.coral : darkColors.textMuted}
              />
            </View>
          </Pressable>

          <Pressable style={[styles.planCard, plan === "yearly" && styles.planCardSelected]} onPress={() => setPlan("yearly")}>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>Save 87%</Text>
            </View>
            <Text style={styles.planTitle}>Mealinnia Subscription</Text>
            <Text style={styles.planPrice}>Rs 6,300.00 / year</Text>
            <Text style={styles.planEquivalent}>equivalent to Rs525.00 per month</Text>
            <View style={styles.planFooterRow}>
              <Text style={styles.planFooterText}>Billed yearly after free trial</Text>
              <Ionicons
                name={plan === "yearly" ? "checkmark-circle" : "ellipse-outline"}
                size={22}
                color={plan === "yearly" ? darkColors.coral : darkColors.textMuted}
              />
            </View>
          </Pressable>
        </View>

        <Text style={styles.cancelNote}>Change plans or cancel anytime.</Text>

        <PillButton title="Start the 14 day free trial" variant="coral" onPress={finish} style={styles.startButton} />

        <View style={styles.bottomLinks}>
          <Pressable onPress={() => notImplemented("Restoring a purchase")}>
            <Text style={styles.bottomLink}>Restore purchase</Text>
          </Pressable>
          <Pressable onPress={() => notImplemented("Terms & Conditions")}>
            <Text style={styles.bottomLink}>Terms & Conditions</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  closeButton: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, alignItems: "center" },
  headline: { fontSize: fontSize.xxl, fontFamily: fontFamily.bodyBold, color: darkColors.text, textAlign: "center" },
  withText: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: darkColors.textMuted, marginTop: spacing.xs },
  brandLine: { textAlign: "center", marginTop: spacing.xs, marginBottom: spacing.xl },
  brandName: { fontSize: fontSize.xl, fontFamily: fontFamily.displayBold, color: darkColors.text },
  brandPremium: { fontSize: fontSize.xl, fontFamily: fontFamily.displayBold, color: darkColors.coral },
  features: { alignSelf: "stretch", gap: spacing.md, marginBottom: spacing.lg },
  featureRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  featureCheck: { width: 26, height: 26, borderRadius: 13, backgroundColor: darkColors.blue, alignItems: "center", justifyContent: "center" },
  featureText: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: darkColors.text, flex: 1 },
  andMore: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: darkColors.text, marginTop: spacing.sm },
  seeAll: { fontSize: fontSize.md, fontFamily: fontFamily.bodyMedium, color: darkColors.coral, marginTop: spacing.xs, marginBottom: spacing.xl },
  trial: { fontSize: fontSize.lg, fontFamily: fontFamily.bodyBold, color: darkColors.text, textAlign: "center", marginBottom: spacing.lg },
  plansRow: { flexDirection: "row", gap: spacing.md, alignSelf: "stretch", marginBottom: spacing.lg },
  planCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: darkColors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: darkColors.surface,
  },
  planCardSelected: { borderColor: darkColors.coral },
  saveBadge: {
    position: "absolute",
    top: -12,
    alignSelf: "center",
    backgroundColor: darkColors.coral,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  saveBadgeText: { fontSize: fontSize.xs, fontFamily: fontFamily.bodyBold, color: darkColors.text },
  planTitle: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyBold, color: darkColors.text, textAlign: "center", marginTop: spacing.sm },
  planPrice: { fontSize: fontSize.md, fontFamily: fontFamily.bodyBold, color: darkColors.text, textAlign: "center", marginTop: spacing.sm },
  planEquivalent: { fontSize: fontSize.xs, fontFamily: fontFamily.body, color: darkColors.textMuted, textAlign: "center", marginTop: spacing.xs },
  planFooterRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.lg, gap: spacing.xs },
  planFooterText: { fontSize: fontSize.xs, fontFamily: fontFamily.body, color: darkColors.textMuted, flex: 1 },
  cancelNote: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: darkColors.textMuted, marginBottom: spacing.lg },
  startButton: { alignSelf: "stretch" },
  bottomLinks: { flexDirection: "row", gap: spacing.xl, marginTop: spacing.lg },
  bottomLink: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyMedium, color: darkColors.coral },
});
