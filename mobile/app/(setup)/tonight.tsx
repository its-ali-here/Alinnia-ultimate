import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Button } from "../../components/Button";
import { OrbitDish, type OrbitChipItem } from "../../components/OrbitDish";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useOnboardingDraft } from "../../contexts/OnboardingDraft";
import { useTheme } from "../../contexts/ThemeContext";
import {
  applyMoodFilters,
  DEFAULT_MOOD_FILTERS,
  explainMatch,
  fetchDinnerCandidates,
  getMeatRecipeIds,
  pickCandidate,
  type DinnerCandidate,
  type MoodFilters,
} from "../../lib/dishDecider";
import { fontFamily, fontSize, spacing, type ThemeColors } from "../../lib/theme";

export default function Tonight() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { cuisines, avoids, favoriteRecipeIds } = useOnboardingDraft();
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<DinnerCandidate[]>([]);
  const [meatRecipeIds, setMeatRecipeIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<MoodFilters>(DEFAULT_MOOD_FILTERS);
  const [current, setCurrent] = useState<DinnerCandidate | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [fetched, meatIds] = await Promise.all([
        fetchDinnerCandidates({ cuisines, avoids, favoriteRecipeIds }),
        getMeatRecipeIds(),
      ]);
      if (cancelled) return;
      setCandidates(fetched);
      setMeatRecipeIds(meatIds);
      const pool = applyMoodFilters(fetched, DEFAULT_MOOD_FILTERS, meatIds);
      setCurrent(pickCandidate(pool));
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pool = useMemo(() => applyMoodFilters(candidates, filters, meatRecipeIds), [candidates, filters, meatRecipeIds]);

  function toggleFilter(key: keyof MoodFilters) {
    const next = { ...filters, [key]: !filters[key] };
    setFilters(next);
    const nextPool = applyMoodFilters(candidates, next, meatRecipeIds);
    setCurrent(pickCandidate(nextPool, current ? new Set([current.id]) : undefined));
  }

  function showAnother() {
    setCurrent(pickCandidate(pool, current ? new Set([current.id]) : undefined));
  }

  function cookThis() {
    router.push("/(setup)/save");
  }

  const chips: OrbitChipItem[] = [
    { label: "No meat", icon: "leaf-outline", active: filters.noMeat, onPress: () => toggleFilter("noMeat") },
    { label: "Quick", icon: "flash-outline", active: filters.quick, onPress: () => toggleFilter("quick") },
    { label: "Light", icon: "sunny-outline", active: filters.light, onPress: () => toggleFilter("light") },
  ];

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>What sounds good?</Text>
        <Text style={styles.subtitle}>Tap a bubble to nudge it.</Text>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : current ? (
        <>
          <OrbitDish dishName={current.name} icon="restaurant-outline" chips={chips} />
          <Text style={styles.why}>{explainMatch(current, filters)}</Text>
        </>
      ) : (
        <View style={styles.loading}>
          <Text style={styles.empty}>Nothing matches that combination yet — try turning a bubble off.</Text>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.pair}>
          <Button title="Show another" variant="secondary" onPress={showAnother} disabled={!current} style={styles.pairButton} />
          <Button title="Cook this" onPress={cookThis} disabled={!current} style={styles.pairButton} />
        </View>
      </View>
    </ScreenContainer>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    header: { paddingHorizontal: spacing.lg, alignItems: "center", marginBottom: spacing.md },
    title: { fontSize: fontSize.xxl, fontFamily: fontFamily.displayBold, color: colors.text },
    subtitle: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyMedium, color: colors.textMuted, marginTop: 4 },
    loading: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl },
    empty: { fontSize: fontSize.md, fontFamily: fontFamily.bodyMedium, color: colors.textMuted, textAlign: "center" },
    why: {
      fontSize: fontSize.sm,
      fontFamily: fontFamily.bodyMedium,
      color: colors.textMuted,
      textAlign: "center",
      paddingHorizontal: spacing.xl,
      marginTop: spacing.sm,
    },
    footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, marginTop: "auto" },
    pair: { flexDirection: "row", gap: spacing.sm },
    pairButton: { flex: 1 },
  });
}
