import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearProgress } from "../../components/LinearProgress";
import { WizardHeader } from "../../components/WizardHeader";
import { PillButton } from "../../components/PillButton";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useOnboardingDraft } from "../../contexts/OnboardingDraft";
import { darkColors, fontFamily, fontSize, radius, spacing } from "../../lib/theme";

export default function YourMeals() {
  const { mealSlots, removeMealSlot, updateMealSlot, enableAllMeals } = useOnboardingDraft();
  const totalSteps = 2 + mealSlots.length + 1;

  function next() {
    if (mealSlots.length === 0) {
      router.push("/(setup)/reminders");
      return;
    }
    router.push(`/(setup)/meal-preferences/${mealSlots[0].key}`);
  }

  return (
    <ScreenContainer>
      <WizardHeader title="Your meals" actionLabel="Next" onAction={next} />
      <LinearProgress progress={2 / totalSteps} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.paragraph}>Which meals would you like for us to plan for you every day?</Text>
        <Text style={styles.paragraph}>
          After finishing signup, you'll have more options, like rearranging the meals, adding new ones, and editing
          their settings in more detail.
        </Text>

        <View style={styles.headerRow}>
          <Text style={styles.headerLabel}>Your meals</Text>
          <Pressable style={styles.planForMe} onPress={enableAllMeals}>
            <Text style={styles.planForMeText}>Plan for me</Text>
            <Ionicons
              name="help-circle-outline"
              size={20}
              color={darkColors.text}
              onPress={() => Alert.alert("Plan for me", "Turns on generating for every meal below.")}
            />
          </Pressable>
        </View>

        {mealSlots.map((meal) => (
          <View key={meal.key} style={styles.mealBlock}>
            <View style={styles.mealRow}>
              <Text style={styles.mealLabel}>{meal.label}</Text>
              <Pressable onPress={() => removeMealSlot(meal.key)} hitSlop={8}>
                <Text style={styles.removeLink}>Remove</Text>
              </Pressable>
              <View style={{ flex: 1 }} />
              <Pressable
                style={[styles.checkbox, meal.generate && styles.checkboxChecked]}
                onPress={() => updateMealSlot(meal.key, { generate: !meal.generate })}
              >
                {meal.generate ? <Ionicons name="checkmark" size={16} color={darkColors.text} /> : null}
              </Pressable>
            </View>
            {!meal.generate ? (
              <Text style={styles.placeholderNote}>
                We'll treat this meal like a placeholder. We won't suggest any dishes here, and we'll leave space in
                your targets so you can track what you actually ate by searching or scanning barcodes.
              </Text>
            ) : null}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <PillButton title="Next" variant="coral" onPress={next} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  paragraph: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: darkColors.text, marginBottom: spacing.md, lineHeight: 22 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: darkColors.border,
    paddingBottom: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerLabel: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: darkColors.text },
  planForMe: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  planForMeText: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: darkColors.text },
  mealBlock: { marginBottom: spacing.xl },
  mealRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  mealLabel: { fontSize: fontSize.xxl, fontFamily: fontFamily.body, color: darkColors.text },
  removeLink: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyMedium, color: darkColors.coral },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: darkColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: darkColors.coral, borderColor: darkColors.coral },
  placeholderNote: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: darkColors.textMuted, marginTop: spacing.sm, lineHeight: 20 },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
});
