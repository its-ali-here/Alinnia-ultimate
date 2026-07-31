import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontFamily, fontSize, spacing } from "../lib/theme";
import type { Nutrient } from "../types/database";

interface NutrientProgressProps {
  nutrient: Nutrient;
  consumed: number;
  target: number;
}

const CATEGORY_ICON: Record<Nutrient["category"], keyof typeof Ionicons.glyphMap> = {
  macro: "flame",
  vitamin: "sunny",
  mineral: "leaf",
};

export function NutrientProgress({ nutrient, consumed, target }: NutrientProgressProps) {
  const pct = target > 0 ? Math.min(1, consumed / target) : 0;
  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <View style={styles.labelWithIcon}>
          <Ionicons name={CATEGORY_ICON[nutrient.category]} size={14} color={colors.primary} />
          <Text style={styles.label}>{nutrient.label}</Text>
        </View>
        <Text style={styles.value}>
          {Math.round(consumed)} / {Math.round(target)} {nutrient.unit}
        </Text>
      </View>
      <View style={styles.track}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${pct * 100}%` }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  labelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
  labelWithIcon: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  label: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyMedium, color: colors.text },
  value: { fontSize: fontSize.xs, fontFamily: fontFamily.body, color: colors.textMuted },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.progressTrack, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 5 },
});
