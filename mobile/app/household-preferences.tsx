import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../components/Button";
import { ScreenContainer } from "../components/ScreenContainer";
import { SpiceSlider } from "../components/SpiceSlider";
import { useAuth } from "../lib/auth";
import { useOnboardingDraft } from "../contexts/OnboardingDraft";
import { useTheme } from "../contexts/ThemeContext";
import {
  createNewMember,
  getHouseholdMembers,
  saveHouseholdMembers,
  type HouseholdMember,
} from "../lib/householdService";
import { fontFamily, fontSize, radius, spacing, type ThemeColors } from "../lib/theme";

const ALL_NEEDS = [
  { key: "diabetic", label: "Diabetic / Low Sugar", icon: "water-outline" },
  { key: "training_hard", label: "High Protein / Fitness", icon: "fitness-outline" },
  { key: "high_blood_pressure", label: "High BP / Low Salt", icon: "heart-outline" },
  { key: "pregnant", label: "Pregnant / Nutrient-Dense", icon: "leaf-outline" },
  { key: "fussy_eater", label: "Fussy Eater", icon: "restaurant-outline" },
];

const ALL_AVOIDS = [
  { key: "beef", label: "No Beef", emoji: "🥩" },
  { key: "seafood", label: "No Seafood", emoji: "🐟" },
  { key: "dairy", label: "No Dairy", emoji: "🥛" },
  { key: "eggs", label: "No Eggs", emoji: "🥚" },
  { key: "nuts", label: "No Nuts", emoji: "🥜" },
];

const FAVORITE_CATEGORIES = [
  { key: "curries", label: "Karahi & Curries", emoji: "🍛" },
  { key: "rice", label: "Biryani & Pulao", emoji: "🍚" },
  { key: "daal", label: "Daal & Sabzi", emoji: "🌾" },
  { key: "bbq", label: "Tikka & Kebabs", emoji: "🍢" },
];

const SPICE_LABELS: Record<number, { title: string; desc: string; color: string }> = {
  1: { title: "Mild (No Mirch)", desc: "Kid safe · subtle pepper only", color: "#14A85C" },
  2: { title: "Medium-Mild", desc: "Gentle warmth · slight zeera & black pepper", color: "#8FE64B" },
  3: { title: "Medium (Standard Desi)", desc: "Balanced green chili & red chili heat", color: "#FFC233" },
  4: { title: "Spicy", desc: "Authentic kick · extra green chilies", color: "#F0563E" },
  5: { title: "Teekha (Lahori Hot)", desc: "Fiery masala heat · extra red chili", color: "#E02D15" },
};

