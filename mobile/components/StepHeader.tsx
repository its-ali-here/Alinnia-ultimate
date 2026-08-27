import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StepProgress } from "./StepProgress";
import { useTheme } from "../contexts/ThemeContext";
import { fontFamily, fontSize, spacing, type ThemeColors } from "../lib/theme";

interface StepHeaderProps {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export function StepHeader({ step, total, title, subtitle, onBack }: StepHeaderProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Pressable onPress={onBack ?? (() => router.back())} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.stepLabel}>
          {step} of {total}
        </Text>
      </View>
      <StepProgress step={step} total={total} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: { paddingHorizontal: spacing.lg },
    topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
    stepLabel: { fontSize: fontSize.xs, fontFamily: fontFamily.bodyBold, color: colors.textMuted, letterSpacing: 0.5 },
    title: { fontSize: fontSize.xxl, fontFamily: fontFamily.displayBold, color: colors.text, lineHeight: 30 },
    subtitle: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyMedium, color: colors.textMuted, marginTop: 6, lineHeight: 19 },
  });
}
