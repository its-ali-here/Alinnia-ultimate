import type { PropsWithChildren } from "react";
import { View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { darkColors, spacing } from "../lib/theme";

interface ScreenContainerProps {
  style?: ViewStyle;
  topSpacing?: number;
}

// Pads the top by the device's actual safe-area inset (notch / Dynamic Island) instead
// of a fixed guess, so content never renders underneath it.
export function ScreenContainer({ children, style, topSpacing = spacing.md }: PropsWithChildren<ScreenContainerProps>) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[{ flex: 1, backgroundColor: darkColors.background, paddingTop: insets.top + topSpacing }, style]}>
      {children}
    </View>
  );
}
