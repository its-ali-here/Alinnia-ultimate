import { useEffect, useMemo, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { CatalogThumb } from "../../components/CatalogThumb";
import { CookingModeModal } from "../../components/CookingModeModal";
import { Dropdown } from "../../components/Dropdown";
import { MacroDonut } from "../../components/MacroDonut";
import { Button } from "../../components/Button";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useTheme } from "../../contexts/ThemeContext";
import { getFoodById } from "../../lib/mockFoods";
import { getRecipeById } from "../../lib/mockRecipeDetails";
import { foodColor, foodEmoji, recipeColor, RECIPE_EMOJI } from "../../lib/foodIcons";
import { isPantryStaple } from "../../lib/mealPlanService";
import { supabase } from "../../lib/supabase";
import { fontFamily, fontSize, radius, spacing, type ThemeColors } from "../../lib/theme";

function notImplemented(what: string) {
  Alert.alert("Coming soon", `${what} isn't built yet.`);
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function formatAmount(value: number) {
  return Number.isInteger(value) ? String(value) : String(round2(value));
}

interface DetailIngredient {
  foodId: string;
  name: string;
  variant?: string;
  imageUrl: string | null;
  emoji: string;
  color: string;
  amount: number;
  unit: string;
  gramWeight: number;
}

interface RecipeDetailData {
  id: string;
  name: string;
  imageUrl: string | null;
  youtubeUrl: string | null;
  emoji: string;
  color: string;
  calories: number;
  carbsG: number;
  fatG: number;
  proteinG: number;
  prepMinutes: number;
  cookMinutes: number;
  prepareServings: number;
  familyMembers: number;
  ingredients: DetailIngredient[];
  directions: string[];
  description: string | null;
}

// Recipes created via the Supabase seed data (scripts/seed-data/recipes.json) live in
// the `recipes` + `recipe_foods` tables. Planner now generates real DB recipe ids, but
// this mock fallback stays as a defensive no-op for any leftover string ids like
// "omelet" that only exist in mockRecipeDetails.
async function fetchRecipe(id: string): Promise<RecipeDetailData | null> {
  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("id,name,description,servings,prep_minutes,cook_minutes,calories_per_serving,protein_g_per_serving,carbs_g_per_serving,fat_g_per_serving,image_url,youtube_url,directions")
    .eq("id", id)
    .maybeSingle();

  if (!error && recipe) {
    const { data: recipeFoods } = await supabase
      .from("recipe_foods")
      .select("quantity,unit,sort_order,food:foods(id,name,category,image_url)")
      .eq("recipe_id", id)
      .order("sort_order");

    const ingredients: DetailIngredient[] = (recipeFoods ?? []).map((rf: any) => ({
      foodId: rf.food.id,
      name: rf.food.name,
      imageUrl: rf.food.image_url,
      emoji: foodEmoji(rf.food.category),
      color: foodColor(rf.food.category),
      amount: rf.quantity,
      unit: rf.unit,
      gramWeight: rf.quantity,
    }));

    return {
      id: recipe.id,
      name: recipe.name,
      imageUrl: recipe.image_url,
      youtubeUrl: recipe.youtube_url ?? null,
      emoji: RECIPE_EMOJI,
      color: recipeColor(recipe.id),
      calories: recipe.calories_per_serving,
      carbsG: recipe.carbs_g_per_serving ?? 0,
      fatG: recipe.fat_g_per_serving ?? 0,
      proteinG: recipe.protein_g_per_serving ?? 0,
      prepMinutes: recipe.prep_minutes ?? 0,
      cookMinutes: recipe.cook_minutes ?? 0,
      prepareServings: Math.round(recipe.servings) || 1,
      familyMembers: 0,
      ingredients,
      directions: recipe.directions ?? [],
      description: recipe.description,
    };
  }

  const mock = getRecipeById(id);
  if (!mock) return null;
  return {
    id: mock.id,
    name: mock.name,
    imageUrl: null,
    youtubeUrl: null,
    emoji: mock.emoji,
    color: mock.color,
    calories: mock.calories,
    carbsG: mock.carbsG,
    fatG: mock.fatG,
    proteinG: mock.proteinG,
    prepMinutes: mock.prepMinutes,
    cookMinutes: mock.cookMinutes,
    prepareServings: mock.prepareServings,
    familyMembers: mock.familyMembers,
    ingredients: mock.ingredients.map((ing) => {
      const food = getFoodById(ing.foodId);
      return {
        foodId: ing.foodId,
        name: food?.name ?? ing.foodId,
        variant: food?.variant,
        imageUrl: null,
        emoji: food?.emoji ?? "🍽️",
        color: food?.color ?? "#EDEBD9",
        amount: ing.amount,
        unit: ing.unit,
        gramWeight: ing.gramWeight,
      };
    }),
    directions: mock.directions,
    description: null,
  };
}

export default function RecipeDetail() {
  const { colors, preference } = useTheme();
  const styles = getStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipe, setRecipe] = useState<RecipeDetailData | null | undefined>(undefined);
  const [prepareServings, setPrepareServings] = useState(1);
  const [hideStaples, setHideStaples] = useState(false);
  const [cookingModeVisible, setCookingModeVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setRecipe(undefined);
    fetchRecipe(id).then((result) => {
      if (cancelled) return;
      setRecipe(result);
      if (result) setPrepareServings(result.prepareServings);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const prepareOptions = useMemo(() => {
    if (!recipe) return [];
    const values = Array.from(new Set([1, 2, recipe.prepareServings, recipe.prepareServings * 2, 8])).sort((a, b) => a - b);
    return values.map((n) => ({ label: `${n} ${n === 1 ? "serving" : "servings"}`, value: String(n) }));
  }, [recipe]);

  if (recipe === undefined) {
    return (
      <ScreenContainer style={styles.container}>
        <Text style={styles.missing}>Loading…</Text>
      </ScreenContainer>
    );
  }

  if (recipe === null) {
    return (
      <ScreenContainer style={styles.container}>
        <Text style={styles.missing}>Recipe not found.</Text>
      </ScreenContainer>
    );
  }

  const scaleFactor = prepareServings / recipe.prepareServings;
  const calories = Math.round(recipe.calories);
  const carbsG = Math.round(recipe.carbsG);
  const fatG = Math.round(recipe.fatG);
  const proteinG = Math.round(recipe.proteinG);

  function openYouTubeCookingVideo() {
    if (!recipe) return;
    const youtubeUrl =
      recipe.youtubeUrl && recipe.youtubeUrl.startsWith("http")
        ? recipe.youtubeUrl
        : `https://www.youtube.com/results?search_query=${encodeURIComponent(
            `${recipe.name} recipe`
          )}`;
    Linking.openURL(youtubeUrl).catch(() => {
      Alert.alert("Unable to open YouTube", "Please check your internet connection.");
    });
  }

  async function handleShareRecipe() {
    if (!recipe) return;
    const text =
      `🍛 *${recipe.name}* (${recipe.calories} kcal per serving)\n\n` +
      `Ingredients for ${prepareServings} servings:\n` +
      recipe.ingredients
        .map((i) => `• ${i.name}: ${formatAmount(round2(i.amount * scaleFactor))} ${i.unit}`)
        .join("\n") +
      `\n\n✨ Planned with Mealinnia`;

    try {
      await Share.share({ message: text, title: recipe.name });
    } catch (e: any) {
      console.warn("Share error:", e);
    }
  }

  const displayedIngredients = hideStaples
    ? recipe.ingredients.filter((i) => !isPantryStaple(i.name, null))
    : recipe.ingredients;

  return (
    <ScreenContainer style={styles.container} topSpacing={spacing.sm}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {recipe.name}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          {recipe.imageUrl ? (
            <Image source={{ uri: recipe.imageUrl }} style={styles.heroGradient} contentFit="cover" transition={150} />
          ) : (
            <LinearGradient colors={[recipe.color, colors.surfaceAlt]} style={styles.heroGradient}>
              <Text style={styles.heroEmoji}>{recipe.emoji}</Text>
            </LinearGradient>
          )}
          <Pressable style={styles.heroButtonShare} onPress={handleShareRecipe} hitSlop={8}>
            <Ionicons name="share-outline" size={18} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.timeRow}>
          <View style={styles.timeItem}>
            <Ionicons name="restaurant-outline" size={16} color={colors.textMuted} />
            <Text style={styles.timeText}>{recipe.prepMinutes} minutes to prep</Text>
          </View>
          <View style={styles.timeItem}>
            <Ionicons name="flame-outline" size={16} color={colors.textMuted} />
            <Text style={styles.timeText}>{recipe.cookMinutes} minutes to cook</Text>
          </View>
        </View>

        {/* YouTube Video Link Card */}
        <Pressable style={styles.videoCard} onPress={openYouTubeCookingVideo}>
          <View style={styles.videoIconWrap}>
            <Ionicons name="logo-youtube" size={20} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.videoTitle}>Watch Cooking Video</Text>
            <Text style={styles.videoSubtitle}>Search recipes & step-by-step videos on YouTube</Text>
          </View>
          <Ionicons name="open-outline" size={18} color={colors.textMuted} />
        </Pressable>

        <View style={styles.divider} />

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Scale recipe for</Text>
          <Dropdown
            options={prepareOptions}
            value={String(prepareServings)}
            onChange={(v: string) => setPrepareServings(Number(v))}
            style={styles.scaleDropdown}
          />
        </View>

        <Text style={styles.familyNote}>
          {recipe.familyMembers > 0
            ? `Scaled to ${prepareServings} servings for you and your household (${recipe.familyMembers} members).`
            : `Scaled to ${prepareServings} servings.`}
        </Text>

        <View style={styles.divider} />

        <Pressable style={styles.summaryRow} onPress={() => notImplemented("Nutrient breakdown")}>
          <MacroDonut
            segments={[
              { value: carbsG * 4, color: colors.carbs },
              { value: fatG * 9, color: colors.fat },
              { value: proteinG * 4, color: colors.protein },
            ]}
          />
          <View style={styles.summaryText}>
            <Text style={styles.summaryCalories}>{calories} Calories / serving</Text>
            <Text style={styles.summaryMacros}>
              {carbsG}g Carbs, {fatG}g Fat, {proteinG}g Protein
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        <View style={styles.divider} />

        {/* ================= COOKING MODE HERO CARD ================= */}
        <View style={styles.cookingHeroCard}>
          <LinearGradient
            colors={
              preference === "dark"
                ? ["rgba(20, 168, 92, 0.18)", "rgba(4, 42, 28, 0.5)"]
                : ["rgba(20, 168, 92, 0.12)", "rgba(255, 194, 51, 0.08)"]
            }
            style={styles.cookingHeroGradient}
          >
            <View style={styles.cookingStageMini}>
              <Text style={styles.cookingStageEmoji}>♨️ 🥄 🍲 🔥</Text>
            </View>

            <Text style={styles.cookingHeroTitle}>Ready to cook tonight?</Text>
            <Text style={styles.cookingHeroSubtitle}>
              Interactive step-by-step guidance with built-in stove timers, ingredient checks, and bhunai tips.
            </Text>

            <View style={styles.cookingStatsRow}>
              <View style={styles.cookingStatChip}>
                <Ionicons name="nutrition-outline" size={14} color={colors.primary} />
                <Text style={styles.cookingStatText}>
                  {recipe.ingredients.length} Fresh Ingredients
                </Text>
              </View>
              <View style={styles.cookingStatChip}>
                <Ionicons name="flame-outline" size={14} color="#F0563E" />
                <Text style={styles.cookingStatText}>
                  {recipe.cookMinutes || 35} mins
                </Text>
              </View>
            </View>

            <Button
              title="Start Cooking Mode 🍳"
              onPress={() => setCookingModeVisible(true)}
              style={styles.startCookingBtn}
            />
          </LinearGradient>
        </View>

        {/* Cooking Mode Interactive Modal */}
        <CookingModeModal
          visible={cookingModeVisible}
          onClose={() => setCookingModeVisible(false)}
          recipeName={recipe.name}
          prepareServings={prepareServings}
          ingredients={displayedIngredients.map((ing) => ({
            ...ing,
            amount: round2(ing.amount * scaleFactor),
          }))}
          directions={recipe.directions}
          cookMinutes={recipe.cookMinutes}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {},
    missing: { color: colors.textMuted, fontFamily: fontFamily.body, fontSize: fontSize.md, textAlign: "center", marginTop: spacing.xxl },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, marginBottom: spacing.md },
    headerTitle: { flex: 1, textAlign: "center", fontSize: fontSize.lg, fontFamily: fontFamily.bodyBold, color: colors.text },
    headerSpacer: { width: 26 },
    content: { paddingBottom: spacing.xxl },
    hero: { marginHorizontal: spacing.lg, marginBottom: spacing.sm },
    heroGradient: { height: 220, borderRadius: radius.lg, alignItems: "center", justifyContent: "center", overflow: "hidden" },
    heroEmoji: { fontSize: 72 },
    heroButtonShare: {
      position: "absolute", top: spacing.md, right: spacing.md, width: 36, height: 36, borderRadius: 18,
      backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center",
    },
    timeRow: { flexDirection: "row", gap: spacing.xl, paddingHorizontal: spacing.lg, marginTop: spacing.xs, marginBottom: spacing.sm },
    timeItem: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
    timeText: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: colors.textMuted },
    videoCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginHorizontal: spacing.lg,
      marginTop: spacing.xs,
      marginBottom: spacing.xs,
      padding: spacing.md,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    videoIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "#FF0000",
      alignItems: "center",
      justifyContent: "center",
    },
    videoTitle: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyBold, color: colors.text },
    videoSubtitle: { fontSize: fontSize.xs, fontFamily: fontFamily.body, color: colors.textMuted, marginTop: 1 },
    divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.lg, marginVertical: spacing.md },
    fieldRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, marginBottom: spacing.xs },
    fieldLabel: { fontSize: fontSize.md, fontFamily: fontFamily.bodyMedium, color: colors.text },
    scaleDropdown: { minWidth: 180 },
    familyNote: { fontSize: fontSize.xs, fontFamily: fontFamily.body, color: colors.textMuted, paddingHorizontal: spacing.lg, marginTop: 4, lineHeight: 18 },
    summaryRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg },
    summaryText: { flex: 1 },
    summaryCalories: { fontSize: fontSize.md, fontFamily: fontFamily.bodyBold, color: colors.text },
    summaryMacros: { fontSize: fontSize.xs, fontFamily: fontFamily.body, color: colors.textMuted, marginTop: 2 },
    // Cooking Hero Card
    cookingHeroCard: {
      marginHorizontal: spacing.lg,
      marginTop: spacing.xs,
      marginBottom: spacing.xxl,
      borderRadius: radius.lg,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    cookingHeroGradient: {
      padding: spacing.lg,
      alignItems: "center",
    },
    cookingStageMini: {
      marginBottom: spacing.xs,
    },
    cookingStageEmoji: {
      fontSize: 32,
      letterSpacing: 6,
    },
    cookingHeroTitle: {
      fontSize: fontSize.lg,
      fontFamily: fontFamily.displayBold,
      color: colors.text,
      textAlign: "center",
      marginTop: 4,
    },
    cookingHeroSubtitle: {
      fontSize: fontSize.xs,
      fontFamily: fontFamily.bodyMedium,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: 4,
      lineHeight: 18,
      paddingHorizontal: spacing.sm,
    },
    cookingStatsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginVertical: spacing.md,
    },
    cookingStatChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: radius.pill,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cookingStatText: {
      fontSize: 11,
      fontFamily: fontFamily.bodyBold,
      color: colors.text,
    },
    startCookingBtn: {
      alignSelf: "stretch",
      marginTop: spacing.xs,
    },
  });
}
