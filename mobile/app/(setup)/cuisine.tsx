import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Button } from "../../components/Button";
import { ScreenContainer } from "../../components/ScreenContainer";
import { SelectTile } from "../../components/SelectTile";
import { StepHeader } from "../../components/StepHeader";
import { useOnboardingDraft } from "../../contexts/OnboardingDraft";
import { REGIONS_AND_COUNTRIES } from "../../lib/cuisineData";
import { useTheme } from "../../contexts/ThemeContext";
import { fontFamily, fontSize, radius, spacing, type ThemeColors } from "../../lib/theme";

export default function Cuisine() {
  const { colors, preference } = useTheme();
  const styles = getStyles(colors, preference);
  const { cuisines, toggleCuisine } = useOnboardingDraft();
  const [selectedCountryId, setSelectedCountryId] = useState<string>("pakistan");

  const currentCountry =
    REGIONS_AND_COUNTRIES.find((c) => c.id === selectedCountryId) ??
    REGIONS_AND_COUNTRIES[0];

  function next() {
    router.push("/(setup)/household");
  }

  return (
    <ScreenContainer>
      <StepHeader
        step={1}
        total={8}
        title="Whose food do you cook?"
        subtitle="Choose your country, then select your household's favorite traditions."
      />

      {/* Country Selector Segmented Row */}
      <View style={styles.countrySection}>
        <View style={styles.countryRow}>
          {REGIONS_AND_COUNTRIES.map((country) => {
            const isSelected = country.id === currentCountry.id;
            const countInCountry = country.cuisines.filter((c) =>
              cuisines.includes(c.name)
            ).length;

            return (
              <Pressable
                key={country.id}
                style={[styles.countryTab, isSelected && styles.countryTabActive]}
                onPress={() => setSelectedCountryId(country.id)}
              >
                <Text style={styles.countryFlag}>{country.flag}</Text>
                <Text
                  style={[
                    styles.countryLabel,
                    isSelected && styles.countryLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {country.shortLabel}
                </Text>
                {countInCountry > 0 ? (
                  <View style={styles.countryBadge}>
                    <Text style={styles.countryBadgeText}>{countInCountry}</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Traditions Grid for Selected Country */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.countryHeaderRow}>
          <Text style={styles.countryHeading}>
            {currentCountry.flag} {currentCountry.name} Traditions
          </Text>
        </View>

        <View style={styles.grid}>
          {currentCountry.cuisines.map((cuisine) => (
            <SelectTile
              key={cuisine.name}
              title={cuisine.name}
              subtitle={cuisine.subtitle}
              selected={cuisines.includes(cuisine.name)}
              onPress={() => toggleCuisine(cuisine.name)}
              style={styles.tile}
            />
          ))}
        </View>
      </ScrollView>

      {/* Footer Summary & Continue Action */}
      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            {cuisines.length === 0
              ? "Select at least 1 cuisine"
              : `${cuisines.length} selected: ${cuisines.slice(0, 3).join(", ")}${
                  cuisines.length > 3 ? ` +${cuisines.length - 3} more` : ""
                }`}
          </Text>
        </View>
        <Button title="Continue" onPress={next} disabled={cuisines.length === 0} />
      </View>
    </ScreenContainer>
  );
}

function getStyles(colors: ThemeColors, preference: string) {
  return StyleSheet.create({
    countrySection: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xs + 2,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surfaceAlt,
    },
    countryRow: {
      flexDirection: "row",
      gap: spacing.xs,
    },
    countryTab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      paddingVertical: 9,
      paddingHorizontal: 4,
      borderRadius: radius.pill,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    countryTabActive: {
      backgroundColor: colors.primaryTint,
      borderColor: colors.primary,
    },
    countryFlag: {
      fontSize: 16,
    },
    countryLabel: {
      fontSize: 11.5,
      fontFamily: fontFamily.bodyBold,
      color: colors.textMuted,
    },
    countryLabelActive: {
      color: colors.primary,
    },
    countryBadge: {
      backgroundColor: colors.primary,
      borderRadius: 9,
      width: 17,
      height: 17,
      alignItems: "center",
      justifyContent: "center",
    },
    countryBadgeText: {
      fontSize: 9.5,
      fontFamily: fontFamily.bodyBold,
      color: colors.primaryText,
    },

    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
    },
    countryHeaderRow: {
      marginBottom: spacing.sm,
    },
    countryHeading: {
      fontSize: fontSize.sm,
      fontFamily: fontFamily.bodyBold,
      color: colors.text,
      letterSpacing: 0.3,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    tile: {
      minWidth: "47%",
      flex: 1,
    },

    footer: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      paddingTop: spacing.xs,
    },
    summaryRow: {
      alignItems: "center",
      marginBottom: spacing.xs,
    },
    summaryText: {
      fontSize: fontSize.xs,
      fontFamily: fontFamily.bodyMedium,
      color: colors.textMuted,
    },
  });
}
