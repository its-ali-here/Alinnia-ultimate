import { useEffect, useState } from "react";
import { Alert, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { CreateRow, SearchResultRow } from "../components/SearchResultRow";
import { ScreenContainer } from "../components/ScreenContainer";
import { UnderlineTabs } from "../components/UnderlineTabs";
import { useTheme } from "../contexts/ThemeContext";
import { fontFamily, fontSize, radius, spacing, type ThemeColors } from "../lib/theme";
import { supabase } from "../lib/supabase";
import { foodColor, foodEmoji, recipeColor, RECIPE_EMOJI } from "../lib/foodIcons";
import type { Food, Recipe } from "../types/database";

type MainTab = "all" | "recipes" | "ingredients";
type RecipesTab = "featured" | "mine";
type IngredientsTab = "featured" | "mine";

type RecipeRow = Pick<Recipe, "id" | "name" | "calories_per_serving" | "image_url">;
type FoodRow = Pick<Food, "id" | "name" | "source" | "category" | "calories_per_serving" | "image_url">;

const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "recipes", label: "Recipes" },
  { key: "ingredients", label: "Ingredients" },
];

function notImplemented(what: string) {
  Alert.alert("Coming soon", `${what} isn't built yet.`);
}

function matches(query: string, name: string) {
  return name.toLowerCase().includes(query.trim().toLowerCase());
}

