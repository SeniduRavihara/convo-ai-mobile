// Message Service - helpers for creating messages
import { Message } from "../types";

/**
 * Create a user message object
 */
export function createUserMessage(content: string, branchId?: string): Message {
  return {
    id: generateMessageId(),
    role: "user",
    content,
    timestamp: new Date().toISOString(),
    branchId,
  };
}

/**
 * Create an assistant message object
 */
export function createAssistantMessage(
  content: string,
  branchId?: string
): Message {
  return {
    id: generateMessageId(),
    role: "assistant",
    content,
    timestamp: new Date().toISOString(),
    branchId,
  };
}

/**
 * Generate a unique message ID
 * Note: For React Native, we're using a simple timestamp-based ID
 * If you need UUIDs, install: npx expo install uuid
 */
function generateMessageId(): string {
  // Simple timestamp + random for uniqueness
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
