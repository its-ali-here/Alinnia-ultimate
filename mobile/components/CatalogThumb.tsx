import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";
import { radius } from "../lib/theme";

interface CatalogThumbProps {
  imageUrl: string | null;
  emoji: string;
  color: string;
  size: number;
  emojiSize: number;
  gradient?: boolean;
}

// Shared food/recipe thumb: renders the real photo once one's been added to
// the catalog, otherwise falls back to today's emoji-on-color placeholder —
// the fallback is permanent, not a loading state, since most catalog entries
// won't have a photo for a while.
export function CatalogThumb({ imageUrl, emoji, color, size, emojiSize, gradient }: CatalogThumbProps) {
  const { colors } = useTheme();
  const boxStyle = { width: size, height: size, borderRadius: radius.md };

  if (imageUrl) {
    return <Image source={{ uri: imageUrl }} style={boxStyle} contentFit="cover" transition={150} />;
  }

  if (gradient) {
    return (
      <LinearGradient colors={[color, colors.surfaceAlt]} style={[styles.center, boxStyle]}>
        <Text style={{ fontSize: emojiSize }}>{emoji}</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.center, boxStyle, { backgroundColor: color }]}>
      <Text style={{ fontSize: emojiSize }}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
});
