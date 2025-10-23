// TypeScript types for the mobile app
import { User } from "firebase/auth";
import React from "react";

// Auth Context Types
export type AuthContextType = {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
};

// Data Context Types
export type DataContextType = {
  currentUserData: UserDataType | null;
  setCurrentUserData: React.Dispatch<React.SetStateAction<UserDataType | null>>;
  branchesData: Record<string, BranchWithMessages>;
  makeChatActive: (id: string) => void;
  allChats: Chat[] | null;
  activeChatId?: string | null;
  isChatsLoading?: boolean;
  setBranchesData: React.Dispatch<
    React.SetStateAction<Record<string, BranchWithMessages>>
  >;
};

export type UserDataType = {
  uid: string;
  userName: string;
  email: string;
};

export interface UserWithMessages extends UserDataType {
  branches: Record<string, BranchWithMessages>;
}

// Message Types
export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  branchId?: string;
}

// Chat Node Types
export interface ChatNode {
  id: string;
  text: string;
  children?: ChatNode[];
  isSelected?: boolean;
  isExpanded?: boolean;
  level?: number;
}

// Branch Types
export interface Branch {
  id: string;
  name: string;
  parentId: string | null;
  parentMessageId: string | null;
  color: string;
}

export interface BranchWithMessages extends Branch {
  messages: Message[];
}

// Chat Types
export type Chat = {
  id: string;
  name: string;
  color: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  autoRenamed?: boolean;
};

// UI Component Props
export interface BranchExplorerProps {
  data: ChatNode[];
  onNodeClick: (node: ChatNode) => void;
}

export interface ConversationViewProps {
  data: ChatNode[];
  onNodeClick: (node: ChatNode) => void;
}
