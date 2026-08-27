import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
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
import { useTheme } from "../../contexts/ThemeContext";
import {
  fetchWeeklyPlan,
  formatWeekLabel,
  getWeekRange,
  type WeeklyPlanData,
} from "../../lib/mealPlanService";
import { fontFamily, fontSize, radius, spacing, type ThemeColors } from "../../lib/theme";

const COACH_TIPS = [
  {
    id: "walk",
    tag: "BLOOD GLUCOSE & SATIVITY",
    icon: "walk-outline",
    color: "#14A85C",
    title: "The 1,000-Step Post-Dinner Walk",
    body: "A brisk 15-minute stroll after a curry or rice dinner blunts blood glucose spikes by up to 22% and eliminates heavy food coma sluggishness.",
  },
  {
    id: "roti",
    tag: "CARB STRATEGY",
    icon: "nutrition-outline",
    color: "#FFC233",
    title: "Roti vs. White Basmati Satiety",
    body: "Whole wheat chakki atta roti has 3x more dietary fiber than polished basmati rice, keeping insulin flat and hunger suppressed 2 hours longer.",
  },
  {
    id: "protein",
    tag: "MUSCLE & PROTEIN HACK",
    icon: "fitness-outline",
    color: "#F0563E",
    title: "The Daal Protein Multiplier",
    body: "Pairing a single bowl of daal with 2 boiled egg whites or 50g low-fat paneer turns an 11g meal into a 24g complete muscle-repair dinner.",
  },
  {
    id: "gut",
    tag: "GUT HEALTH & ANTI-BLOAT",
    icon: "leaf-outline",
    color: "#8FE64B",
    title: "Zero-Bloat Desi Spice Trick",
    body: "Adding fresh grated ginger and roasted zeera (cumin) breaks down oligosaccharides in lentils, chickpeas, and heavy legumes effortlessly.",
  },
  {
    id: "water",
    tag: "PORTION CONTROL",
    icon: "water-outline",
    color: "#2D9CDB",
    title: "Pre-Dinner Hydration Secret",
    body: "Drinking a tall glass of room-temperature water 15 minutes before dinner curbs mindless overeating of rich gravies and naan by 13%.",
  },
];

