// Chat Screen - Main conversation interface
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BranchBottomSheet from "../components/BranchBottomSheet";
import { COLORS } from "../constants";
import { addMessageToBranch } from "../firebase/services/ChatService";
import { useData } from "../hooks/useAuth";
import { getBranchMessages } from "../services/branchTreeService";
import {
  createAssistantMessage,
  createUserMessage,
} from "../services/messageService";
import { MOCK_CHAT } from "../utils/mockData";

export default function ChatScreen() {
  const { currentUserData, branchesData, activeChatId, allChats } = useData();
  const [message, setMessage] = useState("");
  const [activeBranchId, setActiveBranchId] = useState("main");
  const [isSending, setIsSending] = useState(false);
  const [showBranchPicker, setShowBranchPicker] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Check if this is the mock chat
  const isMockChat = activeChatId === "mock-chat-001";
  const currentChat = isMockChat
    ? MOCK_CHAT
    : allChats?.find((chat) => chat.id === activeChatId);

  // Use getBranchMessages to get all messages including inherited ones
  const messages = getBranchMessages(activeBranchId, branchesData);

  // Get all branches as an array for the branch picker
  const allBranches = Object.values(branchesData);
  const hasBranches = allBranches.length > 1;

  // Function to switch branches
  const switchBranch = (branchId: string) => {
    setActiveBranchId(branchId);
    setShowBranchPicker(false);
  };

  useEffect(() => {
    if (!activeChatId) {
      router.replace("/");
    }
  }, [activeChatId]);

  const handleSendMessage = async () => {
    if (!message.trim() || !activeChatId || !activeBranchId) return;

    // Don't allow sending messages in mock chat
    if (isMockChat) {
      Alert.alert(
        "Mock Data",
        "This is a demo chat. Create a real chat to send messages!"
      );
      return;
    }

    if (!currentUserData) return;

    const userMessage = createUserMessage(message, activeBranchId);
    setMessage("");
    setIsSending(true);

    try {
      // Add user message to Firestore
      await addMessageToBranch(
        currentUserData.uid,
        activeChatId,
        activeBranchId,
        userMessage
      );

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // For now, we'll add a simple mock assistant response
      // In a real app, you would call your API here
      const assistantMessage = createAssistantMessage(
        "I'm a mobile app now! The AI integration will be completed when you set up your API endpoint.",
        activeBranchId
      );

      await addMessageToBranch(
        currentUserData.uid,
        activeChatId,
        activeBranchId,
        assistantMessage
      );
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.assistantText,
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isUser ? styles.userTime : styles.assistantTime,
            ]}
          >
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (!activeChatId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  // For mock chat, check if branches are loaded
  if (isMockChat && Object.keys(branchesData).length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading mock data...</Text>
      </View>
    );
  }

  // For real chats, check if chat exists
  if (!isMockChat && !currentChat) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      {/* Mock Data Banner */}
      {isMockChat && (
        <View style={styles.mockBanner}>
          <MaterialCommunityIcons
            name="sprout"
            size={16}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.mockBannerText}>
            DEMO MODE - Test Branch Switching
          </Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {currentChat?.name || "Chat"}
        </Text>
        <TouchableOpacity
          style={styles.branchButton}
          onPress={() => setShowBranchPicker(true)}
        >
          <MaterialCommunityIcons
            name="source-branch"
            size={18}
            color={COLORS.primary}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.branchButtonText}>
            {hasBranches ? `${allBranches.length} Branches` : "Main"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Branch Bottom Sheet with Tabs */}
      <BranchBottomSheet
        visible={showBranchPicker}
        branches={allBranches}
        activeBranchId={activeBranchId}
        onBranchSelect={switchBranch}
        onClose={() => setShowBranchPicker(false)}
      />

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start a conversation!</Text>
          </View>
        )}
      />

      {/* Floating Action Button for Branches */}
      {hasBranches && !showBranchPicker && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowBranchPicker(true)}
        >
          <MaterialCommunityIcons
            name="source-branch"
            size={24}
            color="#FFFFFF"
          />
          <View style={styles.fabBadge}>
            <Text style={styles.fabBadgeText}>{allBranches.length}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={
            isMockChat ? "Demo mode - read only" : "Type a message..."
          }
          placeholderTextColor={COLORS.dark.textSecondary}
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={2000}
          editable={!isSending && !isMockChat}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || isSending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={!message.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark.background,
  },
  mockBanner: {
    backgroundColor: COLORS.success,
    padding: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  mockBannerText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
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
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dark.border,
    backgroundColor: COLORS.dark.surface,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.dark.text,
    textAlign: "center",
    marginHorizontal: 16,
  },
  headerRight: {
    width: 24,
  },
  branchButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primary + "20",
    borderRadius: 8,
  },
  branchButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  assistantMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: COLORS.dark.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  userText: {
    color: "#FFFFFF",
  },
  assistantText: {
    color: COLORS.dark.text,
  },
  messageTime: {
    fontSize: 12,
  },
  userTime: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  assistantTime: {
    color: COLORS.dark.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
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
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.dark.border,
    backgroundColor: COLORS.dark.surface,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.dark.background,
    borderWidth: 1,
    borderColor: COLORS.dark.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.dark.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 70,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 1000,
  },
  fabBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: COLORS.dark.background,
  },
  fabBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
