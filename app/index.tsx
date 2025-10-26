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
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants";
import { fetchCurrentUserData } from "../firebase/api";
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
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.profileButton}>
            <View style={styles.profileIcon}>
              <Text style={styles.profileInitial}>
                {currentUserData.userName?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Conversations</Text>
            <Text style={styles.headerSubtitle}>
              {currentUserData.userName || "User"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/settings")}
          style={styles.settingsButton}
        >
          <Ionicons
            name="settings-outline"
            size={24}
            color={COLORS.dark.text}
          />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={COLORS.dark.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor={COLORS.dark.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{displayChats.length}</Text>
          <Text style={styles.statLabel}>Chats</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {displayChats.filter((chat) => chat.updatedAt).length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{useMockData ? "1" : "0"}</Text>
          <Text style={styles.statLabel}>Demo</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleCreateChat}
        >
          <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>New Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleLoadMockData}
        >
          <MaterialCommunityIcons
            name="sprout"
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.secondaryButtonText}>Mock Data</Text>
        </TouchableOpacity>
      </View>

      {/* Section Header */}
      {!isChatsLoading && displayChats.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Conversations</Text>
          <Text style={styles.sectionCount}>{displayChats.length}</Text>
        </View>
      )}

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
    </SafeAreaView>
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
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dark.border,
    backgroundColor: COLORS.dark.surface,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileButton: {
    marginRight: 12,
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primary + "40",
  },
  profileInitial: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.dark.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.dark.textSecondary,
    marginTop: 2,
  },
  settingsButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 28,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.dark.surface,
    borderWidth: 1,
    borderColor: COLORS.dark.border,
    borderRadius: 12,
    paddingLeft: 40,
    paddingRight: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.dark.text,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.dark.surface,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.dark.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.dark.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.dark.border,
    marginHorizontal: 8,
  },
  actionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: COLORS.dark.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.dark.background,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.dark.text,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    backgroundColor: COLORS.primary + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.dark.surface,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.dark.border,
  },
  chatIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
