import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useAuth } from "../../lib/auth";
import { approveDish, getNextSuggestion, rejectDish, type Suggestion } from "../../lib/suggestions";
import { Button } from "../../components/Button";
import { colors, spacing } from "../../lib/theme";
import type { RejectionReason } from "../../types/database";

const REJECTION_REASONS: { key: RejectionReason; label: string }[] = [
  { key: "no_meat", label: "Not in the mood for meat" },
  { key: "too_spicy", label: "Too spicy" },
  { key: "avoid_ingredient", label: "Avoiding an ingredient in this" },
  { key: "not_in_mood", label: "Just not feeling it" },
];

export default function SuggestionScreen() {
  const { session, profile } = useAuth();
  const [suggestion, setSuggestion] = useState<Suggestion | null | undefined>(undefined);
  const [showReasons, setShowReasons] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!session || !profile) return;
    setSuggestion(undefined);
    setShowReasons(false);
    try {
      const next = await getNextSuggestion(session.user.id, profile);
      setSuggestion(next);
    } catch (e) {
      Alert.alert("Couldn't load a suggestion", (e as Error).message);
      setSuggestion(null);
    }
  }, [session, profile]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

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
      await load();
    } catch (e) {
      Alert.alert("Couldn't save that", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (suggestion === undefined) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (suggestion === null) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>No more dishes to suggest right now</Text>
        <Text style={styles.emptyBody}>
          You've gone through everything that fits your preferences this week. Check back next week, or adjust
          your restrictions in settings.
        </Text>
        <Button title="Back home" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  const { dish } = suggestion;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.badgeRow}>
          <Text style={styles.badge}>{dish.contains_meat ? "Meat" : "Vegetarian"}</Text>
          <Text style={styles.badge}>{dish.spice_level}</Text>
        </View>
        <Text style={styles.dishName}>{dish.name}</Text>
        {dish.description ? <Text style={styles.description}>{dish.description}</Text> : null}
      </View>

      {!showReasons ? (
        <>
          <Button title="Looks good" onPress={handleApprove} loading={busy} />
          <View style={{ height: spacing.sm }} />
          <Button title="Not this one" variant="secondary" onPress={() => setShowReasons(true)} disabled={busy} />
        </>
      ) : (
        <View>
          <Text style={styles.reasonPrompt}>What's wrong with it?</Text>
          {REJECTION_REASONS.map((r) => (
            <View key={r.key} style={{ marginBottom: spacing.sm }}>
              <Button title={r.label} variant="secondary" onPress={() => handleReject(r.key)} disabled={busy} />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, backgroundColor: colors.background },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  badgeRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm },
  badge: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
    backgroundColor: colors.progressTrack,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    textTransform: "capitalize",
    overflow: "hidden",
  },
  dishName: { fontSize: 24, fontWeight: "700", color: colors.text, marginBottom: spacing.xs },
  description: { fontSize: 15, color: colors.textMuted, lineHeight: 21 },
  reasonPrompt: { fontSize: 15, fontWeight: "600", color: colors.text, marginBottom: spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.text, textAlign: "center", marginBottom: spacing.sm },
  emptyBody: { fontSize: 14, color: colors.textMuted, textAlign: "center", marginBottom: spacing.lg },
});
