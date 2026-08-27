import type { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import { spacing } from "../lib/theme";

interface ScreenContainerProps {
  style?: ViewStyle;
  topSpacing?: number;
}

// Pads the top by the device's actual safe-area inset (notch / Dynamic Island) instead
// of a fixed guess, so content never renders underneath it. Also shifts content up when
// the keyboard opens (iOS has no automatic resize like Android does), so a screen's
// primary action button never ends up hidden behind the keyboard.
export function ScreenContainer({ children, style, topSpacing = spacing.md }: PropsWithChildren<ScreenContainerProps>) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const topPadding = Math.max(insets.top, 20) + topSpacing;
  return (
    <KeyboardAvoidingView
      style={[{ flex: 1, backgroundColor: colors.background, paddingTop: topPadding }, style]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {children}
    </KeyboardAvoidingView>
  );
}
