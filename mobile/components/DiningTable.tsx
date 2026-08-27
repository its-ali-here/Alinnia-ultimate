import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Rect } from "react-native-svg";
import { useTheme } from "../contexts/ThemeContext";
import { fontFamily, fontSize, spacing, type ThemeColors } from "../lib/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface DiningTableProps {
  adults: number;
  children: number;
}

const SEATS = 6;

// Six seat positions arranged around a rounded table, in clockwise fill order
// starting from the left, so seats light up one after another as the counts change.
const SEAT_POSITIONS = [
  { x: 20, y: 70 },
  { x: 75, y: 15 },
  { x: 125, y: 15 },
  { x: 180, y: 70 },
  { x: 125, y: 125 },
  { x: 75, y: 125 },
];

export function DiningTable({ adults, children }: DiningTableProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const total = adults + children;
  const seated = Math.min(total, SEATS);
  const overflow = total - seated;

  return (
    <View style={styles.wrap}>
      <Svg width={200} height={140} viewBox="0 0 200 140">
        <Rect x={45} y={35} width={110} height={70} rx={35} ry={35} fill={colors.surfaceAlt} stroke={colors.border} strokeWidth={1.5} />
        <G>
          {SEAT_POSITIONS.map((pos, i) => {
            const filled = i < seated;
            const kind: "adult" | "child" = i < adults ? "adult" : "child";
            return <Seat key={i} x={pos.x} y={pos.y} filled={filled} kind={kind} colors={colors} />;
          })}
        </G>
      </Svg>
      {overflow > 0 ? <Text style={styles.overflow}>+{overflow} more at the table</Text> : null}
    </View>
  );
}

function Seat({
  x,
  y,
  filled,
  kind,
  colors,
}: {
  x: number;
  y: number;
  filled: boolean;
  kind: "adult" | "child";
  colors: ThemeColors;
}) {
  const progress = useRef(new Animated.Value(filled ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: filled ? 1 : 0,
      friction: 6,
      tension: 140,
      useNativeDriver: false,
    }).start();
  }, [filled, progress]);

  const maxRadius = kind === "adult" ? 13 : 10;
  const animatedRadius = progress.interpolate({ inputRange: [0, 1], outputRange: [0, maxRadius] });
  const color = kind === "adult" ? colors.primary : colors.sprout;

  return (
    <>
      <Circle
        cx={x}
        cy={y}
        r={15}
        fill="none"
        stroke={colors.border}
        strokeWidth={1.5}
        strokeDasharray={filled ? undefined : "3,4"}
      />
      <AnimatedCircle cx={x} cy={y} r={animatedRadius} fill={color} />
    </>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: { alignItems: "center", justifyContent: "center", paddingVertical: spacing.sm },
    overflow: { fontSize: fontSize.xs, fontFamily: fontFamily.bodyBold, color: colors.textMuted, marginTop: spacing.xs },
  });
}
