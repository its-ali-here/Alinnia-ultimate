import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Button } from "../../components/Button";
import { Chip } from "../../components/Chip";
import { ScreenContainer } from "../../components/ScreenContainer";
import { StepHeader } from "../../components/StepHeader";
import { useOnboardingDraft } from "../../contexts/OnboardingDraft";
import { useTheme } from "../../contexts/ThemeContext";
import { NEEDS } from "../../lib/needs";
import { fontFamily, fontSize, radius, spacing, type ThemeColors } from "../../lib/theme";

export default function Needs() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { needs, toggleNeed } = useOnboardingDraft();

  function clear() {
    needs.forEach(toggleNeed);
  }

  function next() {
    router.push("/(setup)/who-cooks");
  }

  return (
    <ScreenContainer>
      <StepHeader step={3} total={8} title="Anyone with specific needs?" subtitle="We'll plan dinners the whole table can share, not separate meals." />

      <View style={styles.content}>
        <View style={styles.chips}>
          {NEEDS.map((need) => (
            <Chip
              key={need.key}
              label={need.label}
              tone={need.tone}
              active={needs.includes(need.key)}
              onPress={() => toggleNeed(need.key)}
            />
          ))}
          <Chip label="Nobody, thanks" active={needs.length === 0} onPress={clear} />
        </View>

        <View style={styles.callout}>
          <Text style={styles.calloutText}>We'll ask who, later. Right now we just need to know it matters.</Text>
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
    callout: { marginTop: spacing.xl, backgroundColor: colors.primaryTint, borderRadius: radius.sm, padding: spacing.md },
    calloutText: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyMedium, color: colors.text, lineHeight: 20 },
    footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  });
}
