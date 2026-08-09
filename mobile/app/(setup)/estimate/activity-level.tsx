import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { PillButton } from "../../../components/PillButton";
import { ScreenContainer } from "../../../components/ScreenContainer";
import { SelectableBox } from "../../../components/SelectableBox";
import { WizardHeader } from "../../../components/WizardHeader";
import { useOnboardingDraft } from "../../../contexts/OnboardingDraft";
import { darkColors, fontFamily, fontSize, spacing } from "../../../lib/theme";
import type { ActivityLevel } from "../../../lib/estimateNutrition";

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: "sedentary", label: "Sedentary", description: "Little to no exercise with a desk job" },
  { value: "light", label: "Lightly Active", description: "Light daily activity with some exercise 1 - 3 days a week" },
  { value: "moderate", label: "Moderately Active", description: "Moderately active daily life with exercise 3 - 5 days a week" },
  { value: "very", label: "Very Active", description: "Physically demanding lifestyle with hard exercise or sports 6 - 7 days a week" },
  { value: "extreme", label: "Extremely Active", description: "Hard daily exercise or sports and a physical job" },
];

export default function ActivityLevelScreen() {
  const { activityLevel, setActivityLevel } = useOnboardingDraft();

  function next() {
    router.push("/(setup)/estimate/nutrition-targets");
  }

  return (
    <ScreenContainer>
      <WizardHeader title="Activity level" actionLabel="Next" onAction={next} />

      <View style={styles.content}>
        <Text style={styles.question}>How active are you?</Text>

        {ACTIVITY_LEVELS.map((level) => (
          <SelectableBox
            key={level.value}
            label={level.label}
            description={level.description}
            selected={activityLevel === level.value}
            onPress={() => setActivityLevel(level.value)}
          />
        ))}
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
  footer: { marginTop: "auto", paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
});
