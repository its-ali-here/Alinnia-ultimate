import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/Button";
import { StepProgress } from "../../components/StepProgress";
import { useOnboardingDraft } from "../../contexts/OnboardingDraft";
import { colors, fontFamily, fontSize, radius, spacing } from "../../lib/theme";

export default function Household() {
  const { householdSize, setHouseholdSize } = useOnboardingDraft();

  return (
    <View style={styles.container}>
      <StepProgress step={1} total={3} />

      <Text style={styles.title}>Who are you cooking for?</Text>
      <Text style={styles.subtitle}>We'll scale every ingredient list to match.</Text>

      <View style={styles.stepperCard}>
        <StepperButton icon="remove" onPress={() => setHouseholdSize(Math.max(1, householdSize - 1))} />
        <Text style={styles.stepperValue}>{householdSize}</Text>
        <StepperButton icon="add" onPress={() => setHouseholdSize(Math.min(12, householdSize + 1))} />
      </View>
      <Text style={styles.stepperLabel}>{householdSize === 1 ? "person" : "people"}</Text>

      <View style={styles.footer}>
        <Button title="Next" icon="arrow-forward" onPress={() => router.push("/(setup)/preferences")} />
      </View>
    </View>
  );
}

function StepperButton({ icon, onPress }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.stepperButton}>
      <Ionicons name={icon} size={22} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: spacing.xxl },
  title: { fontSize: fontSize.xxl, fontFamily: fontFamily.displayBold, color: colors.text },
  subtitle: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xxl },
  stepperCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
    alignSelf: "center",
  },
  stepperButton: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValue: { fontSize: 48, fontFamily: fontFamily.displayBold, color: colors.text, minWidth: 80, textAlign: "center" },
  stepperLabel: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  footer: { marginTop: "auto", paddingBottom: spacing.md },
});
