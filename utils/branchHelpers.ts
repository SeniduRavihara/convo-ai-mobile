// Utility functions for branch operations
import { BranchWithMessages } from "../types";

/**
 * Convert branches record to array
 */
export function getBranchesArray(
  branchesData: Record<string, BranchWithMessages>
): BranchWithMessages[] {
  return Object.values(branchesData);
}

/**
 * Filter branches by search query
 */
export function filterBranchesBySearch(
  branches: BranchWithMessages[],
  searchQuery: string
): BranchWithMessages[] {
  if (!searchQuery.trim()) {
    return branches;
  }

  const query = searchQuery.toLowerCase();

  return branches.filter((branch) => {
    // Search in branch name
    if (branch.name.toLowerCase().includes(query)) {
      return true;
    }

    // Search in messages
    return branch.messages.some((message) =>
      message.content.toLowerCase().includes(query)
    );
  });
}

/**
 * Get all messages in a branch including inherited messages
 */
export function getBranchMessages(
  branchId: string,
  branchesData: Record<string, BranchWithMessages>
): any[] {
  const branch = branchesData[branchId];
  if (!branch) return [];

  const messages = [...branch.messages];

  // If branch has a parent, get inherited messages
  if (branch.parentId && branch.parentMessageId) {
    const parentBranch = branchesData[branch.parentId];
    if (parentBranch) {
      const parentMessages = parentBranch.messages.filter(
        (msg) =>
          new Date(msg.timestamp) <=
          new Date(
            parentBranch.messages.find((m) => m.id === branch.parentMessageId)
              ?.timestamp || 0
          )
      );
      messages.unshift(...parentMessages);
    }
  }

  return messages;
}

/**
 * Find branch by ID
 */
export function findBranchById(
  branchId: string,
  branchesData: Record<string, BranchWithMessages>
): BranchWithMessages | null {
  return branchesData[branchId] || null;
}

/**
 * Get child branches of a branch
 */
export function getChildBranches(
  branchId: string,
  branchesData: Record<string, BranchWithMessages>
): BranchWithMessages[] {
  return Object.values(branchesData).filter(
    (branch) => branch.parentId === branchId
  );
}

/**
 * Check if a branch has children
 */
export function hasChildBranches(
  branchId: string,
  branchesData: Record<string, BranchWithMessages>
): boolean {
  return Object.values(branchesData).some(
    (branch) => branch.parentId === branchId
  );
}

/**
 * Get branch path (from root to current branch)
 */
export function getBranchPath(
  branchId: string,
  branchesData: Record<string, BranchWithMessages>
): BranchWithMessages[] {
  const path: BranchWithMessages[] = [];
  let currentBranch = branchesData[branchId];

  while (currentBranch) {
    path.unshift(currentBranch);
    if (!currentBranch.parentId) break;
    currentBranch = branchesData[currentBranch.parentId];
  }

  return path;
}
