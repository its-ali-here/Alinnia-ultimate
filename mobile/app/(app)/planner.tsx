import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MacroDonut } from "../../components/MacroDonut";
import { ScreenContainer } from "../../components/ScreenContainer";
import { darkColors, fontFamily, fontSize, radius, spacing } from "../../lib/theme";
import { TODAYS_PLAN, TODAYS_TOTALS } from "../../lib/mockPlan";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function notImplemented(what: string) {
  Alert.alert("Coming soon", `${what} isn't built yet.`);
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function formatDate(date: Date) {
  const label = `${MONTH_LABELS[date.getMonth()]} ${date.getDate()}`;
  const today = new Date();
  if (isSameDay(date, today)) return `Today, ${label}`;
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (isSameDay(date, tomorrow)) return `Tomorrow, ${label}`;
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(date, yesterday)) return `Yesterday, ${label}`;
  return label;
}

export default function Planner() {
  const [view, setView] = useState<"day" | "week">("day");
  const [date, setDate] = useState(new Date());

  const trackedMeals = 0;
  const totalMeals = TODAYS_PLAN.filter((m) => !m.skipped).length;

  function shiftDay(delta: number) {
    setDate((d) => {
      const next = new Date(d);
      next.setDate(d.getDate() + delta);
      return next;
    });
  }

  return (
    <ScreenContainer style={styles.container} topSpacing={spacing.lg}>
      <View style={styles.header}>
        <Text style={styles.title}>Meal Plan</Text>
        <Pressable style={styles.actionsButton} onPress={() => notImplemented("Actions")}>
          <Text style={styles.actionsLabel}>Actions</Text>
          <Ionicons name="ellipsis-horizontal" size={16} color={darkColors.text} />
        </Pressable>
      </View>

      <View style={styles.segmented}>
        <Pressable style={[styles.segment, view === "day" && styles.segmentActive]} onPress={() => setView("day")}>
          <Text style={styles.segmentText}>Day</Text>
        </Pressable>
        <Pressable style={[styles.segment, view === "week" && styles.segmentActive]} onPress={() => setView("week")}>
          <Text style={styles.segmentText}>Week</Text>
        </Pressable>
      </View>

      {view === "week" ? (
        <View style={styles.weekPlaceholder}>
          <Text style={styles.weekPlaceholderText}>Week view is coming soon.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.dateRow}>
            <Pressable onPress={() => shiftDay(-1)} hitSlop={12}>
              <Ionicons name="chevron-back" size={20} color={darkColors.text} />
            </Pressable>
            <Text style={styles.dateText}>{formatDate(date)}</Text>
            <Pressable onPress={() => shiftDay(1)} hitSlop={12}>
              <Ionicons name="chevron-forward" size={20} color={darkColors.text} />
            </Pressable>
          </View>

          <Pressable style={styles.summaryRow} onPress={() => notImplemented("Nutrient breakdown")}>
            <MacroDonut
              segments={[
                { value: TODAYS_TOTALS.carbsG * 4, color: darkColors.carbs },
                { value: TODAYS_TOTALS.fatG * 9, color: darkColors.fat },
                { value: TODAYS_TOTALS.proteinG * 4, color: darkColors.protein },
              ]}
            />
            <View style={styles.summaryText}>
              <Text style={styles.summaryCalories}>{TODAYS_TOTALS.calories} Calories</Text>
              <Text style={styles.summaryMacros}>
                {TODAYS_TOTALS.carbsG}g Carbs, {TODAYS_TOTALS.fatG}g Fat, {TODAYS_TOTALS.proteinG}g Protein
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={darkColors.textMuted} />
          </Pressable>

          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>0%</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: "0%" }]} />
            </View>
          </View>
          <Text style={styles.trackedText}>
            Tracked {trackedMeals}/{totalMeals} meals
          </Text>

          <View style={styles.timeline}>
            <View style={styles.timelineLine} />
            {TODAYS_PLAN.map((section) => (
              <View key={section.key}>
                <View style={styles.timelineRow}>
                  <View style={[styles.dot, section.skipped && styles.dotSkipped]} />
                  <View style={styles.sectionHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sectionLabel}>{section.label}</Text>
                      {section.skipped ? (
                        <Pressable onPress={() => notImplemented("Choosing a meal")}>
                          <Text style={styles.chooseMeal}>Choose Meal</Text>
                        </Pressable>
                      ) : (
                        <Text style={styles.sectionCalories}>{section.calories} Calories</Text>
                      )}
                    </View>
                    <Pressable onPress={() => notImplemented(`${section.label} options`)} hitSlop={8}>
                      <Ionicons name="ellipsis-horizontal" size={18} color={darkColors.textMuted} />
                    </Pressable>
                  </View>
                </View>
                {section.skipped ? (
                  <Text style={styles.skippedNote}>
                    You skipped generating for this meal. You can re-enable generating in this meal's settings.
                  </Text>
                ) : null}

                {section.items.map((item) => (
                  <View key={item.id} style={styles.timelineRow}>
                    <View style={styles.dotSmallWrap}>
                      <View style={styles.dotSmall} />
                    </View>
                    <View style={styles.itemRow}>
                      <View style={[styles.itemThumb, { backgroundColor: item.color }]}>
                        <Text style={styles.itemEmoji}>{item.emoji}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemMeta}>
                          {item.servings} • {item.calories} Calories
                        </Text>
                      </View>
                      <Pressable onPress={() => notImplemented(`${item.name} options`)} hitSlop={8}>
                        <Ionicons name="ellipsis-horizontal" size={18} color={darkColors.textMuted} />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {},
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  title: { fontSize: 34, fontFamily: fontFamily.bodyBold, color: darkColors.text },
  actionsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: darkColors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionsLabel: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyMedium, color: darkColors.text },
  segmented: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: darkColors.border,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  segment: { flex: 1, paddingVertical: spacing.sm, alignItems: "center", justifyContent: "center" },
  segmentActive: { backgroundColor: darkColors.surfaceAlt },
  segmentText: { fontSize: fontSize.md, fontFamily: fontFamily.bodyMedium, color: darkColors.text },
  weekPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.lg },
  weekPlaceholderText: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: darkColors.textMuted },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  dateRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.lg, marginBottom: spacing.lg },
  dateText: { fontSize: fontSize.lg, fontFamily: fontFamily.bodyMedium, color: darkColors.text },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
  summaryText: { flex: 1 },
  summaryCalories: { fontSize: fontSize.lg, fontFamily: fontFamily.bodyMedium, color: darkColors.text },
  summaryMacros: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: darkColors.textMuted, marginTop: 2 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  progressLabel: { fontSize: fontSize.xs, fontFamily: fontFamily.body, color: darkColors.textMuted },
  progressTrack: { flex: 1, height: 3, backgroundColor: darkColors.border, borderRadius: 2 },
  progressFill: { height: 3, backgroundColor: darkColors.coral, borderRadius: 2 },
  trackedText: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: darkColors.textMuted, textAlign: "center", marginBottom: spacing.xl },
  timeline: { position: "relative" },
  timelineLine: { position: "absolute", left: 11, top: 14, bottom: 14, width: 2, backgroundColor: darkColors.border },
  timelineRow: { flexDirection: "row", gap: spacing.md },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: darkColors.coral,
    backgroundColor: darkColors.background,
    marginTop: 2,
  },
  dotSkipped: { borderColor: darkColors.textMuted },
  dotSmallWrap: { width: 24, height: 24, alignItems: "center", justifyContent: "center", marginTop: 2 },
  dotSmall: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: darkColors.border, backgroundColor: darkColors.background },
  sectionHeader: { flex: 1, flexDirection: "row", alignItems: "flex-start", paddingBottom: spacing.md },
  sectionLabel: { fontSize: fontSize.lg, fontFamily: fontFamily.bodyBold, color: darkColors.text },
  sectionCalories: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: darkColors.textMuted, marginTop: 2 },
  chooseMeal: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyMedium, color: darkColors.coral, marginTop: 2 },
  skippedNote: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.body,
    color: darkColors.textMuted,
    marginLeft: 24 + spacing.md,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  itemRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.md, paddingBottom: spacing.md },
  itemThumb: { width: 56, height: 56, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  itemEmoji: { fontSize: 26 },
  itemName: { fontSize: fontSize.md, fontFamily: fontFamily.bodyMedium, color: darkColors.text },
  itemMeta: { fontSize: fontSize.xs, fontFamily: fontFamily.body, color: darkColors.textMuted, marginTop: 2 },
});
