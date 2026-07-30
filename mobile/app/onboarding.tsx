import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { Button } from "../components/Button";
import { FormInput } from "../components/FormInput";
import { colors, spacing } from "../lib/theme";

const CUISINE = "Pakistani";

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
      <Text style={styles.title}>Let's set up your kitchen</Text>
      <Text style={styles.subtitle}>
        We'll suggest {CUISINE} dishes and scale ingredients to your household.
      </Text>

      <Text style={styles.label}>How many people are you cooking for?</Text>
      <View style={styles.stepper}>
        <Button title="−" variant="secondary" onPress={() => setHouseholdSize((n) => Math.max(1, n - 1))} />
        <Text style={styles.stepperValue}>{householdSize}</Text>
        <Button title="+" variant="secondary" onPress={() => setHouseholdSize((n) => Math.min(12, n + 1))} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Skip meat dishes</Text>
        <Switch value={avoidMeat} onValueChange={setAvoidMeat} trackColor={{ true: colors.primary }} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Skip spicy dishes</Text>
        <Switch value={avoidSpicy} onValueChange={setAvoidSpicy} trackColor={{ true: colors.primary }} />
      </View>

      <FormInput
        label="Any allergies or ingredients to avoid? (comma separated)"
        value={allergiesText}
        onChangeText={setAllergiesText}
        placeholder="e.g. peanuts, yogurt"
      />

      <Button title="Start" onPress={handleSubmit} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: spacing.xl * 2 },
  title: { fontSize: 26, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: 15, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xl },
  label: { fontSize: 15, fontWeight: "600", color: colors.text },
  stepper: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.sm, marginBottom: spacing.lg },
  stepperValue: { fontSize: 20, fontWeight: "700", color: colors.text, minWidth: 32, textAlign: "center" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
});
