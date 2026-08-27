import { useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "../components/Button";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAuth } from "../lib/auth";
import { useOnboardingDraft } from "../contexts/OnboardingDraft";
import { getPricingForCuisines } from "../lib/pricingData";
import { useTheme } from "../contexts/ThemeContext";
import { fontFamily, fontSize, radius, spacing, type ThemeColors } from "../lib/theme";

const BENEFITS = [
  {
    icon: "pricetag-outline",
    title: "Live Grocery Price Estimates",
    desc: "Real-time estimated ingredient costs, price per serving, and weekly kitchen budget breakdown.",
    color: "#2D9CDB",
  },
  {
    icon: "water-outline",
    title: "Diabetic & Health Guardrails",
    desc: "Automated low-GI substitutions, insulin carb guidance, and less-sugar recipe tips.",
    color: "#FFC233",
  },
  {
    icon: "fitness-outline",
    title: "High-Protein Gym Portions",
    desc: "Auto-scales extra meat & protein for training members directly from the shared family pot.",
    color: "#F0563E",
  },
  {
    icon: "sparkles-outline",
    title: "AI 'Cook With What I Have'",
    desc: "Turn fridge leftovers & pantry staples into authentic cultural dishes instantly.",
    color: "#8FE64B",
  },
  {
    icon: "options-outline",
    title: "Custom Dietary & Health Profiles",
    desc: "Fine-tune detailed personal dietary rules, macros, allergies, and health goals for everyone at your table.",
    color: "#9B51E0",
  },
];

