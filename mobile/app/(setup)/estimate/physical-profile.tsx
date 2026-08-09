import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DarkDropdown } from "../../../components/DarkDropdown";
import { PillButton } from "../../../components/PillButton";
import { ScreenContainer } from "../../../components/ScreenContainer";
import { SelectableBox } from "../../../components/SelectableBox";
import { WizardHeader } from "../../../components/WizardHeader";
import { useOnboardingDraft } from "../../../contexts/OnboardingDraft";
import { darkColors, fontFamily, fontSize, spacing } from "../../../lib/theme";
import type { BioSex, BodyFat } from "../../../lib/estimateNutrition";

const FEET_OPTIONS = Array.from({ length: 8 }, (_, i) => i + 1).map((n) => ({ label: `${n} ft`, value: String(n) }));
const INCHES_OPTIONS = Array.from({ length: 12 }, (_, i) => i).map((n) => ({ label: `${n} in`, value: String(n) }));

export default function PhysicalProfile() {
  const {
    unitSystem,
    heightFeet,
    setHeightFeet,
    heightInches,
    setHeightInches,
    heightCm,
    setHeightCm,
    weightLb,
    setWeightLb,
    weightKg,
    setWeightKg,
    bioSex,
    setBioSex,
    age,
    setAge,
    bodyFat,
    setBodyFat,
  } = useOnboardingDraft();

  function next() {
    router.push("/(setup)/estimate/goal");
  }

  return (
    <ScreenContainer>
      <WizardHeader title="Physical profile" actionLabel="Next" onAction={next} />

      <View style={styles.content}>
        <Text style={styles.description}>
          Eat This Much uses RMR (Resting Metabolic Rate) to estimate your nutrition budget, which uses height,
          weight, biological sex, and age as inputs.
        </Text>

        <View style={styles.fieldRow}>
          <Text style={styles.label}>Height</Text>
          {unitSystem === "us" ? (
            <View style={styles.heightRow}>
              <DarkDropdown
                options={FEET_OPTIONS}
                value={String(heightFeet)}
                onChange={(v) => setHeightFeet(Number(v))}
                style={styles.heightDropdown}
              />
              <DarkDropdown
                options={INCHES_OPTIONS}
                value={String(heightInches)}
                onChange={(v) => setHeightInches(Number(v))}
                style={styles.heightDropdown}
              />
            </View>
          ) : (
            <View style={styles.inlineInput}>
              <TextInput
                value={String(heightCm)}
                onChangeText={(t) => setHeightCm(Number(t.replace(/[^0-9]/g, "")) || 0)}
                keyboardType="number-pad"
                style={styles.numberInput}
              />
              <Text style={styles.suffix}>cm</Text>
            </View>
          )}
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.label}>Weight</Text>
          {unitSystem === "us" ? (
            <View style={styles.inlineInput}>
              <TextInput
                value={String(weightLb)}
                onChangeText={(t) => setWeightLb(Number(t.replace(/[^0-9]/g, "")) || 0)}
                keyboardType="number-pad"
                style={styles.numberInput}
              />
              <Text style={styles.suffix}>lbs</Text>
            </View>
          ) : (
            <View style={styles.inlineInput}>
              <TextInput
                value={String(weightKg)}
                onChangeText={(t) => setWeightKg(Number(t.replace(/[^0-9]/g, "")) || 0)}
                keyboardType="number-pad"
                style={styles.numberInput}
              />
              <Text style={styles.suffix}>kg</Text>
            </View>
          )}
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.label}>Biological sex</Text>
          <Ionicons
            name="help-circle-outline"
            size={20}
            color={darkColors.text}
            onPress={() => Alert.alert("Biological sex", "Used as an input to the RMR formula.")}
          />
        </View>
        <View style={styles.triRow}>
          {(["female", "male", "other"] as BioSex[]).map((sex) => (
            <SelectableBox
              key={sex}
              label={sex[0].toUpperCase() + sex.slice(1)}
              selected={bioSex === sex}
              onPress={() => setBioSex(sex)}
              style={styles.triBox}
            />
          ))}
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.label}>Age</Text>
          <View style={styles.inlineInput}>
            <TextInput
              value={String(age)}
              onChangeText={(t) => setAge(Number(t.replace(/[^0-9]/g, "")) || 0)}
              keyboardType="number-pad"
              style={styles.numberInput}
            />
          </View>
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.label}>Body fat</Text>
          <Ionicons
            name="help-circle-outline"
            size={20}
            color={darkColors.text}
            onPress={() => Alert.alert("Body fat", "A rough estimate of your body fat level — used to nudge the RMR estimate.")}
          />
        </View>
        <View style={styles.triRow}>
          {(["low", "medium", "high"] as BodyFat[]).map((level) => (
            <SelectableBox
              key={level}
              label={level[0].toUpperCase() + level.slice(1)}
              selected={bodyFat === level}
              onPress={() => setBodyFat(level)}
              style={styles.triBox}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <PillButton title="Next" variant="coral" onPress={next} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg },
  description: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: darkColors.text, lineHeight: 20, marginBottom: spacing.xl },
  fieldRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  label: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: darkColors.text },
  labelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
  heightRow: { flexDirection: "row", gap: spacing.lg },
  heightDropdown: { width: 90 },
  inlineInput: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: darkColors.border,
    minWidth: 90,
    paddingBottom: spacing.xs,
  },
  numberInput: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: darkColors.text, padding: 0, minWidth: 40 },
  suffix: { fontSize: fontSize.sm, fontFamily: fontFamily.body, color: darkColors.textMuted },
  triRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.xl },
  triBox: { flex: 1, marginBottom: 0 },
  footer: { marginTop: "auto", paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
});
