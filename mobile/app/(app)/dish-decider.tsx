import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/Button";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useAuth } from "../../lib/auth";
import { useTheme } from "../../contexts/ThemeContext";
import {
  applyMoodFilters,
  candidateOptionsFromProfile,
  chooseTonightsDinner,
  DEFAULT_MOOD_FILTERS,
  explainMatch,
  fetchCandidateIngredients,
  fetchDinnerCandidates,
  getMeatRecipeIds,
  getRecentDinnerRecipeIds,
  getTonightsDinner,
  pickCandidate,
  recipeDisplay,
  toISODate,
  type DinnerCandidate,
  type MoodFilters,
  type TonightEntry,
} from "../../lib/dishDecider";
import { getCuisineFlag } from "../../lib/cuisineData";
import { fontFamily, fontSize, radius, spacing, type ThemeColors } from "../../lib/theme";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatToday(date: Date) {
  return `${DAY_LABELS[date.getDay()]} ${date.getDate()} ${MONTH_LABELS[date.getMonth()]}`;
}

export default function DishDecider() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { session, profile } = useAuth();
  const userId = session?.user.id;

  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<DinnerCandidate[]>([]);
  const [meatRecipeIds, setMeatRecipeIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<MoodFilters>(DEFAULT_MOOD_FILTERS);
  const [current, setCurrent] = useState<DinnerCandidate | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [chosen, setChosen] = useState<TonightEntry | null>(null);
  const [saving, setSaving] = useState(false);

  const cardScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;

  const today = new Date();
  const dateISO = toISODate(today);

  function animateTransition(onHalfway: () => void) {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 0.2, duration: 120, useNativeDriver: true }),
        Animated.timing(cardScale, { toValue: 0.95, duration: 120, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(cardScale, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]),
    ]).start();
    setTimeout(onHalfway, 120);
  }

  const loadIngredients = useCallback(async (dishId: string) => {
    try {
      const list = await fetchCandidateIngredients(dishId);
      setIngredients(list);
    } catch {
      setIngredients([]);
    }
  }, []);

  const load = useCallback(async () => {
    if (!userId || !profile) return;
    setLoading(true);
    const [fetched, meatIds, existing, recentIds] = await Promise.all([
      fetchDinnerCandidates(candidateOptionsFromProfile(profile)),
      getMeatRecipeIds(),
      getTonightsDinner(userId, dateISO),
      getRecentDinnerRecipeIds(userId, dateISO),
    ]);

    setCandidates(fetched);
    setMeatRecipeIds(meatIds);
    setChosen(existing);

    if (existing) {
      const match = fetched.find((c) => c.id === existing.recipeId);
      const fallback: DinnerCandidate = {
        id: existing.recipeId,
        name: existing.name,
        cuisine: null,
        calories_per_serving: existing.calories,
        protein_g_per_serving: null,
        carbs_g_per_serving: null,
        fat_g_per_serving: null,
        prep_minutes: existing.prepMinutes,
        cook_minutes: existing.cookMinutes,
        servings: existing.servings,
        image_url: existing.imageUrl,
      };
      const chosenCandidate = match ?? fallback;
      setCurrent(chosenCandidate);
      loadIngredients(chosenCandidate.id);
    } else {
      const pool = applyMoodFilters(fetched, DEFAULT_MOOD_FILTERS, meatIds);
      const picked = pickCandidate(pool, recentIds);
      setCurrent(picked);
      if (picked) loadIngredients(picked.id);
    }
    setLoading(false);
  }, [userId, profile, dateISO, loadIngredients]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const pool = applyMoodFilters(candidates, filters, meatRecipeIds);

  function toggleFilter(key: keyof MoodFilters) {
    const next = { ...filters, [key]: !filters[key] };
    if (key === "noMeat" && next.noMeat) next.meatOnly = false;
    if (key === "meatOnly" && next.meatOnly) next.noMeat = false;

    setFilters(next);
    const nextPool = applyMoodFilters(candidates, next, meatRecipeIds);
    const nextDish = pickCandidate(nextPool, current ? new Set([current.id]) : undefined);
    animateTransition(() => {
      setCurrent(nextDish);
      if (nextDish) loadIngredients(nextDish.id);
    });
  }

  function showAnother() {
    const nextDish = pickCandidate(pool, current ? new Set([current.id]) : undefined);
    animateTransition(() => {
      setCurrent(nextDish);
      if (nextDish) loadIngredients(nextDish.id);
    });
  }

  async function cookThis() {
    if (!userId || !current) return;
    setSaving(true);
    try {
      const entry = await chooseTonightsDinner(userId, dateISO, current);
      setChosen(entry);
    } catch (e: any) {
      Alert.alert("Couldn't save tonight's dinner", e?.message ?? "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const alreadyChosen = !!chosen && chosen.recipeId === current?.id;
  const display = current ? recipeDisplay(current) : null;
  const totalMinutes = current ? (current.prep_minutes ?? 0) + (current.cook_minutes ?? 0) : 0;

  return (
    <ScreenContainer style={styles.container} topSpacing={spacing.md}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>TONIGHT'S DINNER · {formatToday(today).toUpperCase()}</Text>
        <Text style={styles.title}>What sounds good?</Text>
      </View>

      {/* Mood Filters Carousel */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <MoodChip
            label="Sabzi / Veg"
            icon="leaf-outline"
            active={filters.noMeat}
            onPress={() => toggleFilter("noMeat")}
            colors={colors}
          />
          <MoodChip
            label="Meat / Chicken"
            icon="restaurant-outline"
            active={filters.meatOnly}
            onPress={() => toggleFilter("meatOnly")}
            colors={colors}
          />
          <MoodChip
            label="Quick (<30m)"
            icon="flash-outline"
            active={filters.quick}
            onPress={() => toggleFilter("quick")}
            colors={colors}
          />
          <MoodChip
            label="Light (<500 kcal)"
            icon="sunny-outline"
            active={filters.light}
            onPress={() => toggleFilter("light")}
            colors={colors}
          />
        </ScrollView>
      </View>

      {/* Main Body */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : current ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.heroCard,
              {
                transform: [{ scale: cardScale }],
                opacity: cardOpacity,
              },
            ]}
          >
            {/* Dish Photo / Banner */}
            <Pressable
              style={styles.imageWrap}
              onPress={() => router.push(`/recipe/${current.id}`)}
            >
              {current.image_url ? (
                <Image
                  source={{ uri: current.image_url }}
                  style={styles.image}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <LinearGradient
                  colors={[display?.color || colors.primary, colors.surfaceAlt]}
                  style={styles.imageFallback}
                >
                  <Text style={styles.fallbackEmoji}>{display?.emoji || "🍛"}</Text>
                </LinearGradient>
              )}

              {/* Gradient Dark Overlay */}
              <LinearGradient
                colors={["rgba(0,0,0,0.15)", "transparent", "rgba(4,42,28,0.85)"]}
                style={styles.gradientOverlay}
              />

              {/* Floating Badges */}
              <View style={styles.topBadgesRow}>
                {current.cuisine ? (
                  <View style={styles.cuisineBadge}>
                    <Text style={styles.cuisineBadgeText}>
                      {getCuisineFlag(current.cuisine)} {current.cuisine}
                    </Text>
                  </View>
                ) : <View />}

                <View style={styles.calorieBadge}>
                  <Ionicons name="flame" size={13} color="#FFC233" />
                  <Text style={styles.calorieBadgeText}>
                    {current.calories_per_serving} kcal
                  </Text>
                </View>
              </View>

              {/* Bottom Dish Title on Image */}
              <View style={styles.titleOverlay}>
                <Text style={styles.dishName} numberOfLines={2}>
                  {current.name}
                </Text>
              </View>
            </Pressable>

            {/* Quick Nutrition & Stats Bar */}
            <View style={styles.statsBar}>
              {totalMinutes > 0 ? (
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={15} color={colors.textMuted} />
                  <Text style={styles.statText}>{totalMinutes}m</Text>
                </View>
              ) : null}

              {current.protein_g_per_serving ? (
                <View style={styles.statItem}>
                  <Ionicons name="fitness-outline" size={15} color={colors.protein} />
                  <Text style={styles.statText}>{Math.round(current.protein_g_per_serving)}g protein</Text>
                </View>
              ) : null}

              {current.carbs_g_per_serving ? (
                <View style={styles.statItem}>
                  <Ionicons name="nutrition-outline" size={15} color={colors.carbs} />
                  <Text style={styles.statText}>{Math.round(current.carbs_g_per_serving)}g carbs</Text>
                </View>
              ) : null}
            </View>

            {/* "Why Tonight?" Context Banner */}
            <View style={styles.whyBox}>
              <Ionicons name="sparkles" size={16} color={colors.primary} />
              <Text style={styles.whyText}>
                {alreadyChosen
                  ? "Locked in for tonight ✓ · Ingredients added to your shopping list."
                  : explainMatch(current, filters)}
              </Text>
            </View>

            {/* Ingredient Peek Chips */}
            {ingredients.length > 0 ? (
              <View style={styles.ingredientsPreview}>
                <Text style={styles.ingredientsLabel}>Main Ingredients:</Text>
                <View style={styles.ingredientChipsRow}>
                  {ingredients.slice(0, 4).map((name, i) => (
                    <View key={i} style={styles.ingredientChip}>
                      <Text style={styles.ingredientChipText}>{name}</Text>
                    </View>
                  ))}
                  {ingredients.length > 4 ? (
                    <Text style={styles.moreIngredientsText}>+{ingredients.length - 4} more</Text>
                  ) : null}
                </View>
              </View>
            ) : null}

            {/* Tap to View Recipe */}
            <Pressable
              style={styles.viewRecipeRow}
              onPress={() => router.push(`/recipe/${current.id}`)}
            >
              <Text style={styles.viewRecipeText}>View full recipe & directions</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.primary} />
            </Pressable>
          </Animated.View>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={styles.emptyTitle}>No dishes match this combination</Text>
          <Text style={styles.emptySubtitle}>Try turning off one of the mood filters above.</Text>
        </View>
      )}

      {/* Bottom Sticky Action Buttons */}
      <View style={styles.footer}>
        <View style={styles.pair}>
          <Button
            title="Roll again 🎲"
            variant="secondary"
            onPress={showAnother}
            disabled={!current || saving}
            style={styles.pairButton}
          />
          <Button
            title={alreadyChosen ? "Locked in ✓" : "Cook tonight"}
            onPress={cookThis}
            loading={saving}
            disabled={!current}
            style={styles.pairButton}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

function MoodChip({
  label,
  icon,
  active,
  onPress,
  colors,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
  colors: ThemeColors;
}) {
  return (
    <Pressable
      style={[
        chipStyles.chip,
        { backgroundColor: active ? colors.primary : colors.surfaceAlt, borderColor: active ? colors.primary : colors.border },
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={15} color={active ? colors.primaryText : colors.text} />
      <Text
        style={[
          chipStyles.label,
          { color: active ? colors.primaryText : colors.text, fontFamily: active ? fontFamily.bodyBold : fontFamily.bodyMedium },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.xs,
  },
  label: { fontSize: fontSize.xs },
});

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {},
    header: { paddingHorizontal: spacing.lg, marginBottom: spacing.xs },
    eyebrow: {
      fontSize: 11,
      fontFamily: fontFamily.bodyBold,
      color: colors.primary,
      letterSpacing: 0.8,
      marginBottom: 2,
    },
    title: { fontSize: fontSize.xxl, fontFamily: fontFamily.displayBold, color: colors.text },
    filterSection: { marginVertical: spacing.xs },
    filterScroll: { paddingHorizontal: spacing.lg, paddingVertical: 4 },
    scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs, paddingBottom: spacing.lg },
    loading: { flex: 1, alignItems: "center", justifyContent: "center" },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl },
    emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
    emptyTitle: { fontSize: fontSize.md, fontFamily: fontFamily.bodyBold, color: colors.text, textAlign: "center" },
    emptySubtitle: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: colors.textMuted, textAlign: "center", marginTop: 4 },

    heroCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 4,
    },
    imageWrap: {
      height: 220,
      position: "relative",
      backgroundColor: colors.surfaceAlt,
    },
    image: { width: "100%", height: "100%" },
    imageFallback: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
    fallbackEmoji: { fontSize: 68 },
    gradientOverlay: { ...StyleSheet.absoluteFill },
    topBadgesRow: {
      position: "absolute",
      top: spacing.md,
      left: spacing.md,
      right: spacing.md,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    cuisineBadge: {
      backgroundColor: "rgba(4, 42, 28, 0.75)",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: radius.pill,
    },
    cuisineBadgeText: {
      fontSize: fontSize.xs,
      fontFamily: fontFamily.bodyBold,
      color: "#FBFAF2",
    },
    calorieBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "rgba(4, 42, 28, 0.75)",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: radius.pill,
    },
    calorieBadgeText: {
      fontSize: fontSize.xs,
      fontFamily: fontFamily.bodyBold,
      color: "#FBFAF2",
    },
    titleOverlay: {
      position: "absolute",
      bottom: spacing.md,
      left: spacing.md,
      right: spacing.md,
    },
    dishName: {
      fontSize: fontSize.xl,
      fontFamily: fontFamily.displayBold,
      color: "#FBFAF2",
      lineHeight: 28,
    },
    statsBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surfaceAlt,
    },
    statItem: { flexDirection: "row", alignItems: "center", gap: 5 },
    statText: { fontSize: fontSize.xs, fontFamily: fontFamily.bodyBold, color: colors.text },
    whyBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
      padding: spacing.sm,
      backgroundColor: colors.primaryTint,
      borderRadius: radius.md,
    },
    whyText: {
      flex: 1,
      fontSize: fontSize.xs,
      fontFamily: fontFamily.bodyMedium,
      color: colors.primary,
      lineHeight: 18,
    },
    ingredientsPreview: {
      paddingHorizontal: spacing.md,
      marginTop: spacing.sm,
    },
    ingredientsLabel: {
      fontSize: 11,
      fontFamily: fontFamily.bodyBold,
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    ingredientChipsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 6,
    },
    ingredientChip: {
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: radius.pill,
    },
    ingredientChipText: {
      fontSize: fontSize.xs,
      fontFamily: fontFamily.body,
      color: colors.text,
    },
    moreIngredientsText: {
      fontSize: fontSize.xs,
      fontFamily: fontFamily.bodyMedium,
      color: colors.textMuted,
    },
    viewRecipeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      paddingVertical: spacing.md,
      marginTop: spacing.xs,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    viewRecipeText: {
      fontSize: fontSize.xs,
      fontFamily: fontFamily.bodyBold,
      color: colors.primary,
    },
    footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, paddingTop: spacing.xs },
    pair: { flexDirection: "row", gap: spacing.sm },
    pairButton: { flex: 1 },
  });
}
