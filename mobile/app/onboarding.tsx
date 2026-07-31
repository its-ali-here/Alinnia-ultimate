import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FormInput } from "../components/FormInput";
import { colors, fontFamily, fontSize, spacing } from "../lib/theme";

const CUISINE = "Pakistani";

/**
 * Fallback for a session that exists but never finished the (setup) wizard's
 * final step (e.g. email-confirmation-pending accounts). Same questions,
 * minus account creation since a session already exists.
 */
export default function Onboarding() {
  const { refreshProfile } = useAuth();
  const [householdSize, setHouseholdSize] = useState(2);
  const [avoidMeat, setAvoidMeat] = useState(false);
  const [avoidSpicy, setAvoidSpicy] = useState(false);
  const [allergiesText, setAllergiesText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    const allergies = allergiesText
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    const { error } = await supabase.rpc("complete_onboarding", {
      p_household_size: householdSize,
      p_cuisine: CUISINE,
      p_avoid_meat: avoidMeat,
      p_avoid_spicy: avoidSpicy,
      p_allergies: allergies,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Something went wrong", error.message);
      return;
    }
    await refreshProfile();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Let's finish setting up</Text>
      <Text style={styles.subtitle}>We'll suggest {CUISINE} dishes and scale ingredients to your household.</Text>

      <Text style={styles.label}>How many people are you cooking for?</Text>
      <View style={styles.stepper}>
        <Button title="−" variant="secondary" onPress={() => setHouseholdSize((n) => Math.max(1, n - 1))} />
        <Text style={styles.stepperValue}>{householdSize}</Text>
        <Button title="+" variant="secondary" onPress={() => setHouseholdSize((n) => Math.min(12, n + 1))} />
      </View>

      <Card>
        <View style={styles.row}>
          <View style={styles.rowLabel}>
            <Ionicons name="paw-outline" size={18} color={colors.primary} />
            <Text style={styles.rowText}>Skip meat dishes</Text>
          </View>
          <Switch value={avoidMeat} onValueChange={setAvoidMeat} trackColor={{ true: colors.primary }} />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={styles.rowLabel}>
            <Ionicons name="flame-outline" size={18} color={colors.primary} />
            <Text style={styles.rowText}>Skip spicy dishes</Text>
          </View>
          <Switch value={avoidSpicy} onValueChange={setAvoidSpicy} trackColor={{ true: colors.primary }} />
        </View>
      </Card>

      <FormInput
        label="Any allergies or ingredients to avoid? (comma separated)"
        value={allergiesText}
        onChangeText={setAllergiesText}
        placeholder="e.g. peanuts, yogurt"
      />

      <Button title="Start cooking" icon="checkmark" onPress={handleSubmit} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: spacing.xl * 2 },
  title: { fontSize: fontSize.xxl, fontFamily: fontFamily.displayBold, color: colors.text },
  subtitle: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xl },
  label: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyMedium, color: colors.text },
  stepper: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.sm, marginBottom: spacing.lg },
  stepperValue: { fontSize: fontSize.xl, fontFamily: fontFamily.displayBold, color: colors.text, minWidth: 32, textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.xs },
  rowLabel: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  rowText: { fontSize: fontSize.md, fontFamily: fontFamily.bodyMedium, color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
});
