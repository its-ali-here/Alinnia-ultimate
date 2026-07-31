import { useCallback, useRef, useState } from "react";
import { Alert, Animated, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useAuth } from "../../lib/auth";
import {
  approveDish,
  fetchNutrients,
  getNextSuggestion,
  rejectDish,
  type Suggestion,
  type SuggestionFilters,
} from "../../lib/suggestions";
import { Button } from "../../components/Button";
import { OrbitDish, type OrbitChipItem } from "../../components/OrbitDish";
import { colors, fontFamily, fontSize, spacing } from "../../lib/theme";
import type { Nutrient, RejectionReason } from "../../types/database";

const REJECTION_REASONS: { key: RejectionReason; label: string }[] = [
  { key: "no_meat", label: "Not in the mood for meat" },
  { key: "too_spicy", label: "Too spicy" },
  { key: "avoid_ingredient", label: "Avoiding an ingredient in this" },
  { key: "not_in_mood", label: "Just not feeling it" },
];

export default function SuggestionScreen() {
  const { session, profile } = useAuth();
  const [suggestion, setSuggestion] = useState<Suggestion | null | undefined>(undefined);
  const [nutrients, setNutrients] = useState<Nutrient[]>([]);
  const [filters, setFilters] = useState<SuggestionFilters>({});
  const [sessionExcludedIds, setSessionExcludedIds] = useState<string[]>([]);
  const [showReasons, setShowReasons] = useState(false);
  const [busy, setBusy] = useState(false);
  const reasonsFade = useRef(new Animated.Value(0)).current;

  const fetchSuggestion = useCallback(
    async (activeFilters: SuggestionFilters, excludeIds: string[]) => {
      if (!session || !profile) return;
      setSuggestion(undefined);
      setShowReasons(false);
      reasonsFade.setValue(0);
      try {
        const [next, allNutrients] = await Promise.all([
          getNextSuggestion(session.user.id, profile, { filters: activeFilters, excludeDishIds: excludeIds }),
          fetchNutrients(),
        ]);
        setSuggestion(next);
        setNutrients(allNutrients);
      } catch (e) {
        Alert.alert("Couldn't load a suggestion", (e as Error).message);
        setSuggestion(null);
      }
    },
    [session, profile, reasonsFade]
  );

  useFocusEffect(
    useCallback(() => {
      if (!profile) return;
      const seeded: SuggestionFilters = { avoid_meat: profile.avoid_meat, avoid_spicy: profile.avoid_spicy };
      setFilters(seeded);
      setSessionExcludedIds([]);
      fetchSuggestion(seeded, []);
    }, [profile, fetchSuggestion])
  );

  function toggleFilter(key: keyof SuggestionFilters) {
    const next = { ...filters, [key]: !filters[key] };
    setFilters(next);
    fetchSuggestion(next, sessionExcludedIds);
  }

  function handleSurpriseMe() {
    if (!suggestion) return;
    const nextExcluded = [...sessionExcludedIds, suggestion.dish.id];
    setSessionExcludedIds(nextExcluded);
    fetchSuggestion(filters, nextExcluded);
  }

  function revealReasons() {
    setShowReasons(true);
    Animated.timing(reasonsFade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }

  async function handleApprove() {
    if (!session || !profile || !suggestion) return;
    setBusy(true);
    try {
      await approveDish(session.user.id, suggestion.dish.id, profile.household_size);
      router.replace({
        pathname: "/(app)/ingredients",
        params: { dishId: suggestion.dish.id, servings: String(profile.household_size) },
      });
    } catch (e) {
      Alert.alert("Couldn't save that", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleReject(reason: RejectionReason) {
    if (!session || !suggestion) return;
    setBusy(true);
    try {
      await rejectDish(session.user.id, suggestion.dish.id, reason);
      await fetchSuggestion(filters, sessionExcludedIds);
    } catch (e) {
      Alert.alert("Couldn't save that", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const fetching = suggestion === undefined;
  const nutrientById = new Map(nutrients.map((n) => [n.id, n]));

  const filterChips: OrbitChipItem[] = [
    {
      label: "No meat",
      icon: "paw",
      tone: "primary",
      active: !!filters.avoid_meat,
      onPress: () => toggleFilter("avoid_meat"),
      disabled: fetching,
    },
    {
      label: "Mild only",
      icon: "flame",
      tone: "accent",
      active: !!filters.avoid_spicy,
      onPress: () => toggleFilter("avoid_spicy"),
      disabled: fetching,
    },
    {
      label: "Surprise me",
      icon: "shuffle",
      tone: "primary",
      active: false,
      onPress: handleSurpriseMe,
      disabled: fetching || !suggestion,
    },
  ];

  const isFiltered =
    filters.avoid_meat !== profile?.avoid_meat || filters.avoid_spicy !== profile?.avoid_spicy || sessionExcludedIds.length > 0;

  const medallionName = fetching ? "Finding a dish…" : suggestion === null ? "No matches" : suggestion.dish.name;
  const medallionIcon = suggestion && suggestion !== null ? (suggestion.dish.contains_meat ? "restaurant" : "leaf") : "search";

  const topLabels = suggestion
    ? suggestion.topNutrientIds
        .slice(0, 2)
        .map((id) => nutrientById.get(id)?.label)
        .filter((label): label is string => !!label)
    : [];
  const extras = [filters.avoid_meat && "it's meat-free", filters.avoid_spicy && "it's mild"].filter(Boolean) as string[];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <OrbitDish dishName={medallionName} icon={medallionIcon} chips={filterChips} loading={fetching} />

      {suggestion === null ? (
        <View style={styles.emptyBlock}>
          <Text style={styles.emptyTitle}>No more dishes to suggest right now</Text>
          <Text style={styles.emptyBody}>
            {isFiltered
              ? "No dishes match that combination — try loosening a filter above."
              : "You've gone through everything that fits your preferences this week. Check back next week, or adjust your restrictions in settings."}
          </Text>
          <Button title="Back home" variant="secondary" onPress={() => router.back()} />
        </View>
      ) : suggestion ? (
        <>
          {topLabels.length > 0 ? (
            <Text style={styles.why}>
              Covers the{" "}
              <Text style={styles.whyBold}>{topLabels.length === 1 ? topLabels[0] : `${topLabels[0]} and ${topLabels[1]}`}</Text>{" "}
              your week is short on
              {extras.length > 0 ? (
                <>
                  {" "}
                  — and <Text style={styles.whyBold}>{extras.join(" and ")}</Text>, like you asked.
                </>
              ) : (
                "."
              )}
            </Text>
          ) : null}
          {suggestion.dish.description ? <Text style={styles.description}>{suggestion.dish.description}</Text> : null}

          {!showReasons ? (
            <View style={styles.actions}>
              <Button title="Cook this" icon="checkmark-circle" onPress={handleApprove} loading={busy} />
              <View style={{ height: spacing.sm }} />
              <Button title="Show another" icon="refresh" variant="secondary" onPress={revealReasons} disabled={busy} />
            </View>
          ) : (
            <Animated.View style={[styles.actions, { opacity: reasonsFade }]}>
              <Text style={styles.reasonPrompt}>What's wrong with it?</Text>
              {REJECTION_REASONS.map((r) => (
                <View key={r.key} style={{ marginBottom: spacing.sm }}>
                  <Button title={r.label} variant="secondary" onPress={() => handleReject(r.key)} disabled={busy} />
                </View>
              ))}
            </Animated.View>
          )}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, alignItems: "center" },
  why: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.bodyMedium,
    color: colors.text,
    textAlign: "center",
    lineHeight: 21,
    marginTop: spacing.lg,
  },
  whyBold: { fontFamily: fontFamily.bodyBold, color: colors.primaryDark },
  description: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.body,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 19,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  actions: { width: "100%", marginTop: spacing.lg },
  reasonPrompt: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.bodyMedium,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  emptyBlock: { width: "100%", marginTop: spacing.lg, alignItems: "center" },
  emptyTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.displayBold, color: colors.text, textAlign: "center", marginBottom: spacing.sm },
  emptyBody: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: colors.textMuted, textAlign: "center", marginBottom: spacing.lg },
});
