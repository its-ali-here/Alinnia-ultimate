import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/Button";
import { ScreenContainer } from "../../components/ScreenContainer";
import { StepHeader } from "../../components/StepHeader";
import { useOnboardingDraft } from "../../contexts/OnboardingDraft";
import { useTheme } from "../../contexts/ThemeContext";
import { fontFamily, fontSize, radius, spacing, type ThemeColors } from "../../lib/theme";

const AVOID_LABELS: Record<string, string> = {
  beef: "Beef",
  seafood: "Seafood",
  eggs: "Eggs",
  nuts: "Nuts",
  dairy: "Dairy",
};

const NEED_LABELS: Record<string, string> = {
  diabetic: "Someone diabetic",
  pregnant: "Someone pregnant",
  training_hard: "Someone training hard",
  fussy_eater: "A fussy eater",
  high_blood_pressure: "Someone with high blood pressure",
};

export default function Reveal() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { adultsCount, childrenCount, cuisines, avoids, needs, cookingNightsPerWeek } = useOnboardingDraft();
  const people = adultsCount + childrenCount;

  function next() {
    router.push("/(setup)/tonight");
  }

  return (
    <ScreenContainer>
      <StepHeader step={8} total={8} title="Your kitchen is set" subtitle="Change any of this later from your household settings." />

      <View style={styles.content}>
        <View style={styles.sprout}>
          <Ionicons name="leaf-outline" size={48} color={colors.primary} />
        </View>

        <View style={styles.summary}>
          <SummaryLine styles={styles} label="TABLE" value={`${people} ${people === 1 ? "person" : "people"}`} />
          <SummaryLine styles={styles} label="COOKING" value={cuisines.length > 0 ? cuisines.join(" · ") : "Whatever sounds good"} />
          <SummaryLine
            styles={styles}
            label="AVOIDING"
            value={avoids.length > 0 ? avoids.map((a) => AVOID_LABELS[a] ?? a).join(" · ") : "Nothing"}
          />
          <SummaryLine
            styles={styles}
            label="PLANNING FOR"
            value={needs.length > 0 ? needs.map((n) => NEED_LABELS[n] ?? n).join(" · ") : "No specific needs"}
          />
          <SummaryLine styles={styles} label="THIS WEEK" value={`${cookingNightsPerWeek} dinners`} last />
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="Show me tonight's dinner" onPress={next} />
      </View>
    </ScreenContainer>
  );
}

type Styles = ReturnType<typeof getStyles>;

function SummaryLine({ styles, label, value, last }: { styles: Styles; label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.sline, last && styles.slineLast]}>
      <Text style={styles.slineLabel}>{label}</Text>
      <Text style={styles.slineValue}>{value}</Text>
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, flex: 1 },
    sprout: { alignItems: "center", paddingVertical: spacing.md },
    summary: { backgroundColor: colors.primaryTint, borderRadius: radius.md, padding: spacing.md + 2 },
    sline: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.sm + 1,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    slineLast: { borderBottomWidth: 0 },
    slineLabel: { fontSize: fontSize.xs, fontFamily: fontFamily.bodyBold, color: colors.textMuted },
    slineValue: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyBold, color: colors.text, flexShrink: 1, textAlign: "right", marginLeft: spacing.md },
    footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  });
}
