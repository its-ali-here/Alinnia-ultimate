import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/Button";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useOnboardingDraft } from "../../contexts/OnboardingDraft";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import { getPricingForCuisines } from "../../lib/pricingData";
import { fontFamily, fontSize, radius, spacing, type ThemeColors } from "../../lib/theme";

const NEED_HEADLINES: Record<string, string> = {
  diabetic: "Plan around a diabetic diet?",
  pregnant: "Plan around a pregnancy-safe diet?",
  training_hard: "Plan around someone training hard?",
  fussy_eater: "Plan around a fussy eater?",
  high_blood_pressure: "Plan around high blood pressure?",
};

export default function Trial() {
  const { colors, mode } = useTheme();
  // The promo card is always a deliberately dark/elevated card, in both app
  // themes — in dark mode that's just the theme's own surface/text; in light
  // mode it borrows the theme's dark-green text color as a stand-in "dark
  // surface" (the same one-off inversion Welcome's hero uses).
  const cardBg = mode === "dark" ? colors.surface : colors.text;
  const cardFg = mode === "dark" ? colors.text : colors.background;
  const cardMuted = mode === "dark" ? colors.textMuted : "rgba(251,250,242,0.68)";
  const styles = getStyles(colors, cardBg, cardFg, cardMuted);

  const draft = useOnboardingDraft();
  const { reset } = draft;
  const { refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const headline = draft.needs.length > 0 ? NEED_HEADLINES[draft.needs[0]] ?? "Plan around your household's needs?" : "Never plan alone again";

  async function finish() {
    setLoading(true);
    const { error } = await supabase.rpc("complete_onboarding_v3", {
      p_payload: {
        cuisines: draft.cuisines,
        adults_count: draft.adultsCount,
        children_count: draft.childrenCount,
        household_needs: draft.needs,
        who_cooks: draft.whoCooks || null,
        avoids: draft.avoids,
        spice_level: draft.spiceLevel,
        favorite_recipe_ids: draft.favoriteRecipeIds,
        cooking_nights_per_week: draft.cookingNightsPerWeek,
        reminders_enabled: draft.remindersEnabled,
      },
    });
    setLoading(false);

    if (error) {
      Alert.alert("Almost done", error.message);
      return;
    }

    reset();
    await refreshProfile();
  }

  const pricing = getPricingForCuisines(draft.cuisines);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconBadge}>
          <Ionicons name="sparkles-outline" size={26} color={colors.primary} />
        </View>
        <Text style={styles.title}>{headline}</Text>
        <Text style={styles.subtitle}>
          {draft.needs.length > 0
            ? "You told us it matters. Premium plans every dinner around it, automatically."
            : "Alinnia Premium remembers your pantry, tracks your budget, and spots what your household actually eats."}
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Household profiles</Text>
          <Text style={styles.cardBody}>
            Set up a profile for anyone with specific needs, and every dinner we suggest will work for them — without
            cooking a separate meal.
          </Text>
          <Text style={styles.cardAlso}>ALSO: PANTRY MEMORY · BUDGET · TRENDS</Text>
        </View>

        <View style={styles.callout}>
          <Text style={styles.calloutText}>
            Free for 3 days, then <Text style={styles.calloutStrong}>{pricing.annualPrice}/year</Text>. Cancel any time — dinners stay
            free forever.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Try it free" onPress={finish} loading={loading} />
        <Pressable onPress={finish} disabled={loading} hitSlop={8}>
          {loading ? <ActivityIndicator color={colors.textMuted} /> : <Text style={styles.skip}>Maybe later</Text>}
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

function getStyles(colors: ThemeColors, cardBg: string, cardFg: string, cardMuted: string) {
  return StyleSheet.create({
    content: { paddingHorizontal: spacing.lg, paddingTop: spacing.xxl, alignItems: "center", paddingBottom: spacing.xl },
    iconBadge: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primaryTint,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
    },
    title: { fontSize: fontSize.xl, fontFamily: fontFamily.displayBold, color: colors.text, textAlign: "center" },
    subtitle: {
      fontSize: fontSize.sm,
      fontFamily: fontFamily.bodyMedium,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: spacing.sm,
      lineHeight: 20,
    },
    card: { alignSelf: "stretch", backgroundColor: cardBg, borderRadius: radius.md, padding: spacing.md + 1, marginTop: spacing.xl },
    cardTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.displayBold, color: cardFg },
    cardBody: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyMedium, color: cardMuted, marginTop: 6, lineHeight: 20 },
    cardAlso: { fontSize: fontSize.xs, fontFamily: fontFamily.bodyBold, color: colors.sprout, letterSpacing: 0.5, marginTop: spacing.md },
    callout: { alignSelf: "stretch", backgroundColor: colors.primaryTint, borderRadius: radius.sm, padding: spacing.md, marginTop: spacing.md },
    calloutText: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyMedium, color: colors.text, textAlign: "center", lineHeight: 20 },
    calloutStrong: { fontFamily: fontFamily.bodyBold },
    footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, alignItems: "center", gap: spacing.md },
    skip: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyBold, color: colors.textMuted },
  });
}
