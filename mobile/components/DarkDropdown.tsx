import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { darkColors, fontFamily, fontSize, radius, spacing } from "../lib/theme";

export interface DropdownOption {
  label: string;
  value: string;
}

interface DarkDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  style?: ViewStyle;
}

export function DarkDropdown({ options, value, onChange, style }: DarkDropdownProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <Pressable style={[styles.trigger, style]} onPress={() => setOpen(true)}>
        <Text style={styles.triggerText}>{selected?.label ?? value}</Text>
        <Ionicons name="chevron-down" size={16} color={darkColors.coral} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.card}>
            <ScrollView bounces={false}>
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  style={styles.option}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, option.value === value && styles.optionTextSelected]}>{option.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: darkColors.coral,
    paddingBottom: spacing.xs,
  },
  triggerText: { fontSize: fontSize.md, fontFamily: fontFamily.body, color: darkColors.text },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: darkColors.surface, borderRadius: radius.lg, overflow: "hidden", width: 220, maxHeight: 360 },
  option: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: darkColors.border },
  optionText: { fontSize: fontSize.md, fontFamily: fontFamily.bodyMedium, color: darkColors.text, textAlign: "center" },
  optionTextSelected: { color: darkColors.coral },
});
