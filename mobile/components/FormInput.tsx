import { useState } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { fontFamily, fontSize, radius, spacing, type ThemeColors } from "../lib/theme";

interface FormInputProps extends TextInputProps {
  label: string;
}

export function FormInput({ label, style, onFocus, onBlur, ...rest }: FormInputProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, focused && styles.inputFocused, style]}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrapper: { marginBottom: spacing.md },
    label: { fontSize: fontSize.sm, fontFamily: fontFamily.bodyMedium, color: colors.text, marginBottom: spacing.xs },
    input: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.md,
      fontSize: fontSize.md,
      fontFamily: fontFamily.body,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    inputFocused: { borderColor: colors.primary },
  });
}
