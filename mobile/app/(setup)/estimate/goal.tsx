import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { PillButton } from "../../../components/PillButton";
import { ScreenContainer } from "../../../components/ScreenContainer";
import { SelectableBox } from "../../../components/SelectableBox";
import { WizardHeader } from "../../../components/WizardHeader";
import { useOnboardingDraft } from "../../../contexts/OnboardingDraft";
import { darkColors, fontFamily, fontSize, radius, spacing } from "../../../lib/theme";
import type { GeneralGoal } from "../../../lib/estimateNutrition";

const GENERAL_GOALS: { value: GeneralGoal; label: string }[] = [
  { value: "lose_fat", label: "Lose fat" },
  { value: "maintain", label: "Maintain weight" },
  { value: "build_muscle", label: "Build muscle" },
];

export default function Goal() {
  const { goalMode, setGoalMode, goalGeneral, setGoalGeneral, goalWeight, setGoalWeight, weightChangeRate, setWeightChangeRate } =
    useOnboardingDraft();

  function next() {
    router.push("/(setup)/estimate/activity-level");
  }

  return (
    <ScreenContainer>
      <WizardHeader title="Goal" actionLabel="Next" onAction={next} />

      <View style={styles.content}>
        <Text style={styles.question}>What is your goal?</Text>

        <View style={styles.segmented}>
          <Pressable style={[styles.segment, goalMode === "general" && styles.segmentActive]} onPress={() => setGoalMode("general")}>
            <Text style={[styles.segmentText, goalMode === "general" && styles.segmentTextActive]}>General goal</Text>
          </Pressable>
          <Pressable style={[styles.segment, goalMode === "exact" && styles.segmentActive]} onPress={() => setGoalMode("exact")}>
            <Text style={[styles.segmentText, goalMode === "exact" && styles.segmentTextActive]}>Exact goal</Text>
          </Pressable>
        </View>

        {goalMode === "general" ? (
          <View>
            {GENERAL_GOALS.map((goal) => (
              <SelectableBox
                key={goal.value}
                label={goal.label}
                selected={goalGeneral === goal.value}
                onPress={() => setGoalGeneral(goal.value)}
              />
            ))}
          </View>
        ) : (
          <View>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Goal weight</Text>
              <TextInput
                value={String(goalWeight)}
                onChangeText={(t) => setGoalWeight(Number(t.replace(/[^0-9]/g, "")) || 0)}
                keyboardType="number-pad"
                style={styles.numberInput}
              />
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Weight change rate</Text>
              <TextInput
                value={String(weightChangeRate)}
                onChangeText={(t) => setWeightChangeRate(Number(t.replace(/[^0-9.]/g, "")) || 0)}
                keyboardType="decimal-pad"
                style={styles.numberInput}
              />
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <PillButton title="Next" variant="coral" onPress={next} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg },
  question: { fontSize: fontSize.lg, fontFamily: fontFamily.body, color: darkColors.text, textAlign: "center", marginBottom: spacing.xl },
  segmented: { flexDirection: "row", borderRadius: radius.pill, overflow: "hidden", borderWidth: 1, borderColor: darkColors.border, marginBottom: spacing.xl },
  segment: { flex: 1, paddingVertical: spacing.md, alignItems: "center", justifyContent: "center" },
  segmentActive: { backgroundColor: darkColors.coral },
  segmentText: { fontSize: fontSize.md, fontFamily: fontFamily.bodyMedium, color: darkColors.text },
  segmentTextActive: { color: darkColors.text },
  fieldRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: darkColors.border,
    paddingBottom: spacing.xs,
    marginBottom: spacing.xl,
  },
  label: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: darkColors.text },
  numberInput: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: darkColors.text, padding: 0, minWidth: 60, textAlign: "right" },
  footer: { marginTop: "auto", paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
});
