import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../constants";
import { BranchWithMessages } from "../types";

interface BranchPickerProps {
  branches: BranchWithMessages[];
  activeBranchId: string;
  onBranchSelect: (branchId: string) => void;
}

export default function BranchPicker({
  branches,
  activeBranchId,
  onBranchSelect,
}: BranchPickerProps) {
  const getBranchDepth = (branch: BranchWithMessages): number => {
    let depth = 0;
    let currentParentId = branch.parentId;
    const visited = new Set<string>();

    while (currentParentId && !visited.has(currentParentId)) {
      visited.add(currentParentId);
      const parentBranch = branches.find((b) => b.id === currentParentId);
      if (parentBranch) {
        depth++;
        currentParentId = parentBranch.parentId;
      } else {
        break;
      }
    }

    return depth;
  };

  const sortedBranches = [...branches].sort((a, b) => {
    // Sort by depth first, then by ID (since createdAt may not exist)
    const depthA = getBranchDepth(a);
    const depthB = getBranchDepth(b);

    if (depthA !== depthB) {
      return depthA - depthB;
    }

    return a.id.localeCompare(b.id);
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Conversation Branches</Text>
      <ScrollView style={styles.scrollView}>
        {sortedBranches.map((branch) => {
          const depth = getBranchDepth(branch);
          const isActive = branch.id === activeBranchId;
          const messageCount = branch.messages?.length || 0;

          return (
            <TouchableOpacity
              key={branch.id}
              style={[
                styles.branchItem,
                { marginLeft: depth * 20 },
                isActive && styles.activeBranch,
              ]}
              onPress={() => onBranchSelect(branch.id)}
            >
              <View style={styles.branchContent}>
                <View style={styles.branchHeader}>
                  <Text
                    style={[
                      styles.branchName,
                      isActive && styles.activeBranchText,
                    ]}
                  >
                    {branch.name || "Unnamed Branch"}
                  </Text>
                  <Text style={styles.messageCount}>
                    {messageCount} msg{messageCount !== 1 ? "s" : ""}
                  </Text>
                </View>
                {depth > 0 && (
                  <View style={styles.depthIndicator}>
                    <Text style={styles.depthText}>↳ Branch from parent</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
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
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.dark.text,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dark.border,
  },
  scrollView: {
    flex: 1,
  },
  branchItem: {
    backgroundColor: COLORS.dark.surface,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.dark.border,
  },
  activeBranch: {
    backgroundColor: COLORS.primary + "20",
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  branchContent: {
    padding: 12,
  },
  branchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  branchName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.dark.text,
    flex: 1,
  },
  activeBranchText: {
    color: COLORS.primary,
  },
  messageCount: {
    fontSize: 12,
    color: COLORS.dark.textSecondary,
    marginLeft: 8,
  },
  depthIndicator: {
    marginTop: 4,
  },
  depthText: {
    fontSize: 12,
    color: COLORS.dark.textSecondary,
    fontStyle: "italic",
  },
});
