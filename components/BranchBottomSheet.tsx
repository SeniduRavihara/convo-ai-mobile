import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants";
import { BranchWithMessages } from "../types";
import BranchFlowView from "./BranchFlowView";
import BranchPicker from "./BranchPicker";

interface BranchBottomSheetProps {
  visible: boolean;
  branches: BranchWithMessages[];
  activeBranchId: string;
  onBranchSelect: (branchId: string) => void;
  onClose: () => void;
}

export default function BranchBottomSheet({
  visible,
  branches,
  activeBranchId,
  onBranchSelect,
  onClose,
}: BranchBottomSheetProps) {
  const [activeTab, setActiveTab] = useState<"list" | "flow">("list");

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.bottomSheet}>
        {/* Header with Tabs */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Conversation Branches</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.dark.text} />
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "list" && styles.activeTab]}
            onPress={() => setActiveTab("list")}
          >
            <Ionicons
              name="list"
              size={20}
              color={
                activeTab === "list" ? "#FFFFFF" : COLORS.dark.textSecondary
              }
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "list" && styles.activeTabText,
              ]}
            >
              List View
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "flow" && styles.activeTab]}
            onPress={() => setActiveTab("flow")}
          >
            <MaterialCommunityIcons
              name="graph"
              size={20}
              color={
                activeTab === "flow" ? "#FFFFFF" : COLORS.dark.textSecondary
              }
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "flow" && styles.activeTabText,
              ]}
            >
              Flow View
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === "list" ? (
            <BranchPicker
              branches={branches}
              activeBranchId={activeBranchId}
              onBranchSelect={onBranchSelect}
            />
          ) : (
            <BranchFlowView
              branches={branches}
              activeBranchId={activeBranchId}
              onBranchSelect={onBranchSelect}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70%",
    backgroundColor: COLORS.dark.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dark.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.dark.text,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: COLORS.dark.textSecondary,
    fontWeight: "300",
  },
  tabContainer: {
    flexDirection: "row",
    padding: 16,
    paddingBottom: 8,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.dark.background,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.dark.textSecondary,
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  tabContent: {
    flex: 1,
  },
});
