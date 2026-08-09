import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { LinearProgress } from "../../components/LinearProgress";
import { WizardHeader } from "../../components/WizardHeader";
import { PillButton } from "../../components/PillButton";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useOnboardingDraft } from "../../contexts/OnboardingDraft";
import { darkColors, fontFamily, fontSize, radius, spacing } from "../../lib/theme";
import { COMMON_ALLERGIES } from "../../lib/allergies";

export default function Allergies() {
  const { allergies, toggleAllergy, mealSlots } = useOnboardingDraft();
  const totalSteps = 2 + mealSlots.length + 1;

  function next() {
    router.push("/(setup)/your-meals");
  }

  return (
    <ScreenContainer>
      <WizardHeader title="Allergies" actionLabel="Next" onAction={next} />
      <LinearProgress progress={1 / totalSteps} />

      <View style={styles.content}>
        <Text style={styles.question}>Do you have any of these common allergies?</Text>

        <View style={styles.pillsWrap}>
          {COMMON_ALLERGIES.map((allergy) => {
            const selected = allergies.includes(allergy);
            return (
              <Pressable
                key={allergy}
                style={[styles.pill, selected && styles.pillSelected]}
                onPress={() => toggleAllergy(allergy)}
              >
                <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{allergy}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.note}>You can exclude more types of foods and even custom keywords later in the Settings menu.</Text>
      </View>

      <View style={styles.footer}>
        <PillButton title="Next" variant="coral" onPress={next} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  question: { fontSize: fontSize.lg, fontFamily: fontFamily.body, color: darkColors.text, textAlign: "center", marginBottom: spacing.xl },
  pillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  pill: {
    borderWidth: 1.5,
    borderColor: darkColors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
  },
  pillSelected: { backgroundColor: darkColors.coral, borderColor: darkColors.coral },
  pillText: { fontSize: fontSize.md, fontFamily: fontFamily.bodyMedium, color: darkColors.text },
  pillTextSelected: { color: darkColors.text },
  note: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: darkColors.textMuted, marginTop: spacing.xl, lineHeight: 20 },
  footer: { marginTop: "auto", paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
});
