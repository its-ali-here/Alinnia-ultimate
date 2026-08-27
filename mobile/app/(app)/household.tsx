import { useCallback, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/Button";
import { IconButton } from "../../components/IconButton";
import { ScreenContainer } from "../../components/ScreenContainer";
import { ScreenHeader } from "../../components/ScreenHeader";
import { useAuth } from "../../lib/auth";
import { useOnboardingDraft } from "../../contexts/OnboardingDraft";
import { useTheme } from "../../contexts/ThemeContext";
import {
  createNewMember,
  formatMemberSubtitle,
  getHouseholdMembers,
  getMemberTag,
  saveHouseholdMembers,
  type HouseholdMember,
} from "../../lib/householdService";
import { supabase } from "../../lib/supabase";
import { fontFamily, fontSize, radius, spacing, type ThemeColors } from "../../lib/theme";

export default function Household() {
  const { colors, preference } = useTheme();
  const styles = getStyles(colors, preference);
  const { session, profile } = useAuth();
  const { adultsCount, childrenCount, cuisines } = useOnboardingDraft();
  const userId = session?.user.id ?? "anonymous";

  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const loadMembers = useCallback(async () => {
    const loaded = await getHouseholdMembers(userId, profile, adultsCount, childrenCount);
    setMembers(loaded);
  }, [userId, profile, adultsCount, childrenCount]);

  useFocusEffect(
    useCallback(() => {
      loadMembers();
    }, [loadMembers])
  );

  const totalPeople = members.length > 0 ? members.length : (profile?.adults_count ?? adultsCount ?? 2) + (profile?.children_count ?? childrenCount ?? 0);
  const activeCuisines = profile?.cuisines?.length ? profile.cuisines : cuisines.length ? cuisines : ["Punjabi", "Sindhi"];
  const subtitle = `${totalPeople} people · ${activeCuisines.join(", ")}`;

  function handleSignOut() {
    setSettingsVisible(false);
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => supabase.auth.signOut(),
      },
    ]);
  }

  function handleDeleteAccount() {
    setSettingsVisible(false);
    Alert.alert(
      "Delete Account?",
      "This will permanently delete your household profiles, saved recipes, and meal plans. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: async () => {
            if (userId && userId !== "anonymous") {
              await supabase.from("profiles").delete().eq("id", userId);
            }
            await supabase.auth.signOut();
            Alert.alert("Account Deleted", "Your account has been deleted.");
          },
        },
      ]
    );
  }

  function handleAddMember() {
    Alert.prompt
      ? Alert.prompt("Add Family Member", "Enter their name (e.g. Fatima, Bilal, Dadi):", (name) => {
          if (!name?.trim()) return;
          const newMember = createNewMember(name, members.length);
          const next = [...members, newMember];
          setMembers(next);
          saveHouseholdMembers(userId, next);
        })
      : Alert.alert("Add Member", "Manage portion sizes and diets for new household members.", [{ text: "OK" }]);
  }

  function openPreferences(memberId?: string) {
    router.push({
      pathname: "/household-preferences",
      params: memberId ? { memberId } : undefined,
    });
  }

  function openPremium() {
    setSettingsVisible(false);
    router.push("/premium");
  }

  return (
    <ScreenContainer topSpacing={spacing.lg}>
      <ScreenHeader
        title="Your table"
        subtitle={subtitle}
        right={
          <IconButton
            icon="settings-outline"
            color={colors.text}
            backgroundColor={colors.surfaceAlt}
            accessibilityLabel="Settings"
            onPress={() => setSettingsVisible(true)}
          />
        }
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {members.map((member) => {
          const tag = getMemberTag(member);
          const memberSubtitle = formatMemberSubtitle(member);
          return (
            <Pressable
              key={member.id}
              style={styles.person}
              onPress={() => openPreferences(member.id)}
            >
              <View style={[styles.pav, { backgroundColor: member.bgColor }]}>
                <Text style={[styles.pavText, { color: member.textColor ?? colors.primaryText }]}>
                  {member.avatar}
                </Text>
              </View>
              <View style={styles.personInfo}>
                <Text style={styles.personName}>{member.name}</Text>
                <Text style={styles.personSubtitle}>{memberSubtitle}</Text>
              </View>
              {tag ? (
                <View style={styles.tagPill}>
                  <Text style={styles.tagPillText}>{tag}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}

        <Pressable style={styles.addRow} onPress={handleAddMember} hitSlop={8}>
          <View style={styles.addCircle}>
            <Text style={styles.addPlus}>+</Text>
          </View>
          <Text style={styles.addText}>Add someone</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          variant="secondary"
          title="Preferences & Habits"
          onPress={() => openPreferences()}
        />
      </View>

      {/* Settings Modal Sheet */}
      <Modal
        visible={settingsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSettingsVisible(false)}
        >
          <Pressable style={styles.settingsSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>Settings</Text>
              <Pressable onPress={() => setSettingsVisible(false)} hitSlop={10}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </Pressable>
            </View>

            {/* 1. Join Premium Option */}
            <Pressable style={styles.premiumRow} onPress={openPremium}>
              <View style={styles.premiumIconWrap}>
                <Ionicons name="sparkles" size={18} color="#FFC233" />
              </View>
              <View style={styles.premiumRowText}>
                <View style={styles.premiumLabelRow}>
                  <Text style={styles.premiumRowTitle}>Join Alinnia Plus</Text>
                  <View style={styles.vipTag}>
                    <Text style={styles.vipTagText}>PREMIUM</Text>
                  </View>
                </View>
                <Text style={styles.premiumRowSubtitle}>
                  Diabetic guardrails, gym portions & AI pantry
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.primary} />
            </Pressable>

            {/* 2. Privacy Policy */}
            <Pressable
              style={styles.menuRow}
              onPress={() => {
                setSettingsVisible(false);
                Linking.openURL("https://alinnia.com/privacy");
              }}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: colors.surfaceAlt }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.text} />
              </View>
              <Text style={styles.menuRowTitle}>Privacy Policy</Text>
              <Ionicons name="open-outline" size={16} color={colors.textMuted} />
            </Pressable>

            {/* 3. Terms of Service */}
            <Pressable
              style={styles.menuRow}
              onPress={() => {
                setSettingsVisible(false);
                Linking.openURL("https://alinnia.com/terms");
              }}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: colors.surfaceAlt }]}>
                <Ionicons name="document-text-outline" size={18} color={colors.text} />
              </View>
              <Text style={styles.menuRowTitle}>Terms of Service</Text>
              <Ionicons name="open-outline" size={16} color={colors.textMuted} />
            </Pressable>

            <View style={styles.settingsDivider} />

            {/* 4. Log Out Option */}
            <Pressable style={styles.menuRow} onPress={handleSignOut}>
              <View style={[styles.menuIconWrap, { backgroundColor: colors.surfaceAlt }]}>
                <Ionicons name="log-out-outline" size={18} color={colors.text} />
              </View>
              <Text style={styles.menuRowTitle}>Log Out</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>

            {/* 5. Delete Account Option */}
            <Pressable style={styles.menuRow} onPress={handleDeleteAccount}>
              <View style={[styles.menuIconWrap, { backgroundColor: "rgba(240, 86, 62, 0.12)" }]}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </View>
              <Text style={[styles.menuRowTitle, { color: colors.danger }]}>Delete Account</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

function getStyles(colors: ThemeColors, preference: string) {
  return StyleSheet.create({
    body: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xl,
    },
    person: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    pav: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    pavText: {
      fontFamily: fontFamily.displayBold,
      fontSize: 15,
      fontWeight: "700",
    },
    personInfo: {
      flex: 1,
      justifyContent: "center",
    },
    personName: {
      fontSize: 14,
      fontFamily: fontFamily.bodyBold,
      color: colors.text,
      lineHeight: 18,
    },
    personSubtitle: {
      fontSize: 11.5,
      fontFamily: fontFamily.bodyMedium,
      color: colors.textMuted,
      marginTop: 1,
    },
    tagPill: {
      marginLeft: "auto",
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 20,
      backgroundColor: preference === "dark" ? "rgba(240, 194, 68, 0.22)" : "rgba(255, 194, 51, 0.22)",
      alignItems: "center",
      justifyContent: "center",
    },
    tagPillText: {
      fontSize: 9.5,
      fontFamily: fontFamily.bodyBold,
      letterSpacing: 0.5,
      color: preference === "dark" ? "#F0C244" : "#8A6410",
      textTransform: "uppercase",
    },
    addRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 14,
    },
    addCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: preference === "dark" ? "rgba(226, 130, 93, 0.5)" : "rgba(20, 168, 92, 0.4)",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    addPlus: {
      fontSize: 19,
      fontFamily: fontFamily.displayBold,
      color: colors.primary,
      lineHeight: 22,
    },
    addText: {
      fontSize: 13.5,
      fontFamily: fontFamily.bodyBold,
      color: colors.primary,
    },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },

    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.55)",
      justifyContent: "flex-end",
    },
    settingsSheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xxl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    settingsHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    settingsTitle: {
      fontSize: fontSize.lg,
      fontFamily: fontFamily.displayBold,
      color: colors.text,
    },

    premiumRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 12,
      borderRadius: radius.md,
      backgroundColor: colors.primaryTint,
      borderWidth: 1,
      borderColor: colors.primary,
      marginBottom: spacing.sm,
    },
    premiumIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "#042A1C",
      alignItems: "center",
      justifyContent: "center",
    },
    premiumRowText: {
      flex: 1,
    },
    premiumLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    premiumRowTitle: {
      fontSize: fontSize.sm,
      fontFamily: fontFamily.bodyBold,
      color: colors.text,
    },
    vipTag: {
      backgroundColor: "#FFC233",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: radius.pill,
    },
    vipTagText: {
      fontSize: 9,
      fontFamily: fontFamily.bodyBold,
      color: "#042A1C",
      letterSpacing: 0.5,
    },
    premiumRowSubtitle: {
      fontSize: 11,
      fontFamily: fontFamily.bodyMedium,
      color: colors.textMuted,
      marginTop: 2,
    },

    settingsDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.xs,
    },

    menuRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
    },
    menuIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
    },
    menuRowTitle: {
      fontSize: fontSize.md,
      fontFamily: fontFamily.bodyBold,
      color: colors.text,
      flex: 1,
    },
  });
}
