import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Chip } from "./Chip";
import { useTheme } from "../contexts/ThemeContext";
import { fontFamily, fontSize, radius as radiusToken, spacing, type ThemeColors } from "../lib/theme";

export interface OrbitChipItem {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: "primary" | "accent";
  active?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

interface OrbitDishProps {
  dishName: string;
  icon: keyof typeof Ionicons.glyphMap;
  chips: OrbitChipItem[];
  loading?: boolean;
}

const SIZE = 300;
const ORBIT_RADIUS = 122;
const MEDALLION_SIZE = 140;

export function OrbitDish({ dishName, icon, chips, loading }: OrbitDishProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const rotation = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(rotation, { toValue: 1, duration: 24000, easing: Easing.linear, useNativeDriver: true })
    );
    spin.start();
    return () => spin.stop();
  }, [rotation]);

  useEffect(() => {
    const beat = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    if (loading) beat.start();
    return () => beat.stop();
  }, [loading, pulse]);

  const medallionScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });
  const medallionOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

  return (
    <View style={styles.container}>
      <View style={[styles.ring, styles.ringOuter]} />
      <View style={[styles.ring, styles.ringInner]} />

      {chips.map((chip, index) => {
        const fixedAngle = index * (360 / chips.length);
        const armRotate = rotation.interpolate({
          inputRange: [0, 1],
          outputRange: [`${fixedAngle}deg`, `${fixedAngle + 360}deg`],
        });
        const counterRotate = rotation.interpolate({
          inputRange: [0, 1],
          outputRange: [`${-fixedAngle}deg`, `${-fixedAngle - 360}deg`],
        });

        return (
          <Animated.View
            key={`${chip.label}-${index}`}
            style={[styles.arm, { transform: [{ rotate: armRotate }, { translateY: -ORBIT_RADIUS }] }]}
          >
            <Animated.View style={{ transform: [{ rotate: counterRotate }] }}>
              <Chip
                label={chip.label}
                icon={chip.icon}
                tone={chip.tone}
                active={chip.active}
                onPress={chip.onPress}
                disabled={chip.disabled}
              />
            </Animated.View>
          </Animated.View>
        );
      })}

      <Animated.View style={[styles.medallion, { transform: [{ scale: medallionScale }], opacity: medallionOpacity }]}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.medallionGradient}
        >
          <Ionicons name={icon} size={30} color={colors.primaryText} />
          <Text style={styles.dishName} numberOfLines={2}>
            {dishName}
          </Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center", alignSelf: "center" },
    ring: { position: "absolute", borderRadius: radiusToken.pill, borderWidth: 1.5 },
    ringOuter: { width: SIZE, height: SIZE, borderColor: colors.primaryTint },
    ringInner: { width: SIZE - 60, height: SIZE - 60, borderColor: colors.border },
    arm: { position: "absolute", alignItems: "center", justifyContent: "center" },
    medallion: {
      width: MEDALLION_SIZE,
      height: MEDALLION_SIZE,
      borderRadius: radiusToken.pill,
      overflow: "hidden",
    },
    medallionGradient: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.md,
      gap: spacing.xs,
    },
    dishName: {
      fontSize: fontSize.sm,
      fontFamily: fontFamily.bodyBold,
      color: colors.primaryText,
      textAlign: "center",
    },
  });
}
