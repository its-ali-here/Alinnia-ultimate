import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearProgress } from "../../components/LinearProgress";
import { WizardHeader } from "../../components/WizardHeader";
import { PillButton } from "../../components/PillButton";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useOnboardingDraft } from "../../contexts/OnboardingDraft";
import { darkColors, fontFamily, fontSize, radius, spacing } from "../../lib/theme";

export default function Reminders() {
  const { mealSlots, setRemindersEnabled } = useOnboardingDraft();
  const totalSteps = 2 + mealSlots.length + 1;

  function continueOn() {
    router.push("/(setup)/premium");
  }

  function enable() {
    setRemindersEnabled(true);
    continueOn();
  }

  function skip() {
    setRemindersEnabled(false);
    continueOn();
  }

  return (
    <ScreenContainer>
      <WizardHeader title="Reminders" actionLabel="Next" onAction={continueOn} />
      <LinearProgress progress={totalSteps / totalSteps} />

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconBadge}>
            <Ionicons name="alarm" size={40} color={darkColors.coral} />
          </View>
          <Text style={styles.headline}>Build the habit of following your plan.</Text>
          <Text style={styles.subtext}>Want a quick end-of-day reminder to mark what you ate?</Text>
        </View>

        <Text style={styles.note}>
          If you choose yes, we'll ask for notification permissions. We only send meal reminders, never marketing
          notifications.
        </Text>

        <PillButton title="Enable check-in" variant="coral" onPress={enable} style={styles.enableButton} />
        <Pressable onPress={skip}>
          <Text style={styles.noThanks}>No thanks</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, marginTop: spacing.xxl, alignItems: "center" },
  card: {
    borderWidth: 1.5,
    borderColor: darkColors.coral,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
    width: "100%",
  },
  iconBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: darkColors.coralTint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  headline: { fontSize: fontSize.lg, fontFamily: fontFamily.bodyBold, color: darkColors.text, textAlign: "center", marginBottom: spacing.sm },
  subtext: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: darkColors.text, textAlign: "center" },
  note: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: darkColors.textMuted, textAlign: "center", marginTop: spacing.xl, lineHeight: 20 },
  enableButton: { marginTop: spacing.xl, alignSelf: "stretch" },
  noThanks: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.bodyMedium,
    color: darkColors.coral,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: darkColors.border,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
});
