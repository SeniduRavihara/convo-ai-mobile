/**
 * Branch Tree Service
 * Handles all tree/linked-list data structure operations for branches
 * Implements the core logic for branch traversal, message inheritance, and path calculation
 */

import { BranchWithMessages, Message } from "../types";

/**
 * Represents a node in the branch path (linked list structure)
 */
export interface BranchPathNode {
  branchId: string;
  parentMessageId: string | null;
}

/**
 * Get the complete path from root to a specific branch
 * This traverses the linked list structure from child to parent
 *
 * @param branchId - The target branch ID
 * @param branchesData - All branches data
 * @returns Array of branch path nodes from root to target
 */
export function getBranchPath(
  branchId: string,
  branchesData: Record<string, BranchWithMessages>
): BranchPathNode[] {
  const branchPath: BranchPathNode[] = [];
  let currentBranchId: string | null = branchId;

  // Traverse backwards from child to parent (linked list traversal)
  while (currentBranchId) {
    const branch: BranchWithMessages | undefined =
      branchesData[currentBranchId];

    if (!branch) {
      console.warn(
        `Branch with id ${currentBranchId} not found in branchesData`
      );
      break;
    }

    // Add to the beginning of array to maintain root-to-leaf order
    branchPath.unshift({
      branchId: currentBranchId,
      parentMessageId: branch.parentMessageId,
    });

    // Move to parent (linked list traversal)
    currentBranchId = branch.parentId;
  }

  return branchPath;
}

/**
 * Get all messages for a branch including inherited messages from ancestors
 * This builds the complete message history by traversing the branch tree
 *
 * @param branchId - The target branch ID
 * @param branchesData - All branches data
 * @returns Complete array of messages including inherited ones
 */
export function getBranchMessages(
  branchId: string,
  branchesData: Record<string, BranchWithMessages>
): Message[] {
  const branchPath = getBranchPath(branchId, branchesData);
  let allMessages: Message[] = [];

  // Build message history by traversing the path
  for (let i = 0; i < branchPath.length; i++) {
    const { branchId: currentBranchId, parentMessageId } = branchPath[i];
    const branch = branchesData[currentBranchId];

    if (!branch) continue;

    if (i === 0) {
      // Root branch - include all its messages
      allMessages = [...branch.messages];
    } else {
      // Child branch - inherit messages up to fork point, then add branch-specific messages
      const forkIndex = allMessages.findIndex(
        (msg) => msg.id === parentMessageId
      );

      if (forkIndex >= 0) {
        // Keep messages up to and including the fork point
        const inheritedMessages = allMessages.slice(0, forkIndex + 1);
        const branchMessages = branch.messages;
        allMessages = [...inheritedMessages, ...branchMessages];
      } else {
        // If fork point not found, just append branch messages
        allMessages = [...allMessages, ...branch.messages];
      }
    }
  }

  return allMessages;
}

/**
 * Check if a message belongs to a specific branch (not inherited)
 *
 * @param messageId - The message ID to check
 * @param branchId - The branch ID to check against
 * @param branchesData - All branches data
 * @returns True if message is from this branch, false if inherited
 */
export function isMessageFromBranch(
  messageId: string,
  branchId: string,
  branchesData: Record<string, BranchWithMessages>
): boolean {
  const branch = branchesData[branchId];
  if (!branch) return false;

  return branch.messages.some((msg) => msg.id === messageId);
}

/**
 * Get the branch that contains a specific message
 *
 * @param messageId - The message ID to find
 * @param branchesData - All branches data
 * @returns The branch containing the message, or null if not found
 */
export function getMessageBranch(
  messageId: string,
  branchesData: Record<string, BranchWithMessages>
): BranchWithMessages | null {
  for (const branch of Object.values(branchesData)) {
    if (branch.messages.some((msg) => msg.id === messageId)) {
      return branch;
    }
  }
  return null;
}

/**
 * Get the ID of the branch that contains a specific message
 *
 * @param messageId - The message ID to find
 * @param branchesData - All branches data
 * @returns The branch ID, or null if not found
 */
export function getMessageBranchId(
  messageId: string,
  branchesData: Record<string, BranchWithMessages>
): string | null {
  const branch = getMessageBranch(messageId, branchesData);
  return branch ? branch.id : null;
}

/**
 * Get all child branches of a specific branch
 *
 * @param branchId - The parent branch ID
 * @param branchesData - All branches data
 * @returns Array of child branches
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
 * Get the depth of a branch in the tree (0 for root)
 *
 * @param branchId - The branch ID
 * @param branchesData - All branches data
 * @returns The depth level (0 = root, 1 = first level child, etc.)
 */
export function getBranchDepth(
  branchId: string,
  branchesData: Record<string, BranchWithMessages>
): number {
  const path = getBranchPath(branchId, branchesData);
  return path.length - 1; // Subtract 1 because root is at depth 0
}

/**
 * Check if a branch has any child branches
 *
 * @param branchId - The branch ID to check
 * @param branchesData - All branches data
 * @returns True if branch has children
 */
export function hasChildBranches(
  branchId: string,
  branchesData: Record<string, BranchWithMessages>
): boolean {
  return getChildBranches(branchId, branchesData).length > 0;
}