export default function HouseholdPreferences() {
  const { colors, preference } = useTheme();
  const styles = getStyles(colors, preference);
  const { session, profile } = useAuth();
  const { adultsCount, childrenCount } = useOnboardingDraft();
  const userId = session?.user.id ?? "anonymous";
  const params = useLocalSearchParams<{ memberId?: string }>();

  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string>(params.memberId || "");

  useEffect(() => {
    getHouseholdMembers(userId, profile, adultsCount, childrenCount).then((loaded) => {
      setMembers(loaded);
      if (!selectedPersonId && loaded.length > 0) {
        setSelectedPersonId(params.memberId || loaded[0].id);
      }
    });
  }, [userId, profile, adultsCount, childrenCount, params.memberId]);

  const activePerson = members.find((m) => m.id === selectedPersonId) ?? members[0];

  function updateActivePerson(updater: (prev: HouseholdMember) => HouseholdMember) {
    if (!activePerson) return;
    const next = members.map((m) => (m.id === activePerson.id ? updater(m) : m));
    setMembers(next);
    saveHouseholdMembers(userId, next);
  }

  function handleAddMember() {
    Alert.prompt
      ? Alert.prompt("Add Family Member", "Enter their name (e.g. Fatima, Bilal, Dadi):", (name) => {
          if (!name?.trim()) return;
          const newMember = createNewMember(name, members.length);
          const next = [...members, newMember];
          setMembers(next);
          setSelectedPersonId(newMember.id);
          saveHouseholdMembers(userId, next);
        })
      : Alert.alert("Add Member", "Manage portion sizes and diets for new household members.", [{ text: "OK" }]);
  }

  function handleRenameMember() {
    if (!activePerson) return;
    Alert.prompt
      ? Alert.prompt("Edit Name", "Enter new name:", (name) => {
          if (!name?.trim()) return;
          updateActivePerson((prev) => ({
            ...prev,
            name: name.trim(),
            avatar: name.trim().charAt(0).toUpperCase(),
          }));
        }, "plain-text", activePerson.name)
      : null;
  }

  function handleDeleteMember() {
    if (!activePerson || members.length <= 1) {
      Alert.alert("Cannot Remove", "You must have at least one person at your table.");
      return;
    }
    Alert.alert("Remove Member", `Are you sure you want to remove ${activePerson.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          const next = members.filter((m) => m.id !== activePerson.id);
          setMembers(next);
          setSelectedPersonId(next[0].id);
          saveHouseholdMembers(userId, next);
        },
      },
    ]);
  }

  const spiceInfo = activePerson ? (SPICE_LABELS[activePerson.spiceLevel] ?? SPICE_LABELS[3]) : SPICE_LABELS[3];

  if (!activePerson) return null;

  return (
    <ScreenContainer topSpacing={spacing.sm}>
      {/* Back Navigation Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Preferences & Habits</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Horizontal Person Avatar Rail */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.avatarRail}
        >
          {members.map((person) => {
            const isSelected = person.id === activePerson.id;
            return (
              <Pressable
                key={person.id}
                style={[
                  styles.personCard,
                  isSelected && styles.personCardActive,
                ]}
                onPress={() => setSelectedPersonId(person.id)}
              >
                <View style={[styles.avatarCircle, { backgroundColor: person.bgColor }]}>
                  <Text style={[styles.avatarText, { color: person.textColor ?? colors.primaryText }]}>
                    {person.avatar}
                  </Text>
                </View>
                <Text style={[styles.personCardName, isSelected && styles.personCardNameActive]} numberOfLines={1}>
                  {person.name}
                </Text>
              </Pressable>
            );
          })}

          <Pressable style={styles.addPersonCard} onPress={handleAddMember}>
            <View style={styles.addPersonCircle}>
              <Ionicons name="add" size={20} color={colors.primary} />
            </View>
            <Text style={styles.addPersonText}>Add</Text>
          </Pressable>
        </ScrollView>

        {/* ===================== UNIFIED SINGLE SECTION CARD ===================== */}
        <View style={styles.sectionCard}>
          <View style={styles.personHeaderRow}>
            <Text style={styles.personHeaderTitle}>{activePerson.name}'s Settings</Text>
            <View style={styles.personActions}>
              <Pressable onPress={handleRenameMember} hitSlop={6} style={styles.personActionBtn}>
                <Ionicons name="pencil-outline" size={14} color={colors.primary} />
                <Text style={styles.personActionText}>Rename</Text>
              </Pressable>
              {members.length > 1 ? (
                <Pressable onPress={handleDeleteMember} hitSlop={6} style={styles.personActionBtn}>
                  <Ionicons name="trash-outline" size={14} color={colors.danger} />
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* 1. Portion Size */}
          <Text style={styles.sectionHeading}>Portion Size</Text>
          <View style={styles.portionRow}>
            {(
              [
                { key: "small", label: "Small / Kid", scale: "0.75x serving" },
                { key: "standard", label: "Standard", scale: "1.0x serving" },
                { key: "large", label: "Large / Gym", scale: "1.5x serving" },
              ] as const
            ).map((p) => {
              const isSelected = activePerson.portion === p.key;
              return (
                <Pressable
                  key={p.key}
                  style={[styles.portionTile, isSelected && styles.portionTileActive]}
                  onPress={() => updateActivePerson((prev) => ({ ...prev, portion: p.key }))}
                >
                  <Text style={[styles.portionLabel, isSelected && styles.portionLabelActive]}>
                    {p.label}
                  </Text>
                  <Text style={styles.portionScale}>{p.scale}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* 2. Spice Tolerance (1 to 5) */}
          <Text style={[styles.sectionHeading, { marginTop: spacing.md }]}>Spice Level (1 to 5)</Text>
          <View style={[styles.spiceCallout, { borderColor: spiceInfo.color }]}>
            <View style={styles.spiceCalloutTop}>
              <Text style={styles.spiceCalloutLevel}>Level {activePerson.spiceLevel} / 5</Text>
              <Text style={[styles.spiceCalloutTitle, { color: spiceInfo.color }]}>
                {spiceInfo.title}
              </Text>
            </View>
            <Text style={styles.spiceCalloutDesc}>{spiceInfo.desc}</Text>
          </View>
          <View style={styles.sliderWrap}>
            <SpiceSlider
              level={activePerson.spiceLevel}
              onChange={(lvl) => updateActivePerson((prev) => ({ ...prev, spiceLevel: lvl }))}
            />
          </View>

          {/* 3. Health & Dietary Needs */}
          <Text style={[styles.sectionHeading, { marginTop: spacing.md }]}>Health & Dietary Needs</Text>
          <View style={styles.chipsWrap}>
            {ALL_NEEDS.map((need) => {
              const active = activePerson.needs.includes(need.key);
              return (
                <Pressable
                  key={need.key}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() =>
                    updateActivePerson((prev) => ({
                      ...prev,
                      needs: active
                        ? prev.needs.filter((k) => k !== need.key)
                        : [...prev.needs, need.key],
                    }))
                  }
                >
                  <Ionicons
                    name={need.icon as any}
                    size={14}
                    color={active ? colors.primaryText : colors.text}
                  />
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {need.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* 4. Dietary Avoids & Allergies */}
          <Text style={[styles.sectionHeading, { marginTop: spacing.md }]}>Dietary Avoids & Allergies</Text>
          <View style={styles.chipsWrap}>
            {ALL_AVOIDS.map((item) => {
              const active = activePerson.avoids.includes(item.key);
              return (
                <Pressable
                  key={item.key}
                  style={[styles.chip, active && styles.chipAvoidActive]}
                  onPress={() =>
                    updateActivePerson((prev) => ({
                      ...prev,
                      avoids: active
                        ? prev.avoids.filter((k) => k !== item.key)
                        : [...prev.avoids, item.key],
                    }))
                  }
                >
                  <Text style={[styles.chipText, active && styles.chipAvoidTextActive]}>
                    {item.emoji} {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* 5. Favorite Meal Type */}
          <Text style={[styles.sectionHeading, { marginTop: spacing.md }]}>Favorite Food</Text>
          <View style={styles.chipsWrap}>
            {FAVORITE_CATEGORIES.map((cat) => {
              const active = activePerson.favoriteCategory === cat.key;
              return (
                <Pressable
                  key={cat.key}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() =>
                    updateActivePerson((prev) => ({ ...prev, favoriteCategory: cat.key }))
                  }
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {cat.emoji} {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Save & Return to Table"
          onPress={() => {
            Alert.alert("Saved", "Preferences and habits updated for your household.");
            router.back();
          }}
        />
      </View>
    </ScreenContainer>
  );
}

function getStyles(colors: ThemeColors, preference: string) {
  return StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.xs,
    },
    backButton: {
      padding: 4,
      marginLeft: -4,
    },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      fontSize: fontSize.lg,
      fontFamily: fontFamily.bodyBold,
      color: colors.text,
    },
    headerSpacer: {
      width: 26,
    },
    body: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xl,
    },
    avatarRail: {
      gap: spacing.sm,
      paddingVertical: spacing.xs,
      marginBottom: spacing.sm,
    },
    personCard: {
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1.5,
      borderColor: colors.border,
      minWidth: 78,
    },
    personCardActive: {
      backgroundColor: colors.primaryTint,
      borderColor: colors.primary,
    },
    avatarCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 6,
    },
    avatarText: {
      fontFamily: fontFamily.displayBold,
      fontSize: 16,
      fontWeight: "700",
    },
    personCardName: {
      fontSize: fontSize.xs,
      fontFamily: fontFamily.bodyBold,
      color: colors.text,
    },
    personCardNameActive: {
      color: colors.primary,
    },
    personCardPortion: {
      fontSize: 10,
      fontFamily: fontFamily.body,
      color: colors.textMuted,
      marginTop: 2,
    },
    addPersonCard: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderStyle: "dashed",
      borderColor: colors.border,
      minWidth: 70,
    },
    addPersonCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 6,
    },
    addPersonText: {
      fontSize: fontSize.xs,
      fontFamily: fontFamily.bodyBold,
      color: colors.primary,
    },

    personHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.md,
      paddingBottom: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    personHeaderTitle: {
      fontSize: fontSize.md,
      fontFamily: fontFamily.bodyBold,
      color: colors.primary,
    },
    personActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    personActionBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceAlt,
    },
    personActionText: {
      fontSize: fontSize.xs,
      fontFamily: fontFamily.bodyBold,
      color: colors.primary,
    },

    sectionCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionHeading: {
      fontSize: fontSize.sm,
      fontFamily: fontFamily.bodyBold,
      color: colors.text,
      marginBottom: spacing.xs + 2,
    },
    portionRow: {
      flexDirection: "row",
      gap: spacing.xs,
    },
    portionTile: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 4,
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    portionTileActive: {
      backgroundColor: colors.primaryTint,
      borderColor: colors.primary,
    },
    portionLabel: {
      fontSize: 11.5,
      fontFamily: fontFamily.bodyBold,
      color: colors.text,
      textAlign: "center",
    },
    portionLabelActive: {
      color: colors.primary,
    },
    portionScale: {
      fontSize: 10,
      fontFamily: fontFamily.body,
      color: colors.textMuted,
      marginTop: 2,
    },

    chipsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: fontSize.xs,
      fontFamily: fontFamily.bodyMedium,
      color: colors.text,
    },
    chipTextActive: {
      color: colors.primaryText,
      fontFamily: fontFamily.bodyBold,
    },
    chipAvoidActive: {
      backgroundColor: colors.danger,
      borderColor: colors.danger,
    },
    chipAvoidTextActive: {
      color: "#FFFFFF",
      fontFamily: fontFamily.bodyBold,
    },

    spiceCallout: {
      padding: spacing.sm + 2,
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceAlt,
      borderLeftWidth: 4,
      marginBottom: spacing.xs,
    },
    spiceCalloutTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 2,
    },
    spiceCalloutLevel: {
      fontSize: 11,
      fontFamily: fontFamily.bodyBold,
      color: colors.textMuted,
    },
    spiceCalloutTitle: {
      fontSize: fontSize.sm,
      fontFamily: fontFamily.bodyBold,
    },
    spiceCalloutDesc: {
      fontSize: fontSize.xs,
      fontFamily: fontFamily.body,
      color: colors.textMuted,
    },
    sliderWrap: {
      paddingVertical: spacing.xs,
    },

    footer: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
  });
}

