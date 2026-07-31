import { StyleSheet, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { FormInput } from "../../components/FormInput";
import { StepProgress } from "../../components/StepProgress";
import { useOnboardingDraft } from "../../contexts/OnboardingDraft";
import { colors, fontFamily, fontSize, spacing } from "../../lib/theme";

export default function Preferences() {
  const { avoidMeat, setAvoidMeat, avoidSpicy, setAvoidSpicy, allergiesText, setAllergiesText } = useOnboardingDraft();

  return (
    <View style={styles.container}>
      <StepProgress step={2} total={3} />

      <Text style={styles.title}>Any preferences?</Text>
      <Text style={styles.subtitle}>We'll only suggest dishes that fit.</Text>

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

      <View style={styles.footer}>
        <Button title="Next" icon="arrow-forward" onPress={() => router.push("/(setup)/create-account")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: spacing.xxl },
  title: { fontSize: fontSize.xxl, fontFamily: fontFamily.displayBold, color: colors.text },
  subtitle: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xl },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.xs },
  rowLabel: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  rowText: { fontSize: fontSize.md, fontFamily: fontFamily.bodyMedium, color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  footer: { marginTop: "auto", paddingBottom: spacing.md },
});