export default function PremiumScreen() {
  const { colors, preference } = useTheme();
  const styles = getStyles(colors, preference);
  const { profile } = useAuth();
  const { cuisines } = useOnboardingDraft();
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");
  const [loading, setLoading] = useState(false);

  const activeCuisines = profile?.cuisines?.length ? profile.cuisines : cuisines;
  const pricing = getPricingForCuisines(activeCuisines);

  function handleSubscribe() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "Welcome to Alinnia Plus! 🌟",
        "Your 3-day free trial has been activated. Enjoy unlimited family health automation!",
        [{ text: "Let's Cook!", onPress: () => router.back() }]
      );
    }, 1000);
  }

  function handleRestore() {
    Alert.alert("Restore Purchases", "No active subscription found for this Apple ID / Google Account.");
  }

  return (
    <ScreenContainer topSpacing={spacing.xs}>
      {/* Top Header Row with Close Button */}
      <View style={styles.header}>
        <View style={styles.badgeWrap}>
          <LinearGradient
            colors={["#FFC233", "#F0563E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.premiumBadge}
          >
            <Ionicons name="star" size={12} color="#042A1C" />
            <Text style={styles.premiumBadgeText}>ALINNIA PLUS</Text>
          </LinearGradient>
        </View>

        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Title & Pitch */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Elevate your household's kitchen</Text>
          <Text style={styles.heroSubtitle}>
            Grocery price estimates, diabetic guardrails, high-protein portions, and custom dietary profiles.
          </Text>
        </View>

        {/* Value Prop Benefit Cards */}
        <View style={styles.benefitsGrid}>
          {BENEFITS.map((item, i) => (
            <View key={i} style={styles.benefitCard}>
              <View style={[styles.benefitIconWrap, { backgroundColor: item.color + "22" }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <View style={styles.benefitTextWrap}>
                <Text style={styles.benefitTitle}>{item.title}</Text>
                <Text style={styles.benefitDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing Tier Selector */}
        <View style={styles.pricingSection}>
          {/* Annual Plan */}
          <Pressable
            style={[
              styles.planCard,
              billingCycle === "annual" && styles.planCardActive,
            ]}
            onPress={() => setBillingCycle("annual")}
          >
            <View style={styles.planHeaderRow}>
              <View style={styles.planRadioRow}>
                <Ionicons
                  name={billingCycle === "annual" ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={billingCycle === "annual" ? colors.primary : colors.textMuted}
                />
                <View>
                  <Text style={styles.planName}>Annual Plan</Text>
                  <Text style={styles.planSubname}>3-Day Free Trial included</Text>
                </View>
              </View>

              <View style={styles.savingsTag}>
                <Text style={styles.savingsText}>SAVE 17%</Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceBig}>{pricing.annualPrice}</Text>
              <Text style={styles.pricePeriod}>/ year ({pricing.annualPerMonth})</Text>
            </View>
          </Pressable>

          {/* Monthly Plan */}
          <Pressable
            style={[
              styles.planCard,
              billingCycle === "monthly" && styles.planCardActive,
            ]}
            onPress={() => setBillingCycle("monthly")}
          >
            <View style={styles.planHeaderRow}>
              <View style={styles.planRadioRow}>
                <Ionicons
                  name={billingCycle === "monthly" ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={billingCycle === "monthly" ? colors.primary : colors.textMuted}
                />
                <View>
                  <Text style={styles.planName}>Monthly Plan</Text>
                  <Text style={styles.planSubname}>Pay month-to-month</Text>
                </View>
              </View>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceBig}>{pricing.monthlyPrice}</Text>
              <Text style={styles.pricePeriod}>/ month</Text>
            </View>
          </Pressable>
        </View>

        {/* Primary CTA Button */}
        <Button
          title={billingCycle === "annual" ? "Start 3-Day Free Trial" : "Join Alinnia Plus"}
          onPress={handleSubscribe}
          loading={loading}
          style={styles.subscribeBtn}
        />

        <Text style={styles.trialNote}>
          {billingCycle === "annual"
            ? `3 days free, then ${pricing.annualPrice}/year. Cancel anytime in App Store settings.`
            : `${pricing.monthlyPrice}/month, auto-renews. Cancel anytime in App Store settings.`}
        </Text>

        {/* Footer Links */}
        <View style={styles.legalRow}>
          <Pressable onPress={handleRestore} hitSlop={8}>
            <Text style={styles.legalLink}>Restore Purchases</Text>
          </Pressable>
          <Text style={styles.legalDot}>·</Text>
          <Pressable
            onPress={() => Linking.openURL("https://alinnia.com/terms")}
            hitSlop={8}
          >
            <Text style={styles.legalLink}>Terms of Service</Text>
          </Pressable>
          <Text style={styles.legalDot}>·</Text>
          <Pressable
            onPress={() => Linking.openURL("https://alinnia.com/privacy")}
            hitSlop={8}
          >
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function getStyles(colors: ThemeColors, preference: string) {
  return StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xs,
    },
    badgeWrap: { flexDirection: "row" },
    premiumBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: radius.pill,
    },
    premiumBadgeText: {
      fontSize: 11,
      fontFamily: fontFamily.bodyBold,
      color: "#042A1C",
      letterSpacing: 0.8,
    },
    closeBtn: {
      padding: 4,
    },

    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xxl,
    },

    heroSection: {
      marginTop: spacing.xs,
      marginBottom: spacing.md,
    },
    heroTitle: {
      fontSize: fontSize.xxl,
      fontFamily: fontFamily.displayBold,
      color: colors.text,
      lineHeight: 32,
    },
    heroSubtitle: {
      fontSize: fontSize.sm,
      fontFamily: fontFamily.bodyMedium,
      color: colors.textMuted,
      marginTop: 6,
      lineHeight: 20,
    },

    benefitsGrid: {
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    benefitCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 12,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    benefitIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    benefitTextWrap: {
      flex: 1,
    },
    benefitTitle: {
      fontSize: fontSize.sm,
      fontFamily: fontFamily.bodyBold,
      color: colors.text,
    },
    benefitDesc: {
      fontSize: 11.5,
      fontFamily: fontFamily.body,
      color: colors.textMuted,
      marginTop: 2,
      lineHeight: 16,
    },

    pricingSection: {
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    planCard: {
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
    },
    planCardActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryTint,
    },
    planHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
    },
    planRadioRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    planName: {
      fontSize: fontSize.md,
      fontFamily: fontFamily.bodyBold,
      color: colors.text,
    },
    planSubname: {
      fontSize: 11,
      fontFamily: fontFamily.bodyMedium,
      color: colors.textMuted,
    },
    savingsTag: {
      backgroundColor: "#FFC233",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radius.pill,
    },
    savingsText: {
      fontSize: 10,
      fontFamily: fontFamily.bodyBold,
      color: "#042A1C",
      letterSpacing: 0.5,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "baseline",
      marginLeft: 30,
    },
    priceBig: {
      fontSize: fontSize.xl,
      fontFamily: fontFamily.displayBold,
      color: colors.text,
    },
    pricePeriod: {
      fontSize: fontSize.xs,
      fontFamily: fontFamily.bodyMedium,
      color: colors.textMuted,
      marginLeft: 4,
    },

    subscribeBtn: {
      marginTop: spacing.xs,
    },
    trialNote: {
      fontSize: 11,
      fontFamily: fontFamily.bodyMedium,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: spacing.xs + 2,
    },

    legalRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      marginTop: spacing.lg,
    },
    legalLink: {
      fontSize: 11,
      fontFamily: fontFamily.bodyMedium,
      color: colors.textMuted,
      textDecorationLine: "underline",
    },
    legalDot: {
      color: colors.textMuted,
      fontSize: 11,
    },
  });
}

