import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { AmountStepper } from "../../components/AmountStepper";
import { Button } from "../../components/Button";
import { DiningTable } from "../../components/DiningTable";
import { ScreenContainer } from "../../components/ScreenContainer";
import { StepHeader } from "../../components/StepHeader";
import { useOnboardingDraft } from "../../contexts/OnboardingDraft";
import { useTheme } from "../../contexts/ThemeContext";
import { fontFamily, fontSize, radius, spacing, type ThemeColors } from "../../lib/theme";

export default function Household() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { adultsCount, setAdultsCount, childrenCount, setChildrenCount } = useOnboardingDraft();
  const total = adultsCount + childrenCount;

  function next() {
    router.push("/(setup)/needs");
  }

  return (
    <ScreenContainer>
      <StepHeader step={2} total={8} title="Who's at your table?" subtitle="So we can size portions and balance the week for everyone." />

      <View style={styles.content}>
        <DiningTable adults={adultsCount} children={childrenCount} />

        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Adults</Text>
            <Text style={styles.sublabel}>13 and older</Text>
          </View>
          <View style={styles.controls}>
            <Text style={styles.count}>{adultsCount}</Text>
            <AmountStepper value={adultsCount} onChange={(v) => setAdultsCount(Math.max(1, v))} min={1} />
          </View>
        </View>
        <View style={[styles.row, styles.rowLast]}>
          <View>
            <Text style={styles.label}>Children</Text>
            <Text style={styles.sublabel}>Under 13</Text>
          </View>
          <View style={styles.controls}>
            <Text style={styles.count}>{childrenCount}</Text>
            <AmountStepper value={childrenCount} onChange={(v) => setChildrenCount(Math.max(0, v))} min={0} />
          </View>
        </View>

        <View style={styles.callout}>
          <Text style={styles.calloutText}>
            Cooking for <Text style={styles.calloutStrong}>{total}</Text>. You can change this any night — guests, someone
            away, a smaller dinner.
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
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowLast: { borderBottomWidth: 0 },
    label: { fontSize: fontSize.lg, fontFamily: fontFamily.display, color: colors.text },
    sublabel: { fontSize: fontSize.xs, fontFamily: fontFamily.bodyBold, color: colors.textMuted, marginTop: 1 },
    controls: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    count: { fontSize: fontSize.lg, fontFamily: fontFamily.bodyBold, color: colors.text, minWidth: 20, textAlign: "center" },
    callout: { marginTop: spacing.lg, backgroundColor: colors.primaryTint, borderRadius: radius.sm, padding: spacing.md },
    calloutText: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyMedium, color: colors.text, lineHeight: 20 },
    calloutStrong: { fontFamily: fontFamily.bodyBold },
    footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  });
}
