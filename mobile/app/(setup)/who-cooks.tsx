import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button } from "../../components/Button";
import { ScreenContainer } from "../../components/ScreenContainer";
import { SelectableBox } from "../../components/SelectableBox";
import { StepHeader } from "../../components/StepHeader";
import { useOnboardingDraft } from "../../contexts/OnboardingDraft";
import { spacing } from "../../lib/theme";

const OPTIONS = [
  { key: "solo", label: "I do" },
  { key: "helped", label: "Someone helps me" },
  { key: "shared", label: "We share it" },
];

export default function WhoCooks() {
  const { whoCooks, setWhoCooks } = useOnboardingDraft();

  function next() {
    router.push("/(setup)/avoids");
  }

  return (
    <ScreenContainer>
      <StepHeader step={4} total={8} title="Who does the cooking?" subtitle="If someone helps, we'll give you a card you can send them." />

      <View style={styles.content}>
        {OPTIONS.map((option) => (
          <SelectableBox
            key={option.key}
            label={option.label}
            selected={whoCooks === option.key}
            onPress={() => setWhoCooks(option.key)}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Button title="Continue" onPress={next} disabled={!whoCooks} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, flex: 1 },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
});
