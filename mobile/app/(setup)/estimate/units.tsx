import { Alert, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DarkDropdown } from "../../../components/DarkDropdown";
import { PillButton } from "../../../components/PillButton";
import { ScreenContainer } from "../../../components/ScreenContainer";
import { SelectableBox } from "../../../components/SelectableBox";
import { WizardHeader } from "../../../components/WizardHeader";
import { useOnboardingDraft } from "../../../contexts/OnboardingDraft";
import { darkColors, fontFamily, fontSize, spacing } from "../../../lib/theme";

const ENERGY_OPTIONS = [
  { label: "Calories", value: "calories" },
  { label: "Kilojoules", value: "kilojoules" },
];

export default function Units() {
  const { unitSystem, setUnitSystem, energyUnit, setEnergyUnit } = useOnboardingDraft();

  function next() {
    router.push("/(setup)/estimate/physical-profile");
  }

  return (
    <ScreenContainer>
      <WizardHeader title="Preferred units" actionLabel="Next" onAction={next} />

      <View style={styles.content}>
        <Text style={styles.question}>Which units of measurements do you prefer?</Text>

        <View style={styles.labelRow}>
          <Text style={styles.label}>Preferred units</Text>
          <Ionicons
            name="help-circle-outline"
            size={20}
            color={darkColors.text}
            onPress={() => Alert.alert("Preferred units", "This decides whether height and weight are entered in U.S. Standard (ft/in, lbs) or Metric (cm, kg).")}
          />
        </View>
        <SelectableBox label="U.S. Standard" selected={unitSystem === "us"} onPress={() => setUnitSystem("us")} />
        <SelectableBox label="Metric" selected={unitSystem === "metric"} onPress={() => setUnitSystem("metric")} />

        <View style={styles.energyRow}>
          <Text style={styles.label}>Preferred unit of energy</Text>
          <DarkDropdown options={ENERGY_OPTIONS} value={energyUnit} onChange={setEnergyUnit} style={styles.energyDropdown} />
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
  question: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.body,
    color: darkColors.text,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  label: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: darkColors.text },
  energyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xl,
  },
  energyDropdown: { width: 160 },
  footer: { marginTop: "auto", paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
});
