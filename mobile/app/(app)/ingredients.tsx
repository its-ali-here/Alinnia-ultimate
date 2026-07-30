import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  fetchDish,
  fetchDishIngredients,
  fetchDishNutrients,
  fetchNutrients,
} from "../../lib/suggestions";
import { Button } from "../../components/Button";
import { colors, spacing } from "../../lib/theme";
import type { Dish, DishIngredient, Nutrient } from "../../types/database";

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
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{dish.name}</Text>
      <Text style={styles.subtitle}>Shopping list for {servingsNum} servings</Text>

      <View style={styles.card}>
        {ingredients.map((ing) => (
          <View key={ing.ingredient_id} style={styles.ingredientRow}>
            <Text style={styles.ingredientName}>{ing.ingredient_name}</Text>
            <Text style={styles.ingredientQty}>{Math.round(ing.quantity_grams_per_serving)} g</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionHeading}>Nutrients per serving</Text>
      <View style={styles.card}>
        {nutrients.map((n) => (
          <View key={n.id} style={styles.ingredientRow}>
            <Text style={styles.ingredientName}>{n.label}</Text>
            <Text style={styles.ingredientQty}>
              {Math.round((nutrientAmounts[n.id] ?? 0) * 10) / 10} {n.unit}
            </Text>
          </View>
        ))}
      </View>

      <Button title="Done" onPress={() => router.replace("/(app)/home")} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  title: { fontSize: 24, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.lg },
  sectionHeading: { fontSize: 15, fontWeight: "600", color: colors.text, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  ingredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  ingredientName: { fontSize: 15, color: colors.text, textTransform: "capitalize" },
  ingredientQty: { fontSize: 15, color: colors.textMuted, fontWeight: "600" },
});