export default function Search() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [mainTab, setMainTab] = useState<MainTab>("all");
  const [recipesTab, setRecipesTab] = useState<RecipesTab>("featured");
  const [ingredientsTab, setIngredientsTab] = useState<IngredientsTab>("featured");
  const [query, setQuery] = useState("");

  const [allRecipes, setAllRecipes] = useState<RecipeRow[]>([]);
  const [allFoods, setAllFoods] = useState<FoodRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [recipesRes, foodsRes] = await Promise.all([
        supabase.from("recipes").select("id,name,calories_per_serving,image_url").order("name"),
        supabase.from("foods").select("id,name,source,category,calories_per_serving,image_url").order("name"),
      ]);
      if (cancelled) return;
      const err = recipesRes.error ?? foodsRes.error;
      if (err) {
        setLoadError(err.message);
      } else {
        setAllRecipes(recipesRes.data ?? []);
        setAllFoods(foodsRes.data ?? []);
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const recipes = allRecipes.filter((r) => matches(query, r.name));
  const ingredients = allFoods.filter((f) => matches(query, f.name));

  const showFunnel = mainTab === "all";
  const showBarcode = mainTab === "all" || mainTab === "ingredients";

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.mainTabsRow}>
          {MAIN_TABS.map((tab) => (
            <Pressable key={tab.key} onPress={() => setMainTab(tab.key)}>
              <Text style={[styles.mainTabLabel, mainTab === tab.key && styles.mainTabLabelActive]}>{tab.label}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={26} color={colors.text} />
        </Pressable>
      </View>

      {mainTab === "recipes" ? (
        <View style={styles.subTabsWrap}>
          <UnderlineTabs
            tabs={[
              { key: "featured", label: "Featured" },
              { key: "mine", label: "My Recipes" },
            ]}
            activeKey={recipesTab}
            onChange={(k) => setRecipesTab(k as RecipesTab)}
          />
        </View>
      ) : null}

      {mainTab === "ingredients" ? (
        <View style={styles.subTabsWrap}>
          <UnderlineTabs
            tabs={[
              { key: "featured", label: "Featured" },
              { key: "mine", label: "My Ingredients" },
            ]}
            activeKey={ingredientsTab}
            onChange={(k) => setIngredientsTab(k as IngredientsTab)}
          />
        </View>
      ) : null}

      <View style={styles.searchBarRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </View>
        {showFunnel ? (
          <Pressable onPress={() => notImplemented("Filters")} hitSlop={8}>
            <Ionicons name="filter" size={22} color={colors.text} />
          </Pressable>
        ) : null}
        {showBarcode ? (
          <Pressable onPress={() => notImplemented("Barcode scanning")} hitSlop={8}>
            <Ionicons name="barcode-outline" size={22} color={colors.text} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
        {loadError ? <EmptyState styles={styles} text={`Couldn't load: ${loadError}`} /> : null}
        {!loadError && loading ? <EmptyState styles={styles} text="Loading…" /> : null}

        {!loading && !loadError && mainTab === "all" ? (
          <>
            <CreateRow label="Create recipe or ingredient" onPress={() => notImplemented("Creating a recipe or ingredient")} />
            {recipes.map((r) => (
              <SearchResultRow
                key={r.id}
                imageUrl={r.image_url}
                emoji={RECIPE_EMOJI}
                color={recipeColor(r.id)}
                title={r.name}
                subtitleLines={[`${Math.round(r.calories_per_serving)} Cal per serving`]}
                onAdd={() => notImplemented(`Adding ${r.name}`)}
                onPress={() => router.push(`/recipe/${r.id}`)}
              />
            ))}
            {ingredients.map((f) => (
              <SearchResultRow
                key={f.id}
                imageUrl={f.image_url}
                emoji={foodEmoji(f.category)}
                color={foodColor(f.category)}
                title={f.name}
                subtitleLines={[`${Math.round(f.calories_per_serving)} Cal per serving`]}
                onAdd={() => notImplemented(`Adding ${f.name}`)}
                onPress={() => router.push(`/food/${f.id}`)}
              />
            ))}
          </>
        ) : null}

        {!loading && !loadError && mainTab === "recipes" ? (
          recipesTab === "featured" ? (
            <>
              <CreateRow label="Create recipe" onPress={() => notImplemented("Creating a recipe")} />
              {recipes.map((r) => (
                <SearchResultRow
                  key={r.id}
                  imageUrl={r.image_url}
                  emoji={RECIPE_EMOJI}
                  color={recipeColor(r.id)}
                  title={r.name}
                  subtitleLines={[`${Math.round(r.calories_per_serving)} Cal per serving`]}
                  onAdd={() => notImplemented(`Adding ${r.name}`)}
                  onPress={() => router.push(`/recipe/${r.id}`)}
                />
              ))}
            </>
          ) : (
            <EmptyState styles={styles} text="You haven't created any recipes yet." />
          )
        ) : null}

        {!loading && !loadError && mainTab === "ingredients" ? (
          ingredientsTab === "featured" ? (
            <>
              <CreateRow label="Create ingredient" onPress={() => notImplemented("Creating an ingredient")} />
              {ingredients.map((f) => (
                <SearchResultRow
                  key={f.id}
                  imageUrl={f.image_url}
                  emoji={foodEmoji(f.category)}
                  color={foodColor(f.category)}
                  title={f.name}
                  subtitleLines={[`${Math.round(f.calories_per_serving)} Cal per serving`]}
                  onAdd={() => notImplemented(`Adding ${f.name}`)}
                  onPress={() => router.push(`/food/${f.id}`)}
                />
              ))}
            </>
          ) : (
            <EmptyState styles={styles} text="You haven't added any custom ingredients yet." />
          )
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

type Styles = ReturnType<typeof getStyles>;

function EmptyState({ styles, text }: { styles: Styles; text: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {},
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
    },
    mainTabsRow: { flexDirection: "row", gap: spacing.lg },
    mainTabLabel: { fontSize: fontSize.xl, fontFamily: fontFamily.bodyBold, color: colors.textMuted },
    mainTabLabelActive: { color: colors.primary },
    subTabsWrap: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
    searchBarRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
    searchBar: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
    },
    searchInput: { flex: 1, fontSize: fontSize.md, fontFamily: fontFamily.body, color: colors.text, padding: 0 },
    list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
    empty: { paddingVertical: spacing.xl, alignItems: "center" },
    emptyText: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: colors.textMuted },
  });
}
