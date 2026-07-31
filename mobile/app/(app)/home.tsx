import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import {
  fetchNutrients,
  fetchThisWeeksPlan,
  fetchWeekConsumed,
  fetchWeeklyTargets,
  getCurrentWeekStart,
  getNudgeSuggestion,
  type NudgeSuggestion,
  type PlannedDish,
} from "../../lib/suggestions";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { NutrientProgress } from "../../components/NutrientProgress";
import { colors, fontFamily, fontSize, radius, spacing } from "../../lib/theme";
import type { Nutrient } from "../../types/database";

const HEADLINE_NUTRIENT_KEYS = ["calories", "protein_g", "fiber_g", "iron_mg"];
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function todayIndex(): number {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

export default function Home() {
  const { session, profile } = useAuth();
  const [nutrients, setNutrients] = useState<Nutrient[]>([]);
  const [targets, setTargets] = useState<Record<string, number>>({});
  const [consumed, setConsumed] = useState<Record<string, number>>({});
  const [plan, setPlan] = useState<PlannedDish[]>([]);
  const [nudge, setNudge] = useState<NudgeSuggestion | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session || !profile) return;
    setLoading(true);
    const weekStart = getCurrentWeekStart();
    const [n, t, c, p, nudgeResult] = await Promise.all([
      fetchNutrients(),
      fetchWeeklyTargets(session.user.id),
      fetchWeekConsumed(session.user.id, weekStart),
      fetchThisWeeksPlan(session.user.id),
      getNudgeSuggestion(session.user.id, profile),
    ]);
    setNutrients(n);
    setTargets(t);
    setConsumed(c);
    setPlan(p);
    setNudge(nudgeResult);
    setLoading(false);
  }, [session, profile]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const headline = nutrients.filter((n) => HEADLINE_NUTRIENT_KEYS.includes(n.key));
  const setDayIndexes = new Set(plan.map((p) => p.dayIndex));
  const today = todayIndex();
  const nudgeNutrientLabel = nudge ? nutrients.find((n) => n.id === nudge.nutrientId)?.label : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Cooking for {profile?.household_size ?? "—"} this week</Text>

      <View style={styles.weekRow}>
        {DAY_LABELS.map((label, i) => {
          const isToday = i === today;
          const isSet = setDayIndexes.has(i);
          return (
            <View key={i} style={styles.dayColumn}>
              <Text style={styles.dayLabel}>{label}</Text>
              <View style={[styles.dayPill, isToday ? styles.dayPillToday : isSet ? styles.dayPillSet : null]} />
            </View>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <Card>
          {headline.map((n) => (
            <NutrientProgress
              key={n.id}
              nutrient={n}
              consumed={consumed[n.id] ?? 0}
              target={targets[n.id] ?? 0}
            />
          ))}
        </Card>
      )}

      {nudge && nudgeNutrientLabel ? (
        <Card style={styles.nudgeCard}>
          <Text style={styles.nudgeTitle}>Add something for {nudgeNutrientLabel}</Text>
          <Text style={styles.nudgeBody}>
            {nudge.dish.name} is rich in it — it would close most of that gap for the week.
          </Text>
          <Button title="See suggestion" variant="secondary" onPress={() => router.push("/(app)/suggestion")} />
        </Card>
      ) : null}

      <Button title="Get today's suggestion" icon="restaurant" onPress={() => router.push("/(app)/suggestion")} />
      <View style={{ height: spacing.sm }} />
      <Button title="View full weekly summary" variant="secondary" icon="stats-chart-outline" onPress={() => router.push("/(app)/summary")} />
      <View style={{ height: spacing.xl }} />
      <Button title="Sign out" variant="secondary" icon="log-out-outline" onPress={() => supabase.auth.signOut()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  greeting: { fontSize: fontSize.xl, fontFamily: fontFamily.displayBold, color: colors.text, marginBottom: spacing.lg },
  weekRow: { flexDirection: "row", gap: spacing.xs, marginBottom: spacing.lg },
  dayColumn: { flex: 1, alignItems: "center" },
  dayLabel: { fontSize: fontSize.xs, fontFamily: fontFamily.bodyBold, color: colors.textMuted, marginBottom: spacing.xs },
  dayPill: { width: "100%", height: 36, borderRadius: radius.sm, backgroundColor: colors.progressTrack },
  dayPillSet: { backgroundColor: colors.primary },
  dayPillToday: { backgroundColor: colors.accent },
  nudgeCard: { backgroundColor: colors.primaryTint, borderColor: colors.primaryTint },
  nudgeTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.displayBold, color: colors.text, marginBottom: spacing.xs },
  nudgeBody: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: colors.textMuted, marginBottom: spacing.md, lineHeight: 20 },
});
