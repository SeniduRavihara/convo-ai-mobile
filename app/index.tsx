import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../constants";
import { fetchCurrentUserData } from "../firebase/api";
import { logout } from "../firebase/services/AuthService";
import { createNewChat } from "../firebase/services/ChatService";
import { useAuth, useData } from "../hooks/useAuth";
import { MOCK_BRANCHES, MOCK_CHAT } from "../utils/mockData";

export default function HomeScreen() {
  const { currentUser, loading: authLoading } = useAuth();
  const {
    currentUserData,
    setCurrentUserData,
    allChats,
    makeChatActive,
    isChatsLoading,
    setBranchesData,
  } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [useMockData, setUseMockData] = useState(false);

  // Fetch user data when user is authenticated
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser && !currentUserData) {
        try {
          const userData = await fetchCurrentUserData(currentUser);
          setCurrentUserData(userData);
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      }
    };
    loadUserData();
  }, [currentUser, currentUserData, setCurrentUserData]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace("/login");
    }
  }, [currentUser, authLoading]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to logout");
    }
  };

  const handleCreateChat = async () => {
    if (!currentUserData) return;

    try {
      const newChat = await createNewChat(currentUserData.uid);
      makeChatActive(newChat.id);
      router.push("/chat");
    } catch (error) {
      console.error("Error creating chat:", error);
      Alert.alert("Error", "Failed to create chat");
    }
  };

  const handleChatPress = (chatId: string) => {
    makeChatActive(chatId);
    router.push("/chat");
  };

  const handleLoadMockData = () => {
    setUseMockData(true);
    setBranchesData(MOCK_BRANCHES);
    makeChatActive(MOCK_CHAT.id);
    Alert.alert(
      "Mock Data Loaded!",
      "Open the mock chat to test branch switching",
      [{ text: "OK", onPress: () => router.push("/chat") }]
    );
  };

  // Show loading while auth is initializing
  if (authLoading || !currentUser || !currentUserData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>
          {authLoading
            ? "Checking authentication..."
            : !currentUser
            ? "Authenticating..."
            : "Loading your data..."}
        </Text>
      </View>
    );
  }

  const filteredChats =
    allChats?.filter((chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Add mock chat if mock data is enabled
  const displayChats = useMockData
    ? [MOCK_CHAT, ...filteredChats]
    : filteredChats;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Conversations</Text>
          <Text style={styles.headerSubtitle}>
            Welcome, {currentUserData.userName}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor={COLORS.dark.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* New Chat Button */}
      <TouchableOpacity style={styles.newChatButton} onPress={handleCreateChat}>
        <Text style={styles.newChatButtonText}>+ New Conversation</Text>
      </TouchableOpacity>

      {/* Mock Data Button */}
      <TouchableOpacity
        style={[styles.newChatButton, styles.mockButton]}
        onPress={handleLoadMockData}
      >
        <MaterialCommunityIcons
          name="sprout"
          size={20}
          color="#FFFFFF"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.newChatButtonText}>
          Load Mock Data (Test Branches)
        </Text>
      </TouchableOpacity>

      {/* Chats List */}
      {isChatsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      ) : displayChats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>
            Create your first conversation to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayChats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatItem}
              onPress={() => handleChatPress(item.id)}
            >
              <View style={[styles.chatIcon, { backgroundColor: item.color }]}>
                {item.id === "mock-chat-001" ? (
                  <MaterialCommunityIcons
                    name="sprout"
                    size={24}
                    color="#FFFFFF"
                  />
                ) : (
                  <Ionicons name="chatbubble" size={24} color="#FFFFFF" />
                )}
              </View>
              <View style={styles.chatInfo}>
                <Text style={styles.chatName}>{item.name}</Text>
                <Text style={styles.chatDate}>
                  {new Date(item.updatedAt).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.dark.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.dark.textSecondary,
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
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.dark.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.dark.textSecondary,
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: "600",
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: COLORS.dark.surface,
    borderWidth: 1,
    borderColor: COLORS.dark.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.dark.text,
  },
  newChatButton: {
    backgroundColor: COLORS.primary,
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  mockButton: {
    backgroundColor: COLORS.success,
  },
  newChatButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dark.border,
  },
  chatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  chatIconText: {
    fontSize: 24,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.dark.text,
    marginBottom: 4,
  },
  chatDate: {
    fontSize: 14,
    color: COLORS.dark.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.dark.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.dark.textSecondary,
    textAlign: "center",
  },
});
