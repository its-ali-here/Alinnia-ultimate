import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "./Button";
import { useTheme } from "../contexts/ThemeContext";
import { fontFamily, fontSize, radius, spacing, type ThemeColors } from "../lib/theme";

export interface DetailIngredient {
  foodId: string;
  name: string;
  variant?: string;
  imageUrl: string | null;
  emoji: string;
  color: string;
  amount: number;
  unit: string;
  gramWeight: number;
}

interface CookingModeModalProps {
  visible: boolean;
  onClose: () => void;
  recipeName: string;
  prepareServings: number;
  ingredients: DetailIngredient[];
  directions: string[];
  cookMinutes: number;
}

export function CookingModeModal({
  visible,
  onClose,
  recipeName,
  prepareServings,
  ingredients,
  directions,
  cookMinutes,
}: CookingModeModalProps) {
  const { colors, preference } = useTheme();
  const styles = getStyles(colors, preference);

  // Fallback directions if recipe has none
  const activeSteps =
    directions && directions.length > 0
      ? directions
      : [
          `Prep and measure all fresh ingredients for ${prepareServings} ${
            prepareServings === 1 ? "serving" : "servings"
          }.`,
          "Heat oil or ghee in your pan over medium heat. Sauté aromatics (onions, ginger, garlic) until fragrant and golden.",
          "Add main protein or vegetables along with your ground spices (salt, red chili, turmeric, coriander). Bhunai for 5–7 minutes.",
          "Add tomatoes or yogurt base, cover with a tight lid, and simmer on low flame until tender and oil separates (roghan).",
          "Garnish with fresh green chilies, julienned ginger, and chopped coriander. Serve piping hot with fresh roti or naan!",
        ];

  const [currentStep, setCurrentStep] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 min default
  const [timerRunning, setTimerRunning] = useState(false);

  // Animations
  const spatulaAnim = useRef(new Animated.Value(0)).current;
  const flameAnim = useRef(new Animated.Value(0.8)).current;
  const steamAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // 1. Spatula Stirring Loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(spatulaAnim, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(spatulaAnim, {
            toValue: 0,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // 2. Flame Pulse Loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(flameAnim, {
            toValue: 1.2,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(flameAnim, {
            toValue: 0.8,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // 3. Steam Rise Loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(steamAnim, {
            toValue: -15,
            duration: 1200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(steamAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible]);

  // Timer Tick
  useEffect(() => {
    let interval: any;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerRunning) {
      setTimerRunning(false);
      Alert.alert("⏱️ Timer Finished!", "Check your pan — time to move to the next step!");
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const spatulaRotation = spatulaAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-18deg", "22deg"],
  });

  const spatulaTranslateX = spatulaAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, 6],
  });

  const progressFraction = (currentStep + 1) / activeSteps.length;
  const isLastStep = currentStep === activeSteps.length - 1;

  function nextStep() {
    if (isLastStep) {
      Alert.alert(
        "🎉 Dish Complete!",
        `You've successfully cooked ${recipeName} for ${prepareServings} people. Enjoy your meal!`,
        [{ text: "Done", onPress: onClose }]
      );
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  function formatTime(totalSec: number) {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Navigation Bar */}
        <View style={styles.topBar}>
          <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.modeEyebrow}>COOKING MODE</Text>
            <Text style={styles.headerRecipeName} numberOfLines={1}>
              {recipeName}
            </Text>
          </View>

          <View style={styles.stepCounterPill}>
            <Text style={styles.stepCounterText}>
              {currentStep + 1}/{activeSteps.length}
            </Text>
          </View>
        </View>

        {/* Step Progress Bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressFraction * 100}%` }]} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* ================= ANIMATED COOKING PAN & STOVE ================= */}
          <View style={styles.stageWrap}>
            <LinearGradient
              colors={
                preference === "dark"
                  ? ["rgba(20, 168, 92, 0.15)", "rgba(4, 42, 28, 0.4)"]
                  : ["rgba(20, 168, 92, 0.12)", "rgba(255, 194, 51, 0.08)"]
              }
              style={styles.stageGradient}
            >
              {/* Animated Steam Rising */}
              <Animated.View
                style={[
                  styles.steamWrap,
                  {
                    transform: [{ translateY: steamAnim }],
                    opacity: steamAnim.interpolate({
                      inputRange: [-15, 0],
                      outputRange: [0.2, 0.8],
                    }),
                  },
                ]}
              >
                <Text style={styles.steamEmoji}>♨️</Text>
              </Animated.View>

              {/* Hand with Spatula Stirring */}
              <Animated.View
                style={[
                  styles.spatulaWrap,
                  {
                    transform: [
                      { translateX: spatulaTranslateX },
                      { rotate: spatulaRotation },
                    ],
                  },
                ]}
              >
                <Text style={styles.spatulaEmoji}>🥄</Text>
              </Animated.View>

              {/* Cooking Pan / Karahi */}
              <View style={styles.panBody}>
                <View style={styles.panHandleLeft} />
                <View style={styles.panInner}>
                  <Text style={styles.sizzleEmoji}>🍲</Text>
                </View>
                <View style={styles.panHandleRight} />
              </View>

              {/* Stove Flame & Glow */}
              <View style={styles.stoveBase}>
                <Animated.View
                  style={[
                    styles.flameGlow,
                    {
                      transform: [{ scale: flameAnim }],
                    },
                  ]}
                >
                  <Text style={styles.flameEmoji}>🔥</Text>
                </Animated.View>
                <View style={styles.stoveBurnerRing} />
              </View>
            </LinearGradient>
          </View>

          {/* ================= STEP INSTRUCTION CARD ================= */}
          <View style={styles.stepCard}>
            <View style={styles.stepHeaderRow}>
              <View style={styles.stepNumBadge}>
                <Text style={styles.stepNumText}>STEP {currentStep + 1}</Text>
              </View>
              <Text style={styles.stepCookTime}>
                Estimated: ~{Math.round(cookMinutes / activeSteps.length) || 5} min
              </Text>
            </View>

            <Text style={styles.stepInstructionText}>{activeSteps[currentStep]}</Text>
          </View>

          {/* ================= INGREDIENTS QUICK-LOOK CHIPS ================= */}
          <View style={styles.ingredientsBox}>
            <Text style={styles.ingredientsBoxTitle}>Ingredients for this dish ({prepareServings} servings)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ingChipsRail}>
              {ingredients.map((ing, idx) => (
                <View key={idx} style={styles.ingChip}>
                  <Text style={styles.ingChipEmoji}>{ing.emoji || "🥬"}</Text>
                  <Text style={styles.ingChipName}>
                    {ing.name}: <Text style={{ fontFamily: fontFamily.bodyBold }}>{ing.amount} {ing.unit}</Text>
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* ================= BUILT-IN STEP TIMER ================= */}
          <View style={styles.timerCard}>
            <View style={styles.timerLeft}>
              <Ionicons name="timer-outline" size={22} color={colors.primary} />
              <View>
                <Text style={styles.timerTitle}>Step Timer</Text>
                <Text style={styles.timerValue}>{formatTime(timerSeconds)}</Text>
              </View>
            </View>

            <View style={styles.timerActions}>
              <Pressable
                style={[styles.timerBtn, timerRunning && styles.timerBtnPause]}
                onPress={() => setTimerRunning((prev) => !prev)}
              >
                <Ionicons name={timerRunning ? "pause" : "play"} size={16} color="#FFFFFF" />
                <Text style={styles.timerBtnText}>{timerRunning ? "Pause" : "Start"}</Text>
              </Pressable>

              <Pressable
                style={styles.timerResetBtn}
                onPress={() => {
                  setTimerRunning(false);
                  setTimerSeconds(300);
                }}
              >
                <Ionicons name="refresh" size={16} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Floating Next/Prev Controls */}
        <View style={styles.bottomBar}>
          <Pressable
            style={[styles.prevBtn, currentStep === 0 && styles.prevBtnDisabled]}
            onPress={prevStep}
            disabled={currentStep === 0}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={currentStep === 0 ? colors.border : colors.text}
            />
            <Text style={[styles.prevBtnText, currentStep === 0 && { color: colors.border }]}>
              Previous
            </Text>
          </Pressable>

          <Button
            title={isLastStep ? "Finish & Serve 🍽️" : "Next Step →"}
            onPress={nextStep}
            style={styles.nextBtn}
          />
        </View>
      </View>
    </Modal>
  );
}

