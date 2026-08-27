import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { AmountStepper } from "../../components/AmountStepper";
import { Dropdown } from "../../components/Dropdown";
import { DetailActionRow } from "../../components/DetailActionRow";
import { MacroDonut } from "../../components/MacroDonut";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useTheme } from "../../contexts/ThemeContext";
import { getFoodById } from "../../lib/mockFoods";
import { getScheduledFoodsForFood } from "../../lib/mockRecipeDetails";
import { foodColor, foodEmoji } from "../../lib/foodIcons";
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

interface FoodDetailData {
  id: string;
  name: string;
  variant?: string;
  imageUrl: string | null;
  emoji: string;
  color: string;
  calories: number;
  carbsG: number;
  fatG: number;
  proteinG: number;
  defaultAmount: number;
  defaultUnit: string;
  gramWeight: number;
  units: string[];
}

// Ingredients seeded via scripts/seed-data/foods.json live in the `foods` table.
// Planner now generates real DB food/recipe ids, but this mock fallback stays as a
// defensive no-op for any leftover string ids like "egg-white" that only exist in mockFoods.
async function fetchFood(id: string): Promise<FoodDetailData | null> {
  const { data, error } = await supabase
    .from("foods")
    .select("id,name,category,serving_size,serving_unit,calories_per_serving,protein_g_per_serving,carbs_g_per_serving,fat_g_per_serving,image_url")
    .eq("id", id)
    .maybeSingle();

  if (!error && data) {
    return {
      id: data.id,
      name: data.name,
      imageUrl: data.image_url,
      emoji: foodEmoji(data.category),
      color: foodColor(data.category),
      calories: data.calories_per_serving,
      carbsG: data.carbs_g_per_serving ?? 0,
      fatG: data.fat_g_per_serving ?? 0,
      proteinG: data.protein_g_per_serving ?? 0,
      defaultAmount: data.serving_size,
      defaultUnit: data.serving_unit,
      gramWeight: data.serving_size,
      units: [data.serving_unit],
    };
  }

  const mock = getFoodById(id);
  if (!mock) return null;
  return {
    id: mock.id,
    name: mock.name,
    variant: mock.variant,
    imageUrl: null,
    emoji: mock.emoji,
    color: mock.color,
    calories: mock.calories,
    carbsG: mock.carbsG,
    fatG: mock.fatG,
    proteinG: mock.proteinG,
    defaultAmount: mock.defaultAmount,
    defaultUnit: mock.defaultUnit,
    gramWeight: mock.gramWeight,
    units: mock.units ?? [mock.defaultUnit],
  };
}

