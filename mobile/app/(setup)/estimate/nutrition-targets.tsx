import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { PillButton } from "../../../components/PillButton";
import { ScreenContainer } from "../../../components/ScreenContainer";
import { WizardHeader } from "../../../components/WizardHeader";
import { useOnboardingDraft } from "../../../contexts/OnboardingDraft";
import { darkColors, fontFamily, fontSize, spacing } from "../../../lib/theme";
import { estimateNutrition } from "../../../lib/estimateNutrition";

export default function NutritionTargets() {
  const draft = useOnboardingDraft();
  const { setCalories, setMacros } = draft;

  const result = estimateNutrition(draft);

  function finish() {
    setCalories(result.calories);
    setMacros({ carbsG: result.carbsG, fatG: result.fatG, proteinG: result.proteinG });
    router.dismissTo("/(setup)/meal-plan");
  }

  return (
    <ScreenContainer>
      <WizardHeader title="Nutrition Targets" actionLabel="Finish" onAction={finish} />

      <View style={styles.content}>
        <Text style={styles.description}>
          Here are the nutrition targets we've estimated. You can adjust the targets when you create a free account.
        </Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Calories</Text>
          <Text style={styles.rowValue}>{result.calories}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: darkColors.carbs }]}>Carbs</Text>
          <Text style={[styles.rowValue, { color: darkColors.carbs }]}>at least {result.carbsG}g</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: darkColors.fat }]}>Fat</Text>
          <Text style={[styles.rowValue, { color: darkColors.fat }]}>at least {result.fatG}g</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: darkColors.protein }]}>Protein</Text>
          <Text style={[styles.rowValue, { color: darkColors.protein }]}>at least {result.proteinG}g</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <PillButton title="Finish" variant="coral" onPress={finish} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg },
  description: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: darkColors.textMuted, lineHeight: 20, marginBottom: spacing.xl },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.md },
  rowLabel: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: darkColors.text },
  rowValue: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: darkColors.text },
  footer: { marginTop: "auto", paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
});
