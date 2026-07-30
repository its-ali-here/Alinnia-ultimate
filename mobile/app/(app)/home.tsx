import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { fetchNutrients, fetchWeekConsumed, fetchWeeklyTargets, getCurrentWeekStart } from "../../lib/suggestions";
import { Button } from "../../components/Button";
import { NutrientProgress } from "../../components/NutrientProgress";
import { colors, spacing } from "../../lib/theme";
import type { Nutrient } from "../../types/database";

const HEADLINE_NUTRIENT_KEYS = ["calories", "protein_g", "fiber_g", "iron_mg"];

export default function Home() {
  const { session, profile } = useAuth();
  const [nutrients, setNutrients] = useState<Nutrient[]>([]);
  const [targets, setTargets] = useState<Record<string, number>>({});
  const [consumed, setConsumed] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const weekStart = getCurrentWeekStart();
    const [n, t, c] = await Promise.all([
      fetchNutrients(),
      fetchWeeklyTargets(session.user.id),
      fetchWeekConsumed(session.user.id, weekStart),
    ]);
    setNutrients(n);
    setTargets(t);
    setConsumed(c);
    setLoading(false);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const headline = nutrients.filter((n) => HEADLINE_NUTRIENT_KEYS.includes(n.key));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Cooking for {profile?.household_size ?? "—"} this week</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} />
      ) : (
        <View style={styles.card}>
          {headline.map((n) => (
            <NutrientProgress
              key={n.id}
              nutrient={n}
              consumed={consumed[n.id] ?? 0}
              target={targets[n.id] ?? 0}
            />
          ))}
        </View>
      )}

      <Button title="Get today's suggestion" onPress={() => router.push("/(app)/suggestion")} />
      <View style={{ height: spacing.sm }} />
      <Button title="View full weekly summary" variant="secondary" onPress={() => router.push("/(app)/summary")} />
      <View style={{ height: spacing.xl }} />
      <Button title="Sign out" variant="secondary" onPress={() => supabase.auth.signOut()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  greeting: { fontSize: 18, fontWeight: "600", color: colors.text, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
});
