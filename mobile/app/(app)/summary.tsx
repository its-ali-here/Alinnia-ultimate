import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useAuth } from "../../lib/auth";
import {
  fetchNutrients,
  fetchThisWeeksPlan,
  fetchWeekConsumed,
  fetchWeeklyTargets,
  getCurrentWeekStart,
  type PlannedDish,
} from "../../lib/suggestions";
import { Card } from "../../components/Card";
import { NutrientProgress } from "../../components/NutrientProgress";
import { colors, fontFamily, fontSize, spacing } from "../../lib/theme";
import type { Nutrient } from "../../types/database";

export default function Summary() {
  const { session } = useAuth();
  const [nutrients, setNutrients] = useState<Nutrient[]>([]);
  const [targets, setTargets] = useState<Record<string, number>>({});
  const [consumed, setConsumed] = useState<Record<string, number>>({});
  const [plan, setPlan] = useState<PlannedDish[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const weekStart = getCurrentWeekStart();
    const [n, t, c, p] = await Promise.all([
      fetchNutrients(),
      fetchWeeklyTargets(session.user.id),
      fetchWeekConsumed(session.user.id, weekStart),
      fetchThisWeeksPlan(session.user.id),
    ]);
    setNutrients(n);
    setTargets(t);
    setConsumed(c);
    setPlan(p);
    setLoading(false);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionHeading}>This week's dishes</Text>
      <Card>
        {plan.length === 0 ? (
          <Text style={styles.muted}>Nothing logged yet this week.</Text>
        ) : (
          plan.map((p, idx) => (
            <View key={`${p.dishId}-${idx}`} style={styles.planRow}>
              <Text style={styles.planName}>{p.name}</Text>
              <Text style={styles.muted}>{p.servings} servings</Text>
            </View>
          ))
        )}
      </Card>

      <Text style={styles.sectionHeading}>Nutrient progress</Text>
      <Card>
        {nutrients.map((n) => (
          <NutrientProgress key={n.id} nutrient={n} consumed={consumed[n.id] ?? 0} target={targets[n.id] ?? 0} />
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  sectionHeading: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyMedium, color: colors.text, marginBottom: spacing.sm },
  planRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  planName: { fontSize: fontSize.md, fontFamily: fontFamily.bodyMedium, color: colors.text },
  muted: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: colors.textMuted },
});