export default function FoodDetail() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [food, setFood] = useState<FoodDetailData | null | undefined>(undefined);
  const [amount, setAmount] = useState(1);
  const [unit, setUnit] = useState("g");
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setFood(undefined);
    fetchFood(id).then((result) => {
      if (cancelled) return;
      setFood(result);
      if (result) {
        setAmount(result.defaultAmount);
        setUnit(result.defaultUnit);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (food === undefined) {
    return (
      <ScreenContainer style={styles.container}>
        <Text style={styles.missing}>Loading…</Text>
      </ScreenContainer>
    );
  }

  if (food === null) {
    return (
      <ScreenContainer style={styles.container}>
        <Text style={styles.missing}>Food not found.</Text>
      </ScreenContainer>
    );
  }

  const scale = amount / food.defaultAmount;
  const gramWeight = Math.round(food.gramWeight * scale);
  const calories = Math.round(food.calories * scale);
  const carbsG = round2(food.carbsG * scale);
  const fatG = round2(food.fatG * scale);
  const proteinG = round2(food.proteinG * scale);

  const unitOptions = food.units.map((u) => ({ label: u, value: u }));
  const scheduled = getScheduledFoodsForFood(food.id);
  const groupedByDate = scheduled.reduce<Record<string, typeof scheduled>>((acc, entry) => {
    (acc[entry.date] ??= []).push(entry);
    return acc;
  }, {});

  return (
    <ScreenContainer style={styles.container} topSpacing={spacing.sm}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {food.name}
          </Text>
          {food.variant ? <Text style={styles.headerSubtitle}>{food.variant}</Text> : null}
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          {food.imageUrl ? (
            <Image source={{ uri: food.imageUrl }} style={styles.heroGradient} contentFit="cover" transition={150} />
          ) : (
            <LinearGradient colors={[food.color, colors.surfaceAlt]} style={styles.heroGradient}>
              <Text style={styles.heroEmoji}>{food.emoji}</Text>
            </LinearGradient>
          )}
          <Pressable style={styles.heroButtonShare} onPress={() => notImplemented("Sharing")} hitSlop={8}>
            <Ionicons name="share-outline" size={18} color={colors.text} />
          </Pressable>
          <Pressable style={styles.heroButtonPhoto} onPress={() => notImplemented("Adding a photo")} hitSlop={8}>
            <Ionicons name="camera-outline" size={18} color={colors.text} />
          </Pressable>
        </View>

        <DetailActionRow />

        <View style={styles.divider} />

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Amount</Text>
          <View style={styles.fieldControls}>
            <Text style={styles.amountValue}>{formatAmount(amount)}</Text>
            <AmountStepper value={amount} onChange={setAmount} step={food.defaultAmount >= 10 ? food.defaultAmount / 4 : 0.5} min={0.25} />
            <Dropdown options={unitOptions} value={unit} onChange={setUnit} style={styles.unitDropdown} />
          </View>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Gram weight</Text>
          <Text style={styles.fieldValue}>{gramWeight} grams</Text>
        </View>

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
            <Text style={styles.summaryCalories}>{calories} Calories</Text>
            <Text style={styles.summaryMacros}>
              {carbsG}g Carbs, {fatG}g Fat, {proteinG}g Protein
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        <View style={styles.divider} />

        <Pressable style={styles.scheduledHeader} onPress={() => setExpanded((e) => !e)}>
          <Text style={styles.sectionTitle}>Scheduled foods with this ingredient</Text>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={colors.textMuted} />
        </Pressable>

        {expanded ? (
          Object.keys(groupedByDate).length > 0 ? (
            Object.entries(groupedByDate).map(([date, entries]) => (
              <View key={date} style={styles.dateGroup}>
                <Text style={styles.dateLabel}>{date}</Text>
                {entries.map((entry, i) => (
                  <Pressable key={i} style={styles.scheduledRow} onPress={() => router.push(`/recipe/${entry.recipeId}`)}>
                    <Text style={styles.scheduledText}>
                      <Text style={styles.scheduledMeal}>{entry.mealLabel}: </Text>
                      {entry.recipeName}
                    </Text>
                    <Text style={styles.scheduledServings}>{entry.servings}</Text>
                  </Pressable>
                ))}
              </View>
            ))
          ) : (
            <Text style={styles.emptyScheduled}>Nothing on your plan uses this ingredient yet.</Text>
          )
        ) : null}
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => notImplemented(`Adding ${food.name}`)}>
        <Ionicons name="add" size={28} color={colors.text} />
      </Pressable>
    </ScreenContainer>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
  container: {},
  missing: { color: colors.textMuted, fontFamily: fontFamily.body, fontSize: fontSize.md, textAlign: "center", marginTop: spacing.xxl },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  headerTitleWrap: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.bodyBold, color: colors.text },
  headerSubtitle: { fontSize: fontSize.xs, fontFamily: fontFamily.body, color: colors.textMuted, marginTop: 1 },
  headerSpacer: { width: 26 },
  content: { paddingBottom: spacing.xxl },
  hero: { marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  heroGradient: { height: 220, borderRadius: radius.lg, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  heroEmoji: { fontSize: 72 },
  heroButtonShare: {
    position: "absolute", top: spacing.md, right: spacing.md, width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center",
  },
  heroButtonPhoto: {
    position: "absolute", top: spacing.md + 44, right: spacing.md, width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center",
  },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.lg, marginVertical: spacing.md },
  fieldRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  fieldLabel: { fontSize: fontSize.md, fontFamily: fontFamily.bodyMedium, color: colors.text },
  fieldValue: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: colors.textMuted },
  fieldControls: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  amountValue: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: colors.text, minWidth: 24, textAlign: "center" },
  unitDropdown: { minWidth: 100 },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg },
  summaryText: { flex: 1 },
  summaryCalories: { fontSize: fontSize.lg, fontFamily: fontFamily.bodyMedium, color: colors.text },
  summaryMacros: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: colors.textMuted, marginTop: 2 },
  scheduledHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { fontSize: fontSize.md, fontFamily: fontFamily.bodyBold, color: colors.text, flex: 1 },
  dateGroup: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  dateLabel: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyMedium, color: colors.textMuted, marginBottom: spacing.xs },
  scheduledRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  scheduledText: { flex: 1, fontSize: fontSize.sm, fontFamily: fontFamily.body, color: colors.text, paddingRight: spacing.md },
  scheduledMeal: { fontFamily: fontFamily.bodyMedium },
  scheduledServings: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: colors.textMuted },
  emptyScheduled: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: colors.textMuted, paddingHorizontal: spacing.lg },
  fab: {
    position: "absolute", right: spacing.lg, bottom: spacing.lg, width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary, alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  });
}
