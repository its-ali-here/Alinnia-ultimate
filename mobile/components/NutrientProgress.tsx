import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../lib/theme";
import type { Nutrient } from "../types/database";

interface NutrientProgressProps {
  nutrient: Nutrient;
  consumed: number;
  target: number;
}

export function NutrientProgress({ nutrient, consumed, target }: NutrientProgressProps) {
  const pct = target > 0 ? Math.min(1, consumed / target) : 0;
  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{nutrient.label}</Text>
        <Text style={styles.value}>
          {Math.round(consumed)} / {Math.round(target)} {nutrient.unit}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  labelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs },
  label: { fontSize: 14, fontWeight: "600", color: colors.text },
  value: { fontSize: 13, color: colors.textMuted },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.progressTrack, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: colors.primary, borderRadius: 4 },
});
