import { InputAccessoryView, Keyboard, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { fontFamily, fontSize, spacing, type ThemeColors } from "../lib/theme";

// iOS numeric keypads (number-pad/decimal-pad) have no return key at all, so there's
// otherwise no way to dismiss them. Attach via TextInput's `inputAccessoryViewID` prop.
export const KEYBOARD_ACCESSORY_ID = "mealinnia-keyboard-done";

export function KeyboardDoneBar() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  if (Platform.OS !== "ios") return null;
  return (
    <InputAccessoryView nativeID={KEYBOARD_ACCESSORY_ID}>
      <View style={styles.bar}>
        <Pressable onPress={() => Keyboard.dismiss()} hitSlop={8}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>
    </InputAccessoryView>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    bar: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      backgroundColor: colors.surfaceAlt,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    doneText: { color: colors.primary, fontFamily: fontFamily.bodyBold, fontSize: fontSize.md },
  });
}
