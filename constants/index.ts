// Constants for the mobile app
import { AuthContextType, DataContextType } from "../types";

export const INITIAL_AUTH_CONTEXT: AuthContextType = {
  currentUser: null,
  setCurrentUser: () => {},
  loading: true,
};

export const INITIAL_DATA_CONTEXT: DataContextType = {
  currentUserData: null,
  setCurrentUserData: () => {},
  branchesData: {},
  makeChatActive: () => {},
  allChats: null,
  activeChatId: null,
  isChatsLoading: false,
  setBranchesData: () => {},
};

// Color schemes
export const COLORS = {
  primary: "#3B82F6",
  secondary: "#8B5CF6",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
  info: "#14B8A6",

  // Dark mode
  dark: {
    background: "#111827",
    surface: "#1F2937",
    border: "#374151",
    text: "#F9FAFB",
    textSecondary: "#9CA3AF",
  },

  // Light mode
  light: {
    background: "#FFFFFF",
    surface: "#F9FAFB",
    border: "#E5E7EB",
    text: "#111827",
    textSecondary: "#6B7280",
  },
};
