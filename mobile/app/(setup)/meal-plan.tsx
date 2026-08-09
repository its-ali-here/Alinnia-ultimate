import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DarkDropdown } from "../../components/DarkDropdown";
import { PillButton } from "../../components/PillButton";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useOnboardingDraft } from "../../contexts/OnboardingDraft";
import { darkColors, fontFamily, fontSize, spacing } from "../../lib/theme";
import { excludesText, getDietType } from "../../lib/dietTypes";

const MEAL_OPTIONS = [2, 3, 4, 5, 6].map((n) => ({ label: `${n} meals`, value: String(n) }));

export default function MealPlan() {
  const { calories, setCalories, meals, setMeals, dietType, carbsG, fatG, proteinG } = useOnboardingDraft();
  const diet = getDietType(dietType);

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={darkColors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Create Your Meal Plan</Text>
        <View style={{ width: 26 }} />
      </View>

      <Text style={styles.label}>I want to eat</Text>
      <View style={styles.caloriesRow}>
        <TextInput
          value={String(calories)}
          onChangeText={(t) => setCalories(Number(t.replace(/[^0-9]/g, "")) || 0)}
          keyboardType="number-pad"
          style={styles.caloriesInput}
        />
        <Text style={styles.kcal}>kcal</Text>
      </View>

      <PillButton
        title="Not sure?"
        variant="blue"
        onPress={() => router.push("/(setup)/estimate/units")}
        style={styles.notSure}
      />

      <View style={styles.inRow}>
        <Text style={styles.label}>in</Text>
        <DarkDropdown options={MEAL_OPTIONS} value={String(meals)} onChange={(v) => setMeals(Number(v))} style={styles.mealsPicker} />
      </View>

      <Text style={styles.sectionTitle}>Targets</Text>
      <View style={styles.targetRow}>
        <Text style={[styles.targetLabel, { color: darkColors.carbs }]}>Carbs</Text>
        <Text style={styles.targetValue}>at least {carbsG}g</Text>
      </View>
      <View style={styles.targetRow}>
        <Text style={[styles.targetLabel, { color: darkColors.fat }]}>Fat</Text>
        <Text style={styles.targetValue}>at least {fatG}g</Text>
      </View>
      <View style={styles.targetRow}>
        <Text style={[styles.targetLabel, { color: darkColors.protein }]}>Protein</Text>
        <Text style={styles.targetValue}>at least {proteinG}g</Text>
      </View>
      <Text style={styles.note}>You can customize these when creating a free account.</Text>

      <View style={styles.dietRow}>
        <Text style={styles.dietIcon}>{diet.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.dietLabel}>{diet.label}</Text>
          <Text style={styles.dietExcludes}>Excludes: {excludesText(diet.excludes)}</Text>
        </View>
      </View>
      <PillButton
        title="Change diet type"
        variant="blue"
        onPress={() => router.push("/(setup)/diet-type")}
        style={styles.changeDiet}
      />

      <View style={styles.footer}>
        <PillButton title="Next" variant="coral" onPress={() => router.push("/(setup)/allergies")} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.xl },
  headerTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.bodyBold, color: darkColors.text },
  label: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: darkColors.text },
  caloriesRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: darkColors.border,
    paddingBottom: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  caloriesInput: { fontSize: 32, fontFamily: fontFamily.body, color: darkColors.text, flex: 1, minWidth: 0, padding: 0 },
  kcal: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: darkColors.text },
  notSure: { alignSelf: "flex-end", paddingVertical: spacing.xs, paddingHorizontal: spacing.md, marginBottom: spacing.xl },
  inRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.xl },
  mealsPicker: { flex: 1 },
  sectionTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.bodyBold, color: darkColors.text, marginBottom: spacing.md },
  targetRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  targetLabel: { fontSize: fontSize.md, fontFamily: fontFamily.bodyMedium },
  targetValue: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: darkColors.textMuted },
  note: { fontSize: fontSize.xs, fontFamily: fontFamily.body, color: darkColors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xl },
  dietRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
  dietIcon: { fontSize: 32 },
  dietLabel: { fontSize: fontSize.md, fontFamily: fontFamily.bodyMedium, color: darkColors.text },
  dietExcludes: { fontSize: fontSize.xs, fontFamily: fontFamily.body, color: darkColors.textMuted },
  changeDiet: { alignSelf: "flex-end", paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  footer: { marginTop: "auto", paddingBottom: spacing.md },
});