function getStyles(colors: ThemeColors, preference: string) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
    },
    closeBtn: {
      padding: 6,
    },
    headerTitleWrap: {
      alignItems: "center",
      flex: 1,
      marginHorizontal: spacing.sm,
    },
    modeEyebrow: {
      fontSize: 10,
      fontFamily: fontFamily.bodyBold,
      color: colors.primary,
      letterSpacing: 1,
    },
    headerRecipeName: {
      fontSize: fontSize.sm + 1,
      fontFamily: fontFamily.bodyBold,
      color: colors.text,
      marginTop: 1,
    },
    stepCounterPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceAlt,
    },
    stepCounterText: {
      fontSize: 12,
      fontFamily: fontFamily.bodyBold,
      color: colors.text,
    },

    progressBarBg: {
      height: 4,
      backgroundColor: colors.surfaceAlt,
      width: "100%",
    },
    progressBarFill: {
      height: 4,
      backgroundColor: colors.primary,
    },

    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xxl + 40,
    },

    // Animated Cooking Stage
    stageWrap: {
      borderRadius: radius.lg,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.md,
    },
    stageGradient: {
      paddingVertical: spacing.lg,
      alignItems: "center",
      justifyContent: "center",
      height: 180,
    },
    steamWrap: {
      marginBottom: -10,
    },
    steamEmoji: {
      fontSize: 24,
    },
    spatulaWrap: {
      position: "absolute",
      top: 35,
      zIndex: 10,
    },
    spatulaEmoji: {
      fontSize: 34,
    },
    panBody: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 5,
    },
    panHandleLeft: {
      width: 14,
      height: 8,
      backgroundColor: "#2C3437",
      borderTopLeftRadius: 4,
      borderBottomLeftRadius: 4,
    },
    panInner: {
      width: 90,
      height: 45,
      backgroundColor: "#1A2224",
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: "#3E494C",
    },
    sizzleEmoji: {
      fontSize: 20,
    },
    panHandleRight: {
      width: 14,
      height: 8,
      backgroundColor: "#2C3437",
      borderTopRightRadius: 4,
      borderBottomRightRadius: 4,
    },
    stoveBase: {
      alignItems: "center",
      marginTop: -6,
    },
    flameGlow: {
      marginBottom: -8,
      zIndex: 2,
    },
    flameEmoji: {
      fontSize: 20,
    },
    stoveBurnerRing: {
      width: 60,
      height: 10,
      backgroundColor: "#1E2729",
      borderRadius: 5,
      borderWidth: 1,
      borderColor: colors.border,
    },

    // Step Card
    stepCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.md,
    },
    stepHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
    },
    stepNumBadge: {
      backgroundColor: colors.primaryTint,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: radius.sm,
    },
    stepNumText: {
      fontSize: 11,
      fontFamily: fontFamily.bodyBold,
      color: colors.primary,
      letterSpacing: 0.8,
    },
    stepCookTime: {
      fontSize: 11,
      fontFamily: fontFamily.bodyMedium,
      color: colors.textMuted,
    },
    stepInstructionText: {
      fontSize: fontSize.md,
      fontFamily: fontFamily.bodyMedium,
      color: colors.text,
      lineHeight: 24,
    },

    // Ingredients Quick Box
    ingredientsBox: {
      marginBottom: spacing.md,
    },
    ingredientsBoxTitle: {
      fontSize: 11.5,
      fontFamily: fontFamily.bodyBold,
      color: colors.textMuted,
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    ingChipsRail: {
      gap: 6,
    },
    ingChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    ingChipEmoji: {
      fontSize: 14,
    },
    ingChipName: {
      fontSize: 11,
      fontFamily: fontFamily.body,
      color: colors.text,
    },

    // Timer Card
    timerCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    timerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    timerTitle: {
      fontSize: 11,
      fontFamily: fontFamily.bodyMedium,
      color: colors.textMuted,
    },
    timerValue: {
      fontSize: fontSize.lg,
      fontFamily: fontFamily.displayBold,
      color: colors.text,
    },
    timerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    timerBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
    },
    timerBtnPause: {
      backgroundColor: colors.accent,
    },
    timerBtnText: {
      fontSize: 12,
      fontFamily: fontFamily.bodyBold,
      color: "#FFFFFF",
    },
    timerResetBtn: {
      padding: 8,
      borderRadius: radius.pill,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },

    // Bottom Navigation Bar
    bottomBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    prevBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
    },
    prevBtnDisabled: {
      borderColor: colors.border,
      opacity: 0.4,
    },
    prevBtnText: {
      fontSize: fontSize.sm,
      fontFamily: fontFamily.bodyBold,
      color: colors.text,
    },
    nextBtn: {
      flex: 1,
    },
  });
}

