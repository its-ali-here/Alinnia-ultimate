import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Button } from "../../components/Button";
import { ScreenContainer } from "../../components/ScreenContainer";
import { StepHeader } from "../../components/StepHeader";
import { useOnboardingDraft } from "../../contexts/OnboardingDraft";
import { useTheme } from "../../contexts/ThemeContext";
import { fontFamily, fontSize, radius, spacing, type ThemeColors } from "../../lib/theme";

const OPTIONS = [3, 5, 7];

export default function Nights() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { cookingNightsPerWeek, setCookingNightsPerWeek } = useOnboardingDraft();

  function next() {
    router.push("/(setup)/reveal");
  }

  return (
    <ScreenContainer>
      <StepHeader step={7} total={8} title="How many nights do you cook?" subtitle="The rest are yours — eating out, leftovers, whatever." />

      <View style={styles.content}>
        <View style={styles.row}>
          {OPTIONS.map((nights) => {
            const selected = cookingNightsPerWeek === nights;
            return (
              <Pressable
                key={nights}
                style={[styles.night, selected && styles.nightSelected]}
                onPress={() => setCookingNightsPerWeek(nights)}
              >
                <Text style={[styles.nightNumber, selected && styles.nightNumberSelected]}>{nights}</Text>
                <Text style={[styles.nightLabel, selected && styles.nightLabelSelected]}>NIGHTS</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.callout}>
          <Text style={styles.calloutText}>
            We'll balance the week across these <Text style={styles.calloutStrong}>{cookingNightsPerWeek}</Text> dinners
            — not every meal you eat.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="Continue" onPress={next} />
      </View>
    </ScreenContainer>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, flex: 1 },
    row: { flexDirection: "row", gap: spacing.sm },
    night: {
      flex: 1,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: radius.sm,
      paddingVertical: spacing.lg,
      alignItems: "center",
    },
    nightSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    nightNumber: { fontSize: fontSize.xxl, fontFamily: fontFamily.displayBold, color: colors.text },
    nightNumberSelected: { color: colors.primaryText },
    nightLabel: { fontSize: fontSize.xs, fontFamily: fontFamily.bodyBold, color: colors.textMuted, marginTop: 2 },
    nightLabelSelected: { color: colors.primaryText, opacity: 0.78 },
    callout: { marginTop: spacing.xl, backgroundColor: colors.primaryTint, borderRadius: radius.sm, padding: spacing.md },
    calloutText: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyMedium, color: colors.text, lineHeight: 20 },
    calloutStrong: { fontFamily: fontFamily.bodyBold },
    footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  });
}
