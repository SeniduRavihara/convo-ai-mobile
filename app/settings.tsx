// Settings Screen - User settings and preferences
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../constants";
import { logout } from "../firebase/services/AuthService";
import { useAuth } from "../hooks/useAuth";

export default function SettingsScreen() {
  const { currentUser } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/login");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout");
          }
        },
      },
    ]);
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "This will clear all cached data. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            Alert.alert("Success", "Cache cleared successfully");
          },
        },
      ]
    );
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
    danger,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.iconContainer,
            danger && { backgroundColor: COLORS.danger + "20" },
          ]}
        >
          <Ionicons
            name={icon as any}
            size={24}
            color={danger ? COLORS.danger : COLORS.primary}
          />
        </View>
        <View style={styles.settingText}>
          <Text
            style={[styles.settingTitle, danger && { color: COLORS.danger }]}
          >
            {title}
          </Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement ||
        (onPress && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={COLORS.dark.textSecondary}
          />
        ))}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="person-outline"
              title="Profile"
              subtitle={currentUser?.email || "Not logged in"}
              onPress={() =>
                Alert.alert("Profile", "Profile settings coming soon")
              }
            />
            <SettingItem
              icon="key-outline"
              title="Change Password"
              onPress={() =>
                Alert.alert("Password", "Password change coming soon")
              }
            />
            <SettingItem
              icon="shield-checkmark-outline"
              title="Privacy & Security"
              onPress={() =>
                Alert.alert("Privacy", "Privacy settings coming soon")
              }
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="notifications-outline"
              title="Notifications"
              subtitle="Enable push notifications"
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{
                    false: COLORS.dark.border,
                    true: COLORS.primary,
                  }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <SettingItem
              icon="moon-outline"
              title="Dark Mode"
              subtitle="Use dark theme"
              rightElement={
                <Switch
                  value={darkModeEnabled}
                  onValueChange={setDarkModeEnabled}
                  trackColor={{
                    false: COLORS.dark.border,
                    true: COLORS.primary,
                  }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <SettingItem
              icon="save-outline"
              title="Auto Save"
              subtitle="Automatically save conversations"
              rightElement={
                <Switch
                  value={autoSaveEnabled}
                  onValueChange={setAutoSaveEnabled}
                  trackColor={{
                    false: COLORS.dark.border,
                    true: COLORS.primary,
                  }}
                  thumbColor="#FFFFFF"
                />
              }
            />
          </View>
        </View>

        {/* Data & Storage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATA & STORAGE</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="cloud-download-outline"
              title="Export Data"
              subtitle="Download your conversations"
              onPress={() =>
                Alert.alert("Export", "Export feature coming soon")
              }
            />
            <SettingItem
              icon="trash-outline"
              title="Clear Cache"
              subtitle="Free up storage space"
              onPress={handleClearCache}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="information-circle-outline"
              title="App Version"
              subtitle="1.0.0"
            />
            <SettingItem
              icon="document-text-outline"
              title="Terms of Service"
              onPress={() =>
                Alert.alert("Terms", "Terms of Service coming soon")
              }
            />
            <SettingItem
              icon="shield-outline"
              title="Privacy Policy"
              onPress={() =>
                Alert.alert("Privacy", "Privacy Policy coming soon")
              }
            />
            <SettingItem
              icon="help-circle-outline"
              title="Help & Support"
              onPress={() => Alert.alert("Support", "Support page coming soon")}
            />
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="log-out-outline"
              title="Logout"
              subtitle="Sign out of your account"
              onPress={handleLogout}
              danger
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Convo Tree AI © 2025</Text>
          <Text style={styles.footerText}>
            Made with ❤️ for better conversations
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dark.border,
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.dark.text,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.dark.textSecondary,
    paddingHorizontal: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: COLORS.dark.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.dark.border,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dark.border,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.dark.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: COLORS.dark.textSecondary,
  },
  footer: {
    alignItems: "center",
    padding: 32,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.dark.textSecondary,
    marginBottom: 4,
  },
});
