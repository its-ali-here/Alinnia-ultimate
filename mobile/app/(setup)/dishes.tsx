import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Button } from "../../components/Button";
import { ScreenContainer } from "../../components/ScreenContainer";
import { SelectTile } from "../../components/SelectTile";
import { StepHeader } from "../../components/StepHeader";
import { useOnboardingDraft } from "../../contexts/OnboardingDraft";
import { useTheme } from "../../contexts/ThemeContext";
import { supabase } from "../../lib/supabase";
import { recipeColor, RECIPE_EMOJI } from "../../lib/foodIcons";
import { fontFamily, fontSize, spacing, type ThemeColors } from "../../lib/theme";

const MIN_SELECTIONS = 5;
const DISPLAY_COUNT = 6;

interface DishOption {
  id: string;
  name: string;
}

export default function Dishes() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { cuisines, favoriteRecipeIds, toggleFavoriteRecipe } = useOnboardingDraft();
  const [dishes, setDishes] = useState<DishOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const picked: DishOption[] = [];
      const seen = new Set<string>();

      // Prefer dishes matching the household's chosen cuisines...
      if (cuisines.length > 0) {
        const { data } = await supabase
          .from("recipes")
          .select("id,name")
          .in("cuisine", cuisines)
          .order("name")
          .limit(DISPLAY_COUNT);
        for (const row of data ?? []) {
          if (!seen.has(row.id)) {
            picked.push(row);
            seen.add(row.id);
          }
        }
      }

      // ...then fill any remaining slots from the general catalog, so this
      // screen always shows a full DISPLAY_COUNT even with zero/narrow
      // cuisine matches (e.g. a cuisine with fewer than 6 seeded recipes).
      if (picked.length < DISPLAY_COUNT) {
        const { data } = await supabase.from("recipes").select("id,name").order("name").limit(DISPLAY_COUNT * 4);
        for (const row of data ?? []) {
          if (picked.length >= DISPLAY_COUNT) break;
          if (!seen.has(row.id)) {
            picked.push(row);
            seen.add(row.id);
          }
        }
      }

      if (!cancelled) {
        setDishes(picked.slice(0, DISPLAY_COUNT));
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [cuisines]);

  function next() {
    router.push("/(setup)/nights");
  }

  return (
    <ScreenContainer>
      <StepHeader step={6} total={8} title="Tap the ones you love" subtitle="Five or more. This is how we learn your kitchen." />

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.grid}>
            {dishes.map((dish) => (
              <SelectTile
                key={dish.id}
                title={dish.name}
                selected={favoriteRecipeIds.includes(dish.id)}
                onPress={() => toggleFavoriteRecipe(dish.id)}
                art={{ emoji: RECIPE_EMOJI, color: recipeColor(dish.id) }}
                style={styles.tile}
              />
            ))}
          </View>
          <Text style={styles.tally}>{favoriteRecipeIds.length} selected · keep going or continue</Text>
        </ScrollView>
      )}

      <View style={styles.footer}>
        <Button title="Continue" onPress={next} disabled={favoriteRecipeIds.length < MIN_SELECTIONS} />
      </View>
    </ScreenContainer>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    loading: { flex: 1, alignItems: "center", justifyContent: "center" },
    content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    tile: { minWidth: "45%" },
    tally: { fontSize: fontSize.xs, fontFamily: fontFamily.bodyBold, color: colors.primary, textAlign: "center", marginTop: spacing.md },
    footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  });
}
