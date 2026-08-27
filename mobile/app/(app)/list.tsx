import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/Button";
import { IconButton } from "../../components/IconButton";
import { ScreenContainer } from "../../components/ScreenContainer";
import { ScreenHeader } from "../../components/ScreenHeader";
import { useAuth } from "../../lib/auth";
import { useOnboardingDraft } from "../../contexts/OnboardingDraft";
import { useTheme } from "../../contexts/ThemeContext";
import {
  fetchWeeklyShoppingList,
  formatShoppingListForWhatsApp,
  formatWeekLabel,
  getWeekRange,
  type ShoppingAisle,
  type ShoppingItem,
  type WeeklyShoppingData,
} from "../../lib/mealPlanService";
import { fontFamily, fontSize, radius, spacing, type ThemeColors } from "../../lib/theme";

function notImplemented(what: string) {
  Alert.alert("Coming soon", `${what} isn't built yet.`);
}

export default function List() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { session, profile } = useAuth();
  const { adultsCount, childrenCount } = useOnboardingDraft();
  const userId = session?.user.id;

  const householdSize = (profile?.adults_count ?? adultsCount ?? 2) + (profile?.children_count ?? childrenCount ?? 0);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WeeklyShoppingData | null>(null);
  const [got, setGot] = useState<Set<string>>(new Set());
  const [hideStaples, setHideStaples] = useState(false);

  const { monday, sunday } = getWeekRange();
  const weekLabel = formatWeekLabel(monday, sunday);

  const loadData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const shoppingData = await fetchWeeklyShoppingList(userId, householdSize);
      setData(shoppingData);
    } catch (e) {
      console.warn("Failed to load shopping list:", e);
    } finally {
      setLoading(false);
    }
  }, [userId, householdSize]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  function toggle(id: string) {
    setGot((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const rawAisles = data?.aisles ?? [];

  const displayedAisles = useMemo(() => {
    if (!hideStaples) return rawAisles;
    return rawAisles
      .filter((a) => a.key !== "spices")
      .map((a) => ({
        ...a,
        items: a.items.filter((item) => !item.isStaple),
      }))
      .filter((a) => a.items.length > 0);
  }, [rawAisles, hideStaples]);

  const itemCount = displayedAisles.reduce((n, a) => n + a.items.length, 0);
  const budget = data?.budget ?? { spent: 0, recipeCost: 0, checkoutCost: 0, total: 1500, currency: "Rs." };
  const budgetFraction = Math.min(1, budget.total > 0 ? budget.spent / budget.total : 0);

  async function handleShareWhatsApp() {
    if (displayedAisles.length === 0) {
      Alert.alert("Empty List", "Plan at least one dinner on Dish Decider to generate a shopping list.");
      return;
    }
    const message = formatShoppingListForWhatsApp(displayedAisles, householdSize, weekLabel);
    try {
      await Share.share({
        message,
        title: "Mealinnia Shopping List",
      });
    } catch (error: any) {
      Alert.alert("Share failed", error.message);
    }
  }

  return (
    <ScreenContainer topSpacing={spacing.lg}>
      <ScreenHeader
        title="Shopping"
        subtitle={`${itemCount} items · ${householdSize} people · bazaar order`}
        right={
          <IconButton
            icon="share-social-outline"
            color={colors.primary}
            accessibilityLabel="Share list"
            onPress={handleShareWhatsApp}
          />
        }
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : rawAisles.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyTitle}>No items for this week</Text>
            <Text style={styles.emptySubtitle}>
              Pick your dinners for the week on Dish Decider, and we'll automatically generate your scaled bazaar list.
            </Text>
            <Button
              title="Plan Tonight's Dinner"
              onPress={() => router.push("/(app)/dish-decider")}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        ) : (
          <>
            {/* Pantry Staples Filter Chip */}
            <View style={styles.filterRow}>
              <Pressable
                style={[styles.filterChip, hideStaples && styles.filterChipActive]}
                onPress={() => setHideStaples((prev) => !prev)}
              >
                <Ionicons
                  name={hideStaples ? "checkbox" : "square-outline"}
                  size={16}
                  color={hideStaples ? colors.primary : colors.textMuted}
                />
                <Text style={[styles.filterChipText, hideStaples && styles.filterChipTextActive]}>
                  Hide Pantry Staples (Spices & Oils)
                </Text>
              </Pressable>
            </View>

            {displayedAisles.map((aisle) => (
              <View key={aisle.key}>
                <Text style={styles.aisleTitle}>
                  {aisle.emoji} {aisle.label}
                </Text>
                {aisle.items.map((item) => (
                  <Row
                    key={item.id}
                    item={item}
                    got={got.has(item.id)}
                    onToggle={() => toggle(item.id)}
                    colors={colors}
                    styles={styles}
                  />
                ))}
              </View>
            ))}

            {/* Dual Budget Breakdown Card */}
            <View style={styles.budgetCard}>
              <View style={styles.budgetCardHeader}>
                <Text style={styles.budgetCardTitle}>Weekly Grocery Cost Estimate</Text>
                <Text style={styles.budgetCardStoreTag}>Foodpanda Pandamart (PKR)</Text>
              </View>

              <View style={styles.dualCostRow}>
                {/* 1. Recipe Consumed Cost */}
                <View style={styles.costBox}>
                  <Text style={styles.costBoxLabel}>🍲 Recipe Cost</Text>
                  <Text style={styles.costBoxAmount}>
                    {budget.currency} {budget.recipeCost?.toLocaleString() ?? budget.total.toLocaleString()}
                  </Text>
                  <Text style={styles.costBoxSubtext}>Exact portion cooked</Text>
                </View>

                <View style={styles.costDivider} />

                {/* 2. Store Checkout Cost */}
                <View style={styles.costBox}>
                  <Text style={styles.costBoxLabel}>🛍️ Store Checkout</Text>
                  <Text style={styles.costBoxAmount}>
                    {budget.currency} {budget.checkoutCost?.toLocaleString() ?? budget.total.toLocaleString()}
                  </Text>
                  <Text style={styles.costBoxSubtext}>Full retail packages</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {rawAisles.length > 0 ? (
        <View style={styles.footer}>
          <Button
            title="Share via WhatsApp"
            icon="logo-whatsapp"
            onPress={handleShareWhatsApp}
          />
          <Button
            variant="secondary"
            title="Order on foodpanda"
            onPress={() => notImplemented("Ordering on foodpanda")}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      ) : null}
    </ScreenContainer>
  );
}

type Styles = ReturnType<typeof getStyles>;

function Row({
  item,
  got,
  onToggle,
  colors,
  styles,
}: {
  item: ShoppingItem;
  got: boolean;
  onToggle: () => void;
  colors: ThemeColors;
  styles: Styles;
}) {
  return (
    <Pressable style={styles.row} onPress={onToggle}>
      <Ionicons
        name={got ? "checkmark-circle" : "ellipse-outline"}
        size={20}
        color={got ? colors.primary : colors.textMuted}
      />
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowName, got && styles.rowNameGot]}>{item.name}</Text>
        {item.recipeNames.length > 0 ? (
          <Text style={styles.rowSubtext} numberOfLines={1}>
            for {item.recipeNames.join(", ")}
          </Text>
        ) : null}
        {item.packageInfo ? (
          <Text style={styles.packageHintText} numberOfLines={1}>
            Store Pack: {item.packageInfo} · {item.currency} {item.packagePrice}
          </Text>
        ) : null}
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={[styles.rowAmount, got && styles.rowNameGot]}>{item.amount}</Text>
        {item.proratedPrice != null ? (
          <Text style={styles.rowProratedPrice}>
            ~{item.currency} {Math.round(item.proratedPrice)} used
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    body: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl },
    loadingBox: { paddingVertical: spacing.xxl, alignItems: "center", justifyContent: "center" },
    emptyBox: { paddingVertical: spacing.xxl, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.md },
    emptyEmoji: { fontSize: 54, marginBottom: spacing.md },
    emptyTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.displayBold, color: colors.text, textAlign: "center" },
    emptySubtitle: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyMedium, color: colors.textMuted, textAlign: "center", marginTop: 6, lineHeight: 20 },
    filterRow: {
      flexDirection: "row",
      marginBottom: spacing.sm,
    },
    filterChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipActive: {
      backgroundColor: colors.primaryTint,
      borderColor: colors.primary,
    },
    filterChipText: {
      fontSize: fontSize.xs,
      fontFamily: fontFamily.bodyMedium,
      color: colors.textMuted,
    },
    filterChipTextActive: {
      color: colors.primary,
      fontFamily: fontFamily.bodyBold,
    },
    aisleTitle: {
      fontSize: 11,
      fontFamily: fontFamily.bodyBold,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: colors.primary,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowName: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyBold, color: colors.text },
    rowSubtext: { fontSize: 11, fontFamily: fontFamily.body, color: colors.textMuted, marginTop: 1 },
    packageHintText: {
      fontSize: 10.5,
      fontFamily: fontFamily.bodyMedium,
      color: colors.primary,
      marginTop: 2,
    },
    rowAmount: { fontSize: fontSize.xs, fontFamily: fontFamily.bodyBold, color: colors.text },
    rowProratedPrice: {
      fontSize: 11,
      fontFamily: fontFamily.bodyBold,
      color: colors.textMuted,
      marginTop: 2,
    },
    rowNameGot: { color: colors.textMuted, textDecorationLine: "line-through" },

    // Dual Budget Card
    budgetCard: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.md,
      padding: spacing.md,
      marginTop: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    budgetCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm + 2,
    },
    budgetCardTitle: {
      fontSize: fontSize.xs + 1,
      fontFamily: fontFamily.bodyBold,
      color: colors.text,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    budgetCardStoreTag: {
      fontSize: 10,
      fontFamily: fontFamily.bodyBold,
      color: colors.primary,
      backgroundColor: colors.primaryTint,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: radius.pill,
    },
    dualCostRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: radius.sm,
      padding: spacing.sm + 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    costBox: {
      flex: 1,
      alignItems: "center",
    },
    costBoxLabel: {
      fontSize: 11,
      fontFamily: fontFamily.bodyBold,
      color: colors.textMuted,
      marginBottom: 2,
    },
    costBoxAmount: {
      fontSize: fontSize.md + 1,
      fontFamily: fontFamily.displayBold,
      color: colors.text,
    },
    costBoxSubtext: {
      fontSize: 9.5,
      fontFamily: fontFamily.body,
      color: colors.textMuted,
      marginTop: 2,
    },
    costDivider: {
      width: 1,
      height: 36,
      backgroundColor: colors.border,
      marginHorizontal: spacing.sm,
    },
    footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  });
}