export default function Week() {
  const { colors, preference } = useTheme();
  const styles = getStyles(colors, preference);
  const { session } = useAuth();
  const userId = session?.user.id;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WeeklyPlanData | null>(null);
  const [activeTipIndex, setActiveTipIndex] = useState(0);

  const { monday, sunday } = getWeekRange();
  const weekLabel = formatWeekLabel(monday, sunday);

  const loadData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const planData = await fetchWeeklyPlan(userId);
      setData(planData);
    } catch (e) {
      console.warn("Failed to load weekly plan:", e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const plannedCount = data?.plannedCount ?? 0;
  const days = data?.days ?? [];
  const nutrients = data?.nutrients ?? [];

  const headerTitle =
    plannedCount === 0
      ? "Plan your week"
      : plannedCount >= 5
      ? "Week well covered"
      : "Coming along nicely";

  const currentTip = COACH_TIPS[activeTipIndex % COACH_TIPS.length];

  return (
    <ScreenContainer topSpacing={spacing.lg}>
      <ScreenHeader
        title={headerTitle}
        subtitle={`${weekLabel} · ${plannedCount} of 7 planned`}
        right={
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
            <IconButton
              icon="search-outline"
              onPress={() => router.push("/search")}
            />
            <IconButton
              icon="person-circle-outline"
              onPress={() => router.push("/(app)/household")}
            />
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <>
            {/* 1. 7-Day Bar Indicator Strip */}
            <View style={styles.weekStrip}>
              {days.map((d, i) => (
                <Pressable
                  key={i}
                  style={styles.dayCol}
                  onPress={() => {
                    if (d.recipeId) {
                      router.push(`/recipe/${d.recipeId}`);
                    } else {
                      router.push("/(app)/dish-decider");
                    }
                  }}
                >
                  <Text style={[styles.dayLabel, d.isToday && styles.dayLabelToday]}>
                    {d.label}
                  </Text>
                  <View
                    style={[
                      styles.dayBar,
                      d.planned && { backgroundColor: colors.primary },
                      d.isToday && { borderColor: colors.accent, borderWidth: 2 },
                    ]}
                  />
                  {d.recipeName ? (
                    <Text style={styles.dayMealName} numberOfLines={1}>
                      {d.recipeName.split(" ")[0]}
                    </Text>
                  ) : (
                    <Text style={styles.dayEmptyDot}>·</Text>
                  )}
                </Pressable>
              ))}
            </View>

            {/* 2. Fitness & Health Coach Nudge Card */}
            <View style={styles.coachCard}>
              <View style={styles.coachHeader}>
                <View style={[styles.coachBadge, { backgroundColor: currentTip.color + "22" }]}>
                  <Ionicons name={currentTip.icon as any} size={14} color={currentTip.color} />
                  <Text style={[styles.coachBadgeText, { color: currentTip.color }]}>
                    {currentTip.tag}
                  </Text>
                </View>

                {/* Next tip button */}
                <Pressable
                  style={styles.nextTipBtn}
                  onPress={() => setActiveTipIndex((prev) => prev + 1)}
                  hitSlop={8}
                >
                  <Text style={styles.nextTipText}>Next Hack</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                </Pressable>
              </View>

              <Text style={styles.coachTitle}>{currentTip.title}</Text>
              <Text style={styles.coachBody}>{currentTip.body}</Text>
            </View>

            {/* 3. Explore Foods & Recipes Banner Card */}
            <Pressable
              style={styles.exploreCard}
              onPress={() => router.push("/search")}
            >
              <View style={styles.exploreIconWrap}>
                <Ionicons name="search" size={18} color={colors.primary} />
              </View>
              <View style={styles.exploreContent}>
                <Text style={styles.exploreTitle}>Explore Foods</Text>
                <Text style={styles.exploreSubtitle}>
                  Search 100+ cultural recipes, custom meals & raw food database
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>

            {/* 4. Weekly Nutrient Progress */}
            <Text style={styles.sectionTitle}>Weekly Nutrient Progress</Text>

            <View style={styles.nutrientCards}>
              {nutrients.map((n) => (
                <View key={n.key} style={styles.gr}>
                  <View style={styles.grTop}>
                    <Text style={styles.grLabel}>{n.label}</Text>
                    <Text style={styles.grStatus}>{n.status}</Text>
                  </View>
                  <View style={styles.grTrack}>
                    <View
                      style={[
                        styles.grFill,
                        {
                          width: `${Math.min(100, n.fraction * 100)}%`,
                          backgroundColor: colors[n.color],
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Decide Tonight's Dinner"
          onPress={() => router.push("/(app)/dish-decider")}
        />
        <Button
          title="Explore Foods"
          variant="secondary"
          icon="search-outline"
          style={{ marginTop: spacing.sm }}
          onPress={() => router.push("/search")}
        />
      </View>
    </ScreenContainer>
  );
}

function getStyles(colors: ThemeColors, preference: string) {
  return StyleSheet.create({
    body: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xxl,
    },
    loadingBox: {
      paddingVertical: spacing.xxl,
      alignItems: "center",
      justifyContent: "center",
    },

    // 1. 7-Day Strip
    weekStrip: {
      flexDirection: "row",
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    dayCol: {
      flex: 1,
      alignItems: "center",
    },
    dayLabel: {
      fontSize: 11,
      fontFamily: fontFamily.bodyBold,
      color: colors.textMuted,
      marginBottom: 5,
    },
    dayLabelToday: {
      color: colors.accent,
      fontFamily: fontFamily.bodyBold,
    },
    dayBar: {
      height: 32,
      width: "100%",
      borderRadius: 9,
      backgroundColor: colors.surfaceAlt,
    },
    dayMealName: {
      fontSize: 8.5,
      fontFamily: fontFamily.bodyMedium,
      color: colors.textMuted,
      marginTop: 3,
    },
    dayEmptyDot: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: -2,
    },

    // 2. Coach Card
    coachCard: {
      backgroundColor: preference === "dark" ? "rgba(20, 168, 92, 0.12)" : colors.primaryTint,
      borderRadius: radius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.primary,
      marginBottom: spacing.lg,
    },
    coachHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    coachBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radius.pill,
    },
    coachBadgeText: {
      fontSize: 9.5,
      fontFamily: fontFamily.bodyBold,
      letterSpacing: 0.5,
    },
    nextTipBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },
    nextTipText: {
      fontSize: fontSize.xs,
      fontFamily: fontFamily.bodyBold,
      color: colors.primary,
    },
    coachTitle: {
      fontSize: fontSize.sm + 1,
      fontFamily: fontFamily.bodyBold,
      color: colors.text,
      marginTop: 2,
    },
    coachBody: {
      fontSize: 11.5,
      fontFamily: fontFamily.bodyMedium,
      color: colors.textMuted,
      marginTop: 4,
      lineHeight: 17,
    },

    // 3. Explore Card
    exploreCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.lg,
      gap: spacing.sm + 2,
    },
    exploreIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    exploreContent: {
      flex: 1,
    },
    exploreTitle: {
      fontSize: fontSize.sm + 1,
      fontFamily: fontFamily.bodyBold,
      color: colors.text,
    },
    exploreSubtitle: {
      fontSize: 11,
      fontFamily: fontFamily.bodyMedium,
      color: colors.textMuted,
      marginTop: 2,
      lineHeight: 15,
    },

    // Section title
    sectionTitle: {
      fontSize: fontSize.xs + 1,
      fontFamily: fontFamily.bodyBold,
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: spacing.xs + 2,
    },

    // 3. Nutrient Cards
    nutrientCards: {
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    gr: {
      backgroundColor: colors.surfaceAlt,
      padding: spacing.sm + 2,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    grTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 6,
    },
    grLabel: {
      fontSize: fontSize.xs + 1,
      fontFamily: fontFamily.bodyBold,
      color: colors.text,
    },
    grStatus: {
      fontSize: 11,
      fontFamily: fontFamily.bodyMedium,
      color: colors.textMuted,
    },
    grTrack: {
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.surface,
      overflow: "hidden",
    },
    grFill: {
      height: "100%",
      borderRadius: 4,
    },

    footer: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      paddingTop: spacing.xs,
    },
  });
}
