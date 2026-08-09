import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { LinearProgress } from "../../../components/LinearProgress";
import { WizardHeader } from "../../../components/WizardHeader";
import { PillButton } from "../../../components/PillButton";
import { ScreenContainer } from "../../../components/ScreenContainer";
import { useOnboardingDraft } from "../../../contexts/OnboardingDraft";
import { darkColors, fontFamily, fontSize, radius, spacing } from "../../../lib/theme";
import { MEAL_CATEGORIES } from "../../../lib/mealCategories";

export default function MealPreferences() {
  const { meal: mealKey } = useLocalSearchParams<{ meal: string }>();
  const { mealSlots, updateMealSlot } = useOnboardingDraft();
  const index = mealSlots.findIndex((m) => m.key === mealKey);
  const meal = mealSlots[index];
  const totalSteps = 2 + mealSlots.length + 1;

  if (!meal) {
    router.replace("/(setup)/reminders");
    return null;
  }

  const categories = MEAL_CATEGORIES[meal.key] ?? [];

  function next() {
    const nextMeal = mealSlots[index + 1];
    if (nextMeal) {
      router.push(`/(setup)/meal-preferences/${nextMeal.key}`);
    } else {
      router.push("/(setup)/reminders");
    }
  }

  function toggleCategory(categoryKey: string) {
    const has = meal.preferredCategories.includes(categoryKey);
    updateMealSlot(meal.key, {
      preferredCategories: has ? meal.preferredCategories.filter((c) => c !== categoryKey) : [...meal.preferredCategories, categoryKey],
    });
  }

  return (
    <ScreenContainer>
      <WizardHeader title={meal.label} actionLabel="Next" onAction={next} />
      <LinearProgress progress={(3 + index) / totalSteps} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Family</Text>
          <Ionicons
            name="help-circle-outline"
            size={20}
            color={darkColors.text}
            onPress={() => Alert.alert("Family", "Extra portions to plan for beyond yourself, for this meal.")}
          />
        </View>

        <View style={styles.familyRow}>
          <Text style={styles.familyLabel}>Additional family members</Text>
          <View style={styles.familyValueWrap}>
            <Text style={styles.familyValue}>{meal.additionalFamilyMembers}</Text>
          </View>
          <View style={styles.stepperButtons}>
            <Pressable
              style={styles.stepperButton}
              onPress={() => updateMealSlot(meal.key, { additionalFamilyMembers: Math.max(0, meal.additionalFamilyMembers - 1) })}
            >
              <Ionicons name="remove" size={18} color={darkColors.text} />
            </Pressable>
            <Pressable
              style={[styles.stepperButton, styles.stepperButtonActive]}
              onPress={() => updateMealSlot(meal.key, { additionalFamilyMembers: meal.additionalFamilyMembers + 1 })}
            >
              <Ionicons name="add" size={18} color={darkColors.coral} />
            </Pressable>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Preferred Categories</Text>
        <Text style={styles.description}>
          Select the food categories you love most. Recipes from these categories will be prioritized within this
          Meal Type, provided they match your other preferences. For maximum variety, leave all options unchecked.
        </Text>

        <View style={styles.grid}>
          {categories.map((category) => {
            const selected = meal.preferredCategories.includes(category.key);
            return (
              <Pressable key={category.key} style={styles.tile} onPress={() => toggleCategory(category.key)}>
                <LinearGradient colors={category.gradient} style={StyleSheet.absoluteFill} />
                <Text style={styles.tileEmoji}>{category.emoji}</Text>
                <View style={styles.tileLabelWrap}>
                  <Text style={styles.tileLabel}>{category.label}</Text>
                </View>
                {selected ? (
                  <View style={styles.tileSelectedBorder}>
                    <Ionicons name="checkmark-circle" size={22} color={darkColors.coral} style={styles.tileCheck} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PillButton title="Next" variant="coral" onPress={next} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.bodyBold, color: darkColors.text, marginBottom: spacing.sm },
  familyRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.xl, gap: spacing.md },
  familyLabel: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: darkColors.text, flex: 1 },
  familyValueWrap: { borderBottomWidth: 1, borderBottomColor: darkColors.border, minWidth: 40, alignItems: "center" },
  familyValue: { fontSize: fontSize.lg, fontFamily: fontFamily.body, color: darkColors.text },
  stepperButtons: { flexDirection: "row", gap: spacing.sm },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: darkColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperButtonActive: { borderColor: darkColors.coral },
  description: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: darkColors.textMuted, lineHeight: 20, marginBottom: spacing.lg },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  tile: {
    flexBasis: "47%",
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  tileEmoji: { fontSize: 40 },
  tileLabelWrap: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.45)", padding: spacing.sm },
  tileLabel: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyMedium, color: darkColors.text, textAlign: "center" },
  tileSelectedBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 3,
    borderColor: darkColors.coral,
    borderRadius: radius.md,
  },
  tileCheck: { position: "absolute", top: spacing.xs, right: spacing.xs },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
});
