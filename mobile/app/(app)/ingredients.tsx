import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchDish,
  fetchDishIngredients,
  fetchDishNutrients,
  fetchNutrients,
} from "../../lib/suggestions";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { colors, fontFamily, fontSize, spacing } from "../../lib/theme";
import type { Dish, DishIngredient, Nutrient } from "../../types/database";

const CATEGORY_ORDER = ["vegetable", "meat", "legume", "grain", "dairy", "other"];
const CATEGORY_LABELS: Record<string, string> = {
  vegetable: "Vegetables",
  meat: "Meat",
  legume: "Legumes",
  grain: "Grains & Flour",
  dairy: "Dairy",
  other: "Other",
};
const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  vegetable: "leaf-outline",
  meat: "restaurant-outline",
  legume: "ellipse-outline",
  grain: "layers-outline",
  dairy: "water-outline",
  other: "ellipsis-horizontal-outline",
};

function groupByAisle(ingredients: DishIngredient[]): { category: string; items: DishIngredient[] }[] {
  const groups = new Map<string, DishIngredient[]>();
  for (const ing of ingredients) {
    const key = ing.category && CATEGORY_LABELS[ing.category] ? ing.category : "other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(ing);
  }
  return CATEGORY_ORDER.filter((c) => groups.has(c)).map((category) => ({ category, items: groups.get(category)! }));
}

export default function IngredientsScreen() {
  const { dishId, servings } = useLocalSearchParams<{ dishId: string; servings: string }>();
  const servingsNum = Number(servings) || 1;

  const [dish, setDish] = useState<Dish | null>(null);
  const [ingredients, setIngredients] = useState<DishIngredient[]>([]);
  const [nutrients, setNutrients] = useState<Nutrient[]>([]);
  const [nutrientAmounts, setNutrientAmounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dishId) return;
    (async () => {
      const [d, ing, allNutrients, perServing] = await Promise.all([
        fetchDish(dishId),
        fetchDishIngredients(dishId, servingsNum),
        fetchNutrients(),
        fetchDishNutrients(dishId),
      ]);
      setDish(d);
      setIngredients(ing);
      setNutrients(allNutrients);
      setNutrientAmounts(perServing);
      setLoading(false);
    })();
  }, [dishId]);

  if (loading || !dish) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const aisles = groupByAisle(ingredients);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{dish.name}</Text>
      <Text style={styles.subtitle}>Shopping list for {servingsNum} servings</Text>

      <Card>
        {aisles.map(({ category, items }, groupIndex) => (
          <View key={category}>
            <View style={[styles.aisleHeading, groupIndex > 0 && { marginTop: spacing.sm }]}>
              <Ionicons name={CATEGORY_ICONS[category]} size={14} color={colors.primary} />
              <Text style={styles.aisleHeadingText}>{CATEGORY_LABELS[category]}</Text>
            </View>
            {items.map((ing) => (
              <View key={ing.ingredient_id} style={styles.ingredientRow}>
                <Text style={styles.ingredientName}>{ing.ingredient_name}</Text>
                <Text style={styles.ingredientQty}>{Math.round(ing.quantity_grams_per_serving)} g</Text>
              </View>
            ))}
          </View>
        ))}
      </Card>

      <Pressable
        style={styles.videoRow}
        onPress={() =>
          Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(dish.name + " recipe")}`)
        }
      >
        <Ionicons name="logo-youtube" size={20} color={colors.danger} />
        <Text style={styles.videoText}>Watch {dish.name} made on YouTube</Text>
      </Pressable>

      <Text style={styles.sectionHeading}>Nutrients per serving</Text>
      <Card>
        {nutrients.map((n) => (
          <View key={n.id} style={styles.ingredientRow}>
            <Text style={styles.ingredientName}>{n.label}</Text>
            <Text style={styles.ingredientQty}>
              {Math.round((nutrientAmounts[n.id] ?? 0) * 10) / 10} {n.unit}
            </Text>
          </View>
        ))}
      </Card>

      <Button title="Done" icon="checkmark" onPress={() => router.replace("/(app)/home")} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  title: { fontSize: fontSize.xxl, fontFamily: fontFamily.displayBold, color: colors.text },
  subtitle: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: colors.textMuted, marginBottom: spacing.lg },
  sectionHeading: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyMedium, color: colors.text, marginBottom: spacing.sm },
  aisleHeading: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.xs },
  aisleHeadingText: { fontSize: fontSize.xs, fontFamily: fontFamily.bodyBold, color: colors.primary, textTransform: "uppercase", letterSpacing: 0.4 },
  ingredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  ingredientName: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: colors.text, textTransform: "capitalize" },
  ingredientQty: { fontSize: fontSize.md, fontFamily: fontFamily.bodyBold, color: colors.textMuted },
  videoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.text,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  videoText: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyBold, color: colors.background, flex: 1 },
});
