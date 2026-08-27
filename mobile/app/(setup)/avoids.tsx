import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Button } from "../../components/Button";
import { Chip } from "../../components/Chip";
import { ScreenContainer } from "../../components/ScreenContainer";
import { SpiceSlider } from "../../components/SpiceSlider";
import { StepHeader } from "../../components/StepHeader";
import { useOnboardingDraft } from "../../contexts/OnboardingDraft";
import { useTheme } from "../../contexts/ThemeContext";
import { fontFamily, fontSize, spacing, type ThemeColors } from "../../lib/theme";

const AVOID_OPTIONS = [
  { key: "beef", label: "No beef" },
  { key: "seafood", label: "No seafood" },
  { key: "eggs", label: "No eggs" },
  { key: "nuts", label: "Nut allergy" },
  { key: "dairy", label: "No dairy" },
];

const SPICE_LABELS: Record<number, string> = {
  1: "Mild",
  2: "Light",
  3: "Medium",
  4: "Hot",
  5: "Very hot",
};

export default function Avoids() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { avoids, toggleAvoid, spiceLevel, setSpiceLevel } = useOnboardingDraft();

  function next() {
    router.push("/(setup)/dishes");
  }

  return (
    <ScreenContainer>
      <StepHeader step={5} total={8} title="Anything to avoid?" subtitle="We'll never suggest these." />

      <View style={styles.content}>
        <View style={styles.chips}>
          {AVOID_OPTIONS.map((option) => (
            <Chip
              key={option.key}
              label={option.label}
              active={avoids.includes(option.key)}
              onPress={() => toggleAvoid(option.key)}
            />
          ))}
        </View>

        <View style={styles.spice}>
          <View style={styles.spiceTop}>
            <Text style={styles.spiceLabel}>How hot do you cook?</Text>
            <Text style={styles.spiceValue}>{SPICE_LABELS[spiceLevel]}</Text>
          </View>
          <SpiceSlider level={spiceLevel} onChange={setSpiceLevel} />
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
    chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    spice: { marginTop: spacing.xl },
    spiceTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: spacing.sm },
    spiceLabel: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyBold, color: colors.text },
    spiceValue: { fontSize: fontSize.xs, fontFamily: fontFamily.bodyBold, color: colors.textMuted },
    footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  });
}
