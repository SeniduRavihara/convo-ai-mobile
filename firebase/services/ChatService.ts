// Chat Service - handles all chat and branch operations
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { BranchWithMessages, Chat, Message } from "../../types";
import { db } from "../firebase-config";

/**
 * Generate a random color for branches and chats
 */
const getRandomColor = (): string => {
  const colors = [
    "#3B82F6", // blue
    "#10B981", // green
    "#F59E0B", // amber
    "#EF4444", // red
    "#8B5CF6", // purple
    "#EC4899", // pink
    "#14B8A6", // teal
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Create a new chat
 */
export const createNewChat = async (
  userId: string,
  chatName: string = "New Conversation"
): Promise<Chat> => {
  try {
    const chatsCollectionRef = collection(db, "users", userId, "chats");
    const newChatRef = doc(chatsCollectionRef);

    const newChat: Chat = {
      id: newChatRef.id,
      name: chatName,
      color: getRandomColor(),
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      autoRenamed: false,
    };

    await setDoc(newChatRef, newChat);

    // Create the main branch
    const mainBranch: BranchWithMessages = {
      id: "main",
      name: "Main",
      parentId: null,
      parentMessageId: null,
      color: newChat.color,
      messages: [],
    };

    const branchRef = doc(
      db,
      "users",
      userId,
      "chats",
      newChat.id,
      "branches",
      "main"
    );
    await setDoc(branchRef, mainBranch);

    console.log("New chat created:", newChat.id);
    return newChat;
  } catch (error) {
    console.error("Error creating new chat:", error);
    throw error;
  }
};

/**
 * Update chat name
 */
export const updateChatName = async (
  userId: string,
  chatId: string,
  newName: string
): Promise<void> => {
  try {
    const chatRef = doc(db, "users", userId, "chats", chatId);
    await updateDoc(chatRef, {
      name: newName,
      updatedAt: new Date().toISOString(),
    });
    console.log("Chat name updated:", chatId, newName);
  } catch (error) {
    console.error("Error updating chat name:", error);
    throw error;
  }
};

/**
 * Update branch name
 */
export const updateBranchName = async (
  userId: string,
  chatId: string,
  branchId: string,
  newName: string
): Promise<void> => {
  try {
    const branchRef = doc(
      db,
      "users",
      userId,
      "chats",
      chatId,
      "branches",
      branchId
    );
    await updateDoc(branchRef, {
      name: newName,
    });
    console.log("Branch name updated:", branchId, newName);
  } catch (error) {
    console.error("Error updating branch name:", error);
    throw error;
  }
};

/**
 * Add a message to a branch
 */
export const addMessageToBranch = async (
  userId: string,
  chatId: string,
  branchId: string,
  message: Message
): Promise<void> => {
  try {
    const branchRef = doc(
      db,
      "users",
      userId,
      "chats",
      chatId,
      "branches",
      branchId
    );

    // Get the current branch data
    const branchSnap = await getDoc(branchRef);
    const branchData = branchSnap.data() as BranchWithMessages;

    const updatedMessages = [...(branchData?.messages || []), message];

    await updateDoc(branchRef, {
      messages: updatedMessages,
    });

    // Also update the chat's updatedAt timestamp
    const chatRef = doc(db, "users", userId, "chats", chatId);
    await updateDoc(chatRef, {
      updatedAt: new Date().toISOString(),
    });

    console.log("Message added to branch:", branchId);
  } catch (error) {
    console.error("Error adding message to branch:", error);
    throw error;
  }
};

/**
 * Create a new branch from a message
 */
export const createBranch = async (
  userId: string,
  chatId: string,
  parentBranchId: string,
  parentMessageId: string,
  branchName: string
): Promise<BranchWithMessages> => {
  try {
    const branchesCollectionRef = collection(
      db,
      "users",
      userId,
      "chats",
      chatId,
      "branches"
    );
    const newBranchRef = doc(branchesCollectionRef);

    const newBranch: BranchWithMessages = {
      id: newBranchRef.id,
      name: branchName,
      parentId: parentBranchId,
      parentMessageId: parentMessageId,
      color: getRandomColor(),
      messages: [],
    };

    await setDoc(newBranchRef, newBranch);

    console.log("New branch created:", newBranch.id);
    return newBranch;
  } catch (error) {
    console.error("Error creating branch:", error);
    throw error;
  }
};
