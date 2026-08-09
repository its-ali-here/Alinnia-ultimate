import { StyleSheet, View } from "react-native";
import { darkColors } from "../lib/theme";

export function LinearProgress({ progress }: { progress: number }) {
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { flex: pct }]} />
      <View style={{ flex: 1 - pct }} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: "row", height: 3, backgroundColor: darkColors.border },
  fill: { backgroundColor: darkColors.coral },
});
