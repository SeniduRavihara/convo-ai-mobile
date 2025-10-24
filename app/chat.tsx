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
import Markdown from "react-native-markdown-display";
import BranchBottomSheet from "../components/BranchBottomSheet";
import { COLORS } from "../constants";
import {
  addMessageToBranch,
  updateBranchName,
  updateChatName,
} from "../firebase/services/ChatService";
import { useData } from "../hooks/useAuth";
import {
  generateBranchName as generateBranchNameAI,
  generateConversationName as generateChatName,
  getUserApiKey,
  parseStreamingResponse,
  sendMessageStreaming,
} from "../services/aiService";
import {
  getBranchMessages,
  getChildBranchesFromMessage,
  isMessageForkPoint,
  isMessageFromBranch,
} from "../services/branchTreeService";
import {
  createAssistantMessage,
  createUserMessage,
} from "../services/messageService";
import { MOCK_CHAT } from "../utils/mockData";

// API Configuration - Update this with your backend URL
const API_BASE_URL = "https://your-api-url.com"; // TODO: Update with actual API URL
const CHAT_API_ENDPOINT = `${API_BASE_URL}/api/chat`;

export default function ChatScreen() {
  const { currentUserData, branchesData, activeChatId, allChats } = useData();
  const [message, setMessage] = useState("");
  const [activeBranchId, setActiveBranchId] = useState("main");
  const [isSending, setIsSending] = useState(false);
  const [showBranchPicker, setShowBranchPicker] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [lastMessageCount, setLastMessageCount] = useState(0);
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
    // Scroll to bottom when switching branches
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    if (!activeChatId) {
      router.replace("/");
    }
  }, [activeChatId]);

  // Auto-naming effect: Watch for message count changes
  useEffect(() => {
    const currentBranch = branchesData[activeBranchId];
    const currentMessageCount = currentBranch?.messages?.length || 0;

    // If message count just reached 2 (first user + assistant exchange)
    if (
      currentMessageCount === 2 &&
      lastMessageCount !== 2 &&
      activeChatId &&
      !isMockChat
    ) {
      const messages = currentBranch?.messages || [];
      if (messages.length >= 2) {
        const userMsg = messages.find((m) => m.role === "user");
        const aiMsg = messages.find((m) => m.role === "assistant");

        if (userMsg && aiMsg && currentUserData) {
          // Auto-name chat or branch
          if (activeBranchId !== "main") {
            // This is a follow-up branch - rename it
            generateBranchNameAI(
              userMsg.content,
              aiMsg.content,
              CHAT_API_ENDPOINT
            )
              .then((branchName) => {
                updateBranchName(
                  currentUserData.uid,
                  activeChatId,
                  activeBranchId,
                  branchName
                );
              })
              .catch((error) => {
                console.error("Error generating branch name:", error);
              });
          } else {
            // Main branch - rename the chat
            const currentChatData = allChats?.find(
              (chat) => chat.id === activeChatId
            );
            if (!currentChatData?.autoRenamed) {
              // Use the user message for naming
              generateChatName(userMsg.content, CHAT_API_ENDPOINT)
                .then((chatName) => {
                  updateChatName(currentUserData.uid, activeChatId, chatName);
                })
                .catch((error) => {
                  console.error("Error generating chat name:", error);
                });
            }
          }
        }
      }
    }

    setLastMessageCount(currentMessageCount);
  }, [
    branchesData,
    activeBranchId,
    activeChatId,
    lastMessageCount,
    allChats,
    currentUserData,
    isMockChat,
  ]);

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
    const userMessageText = message;
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

      // Scroll to bottom after user message
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Create assistant message placeholder
      const assistantMessage = createAssistantMessage("", activeBranchId);

      // Get conversation history for API
      const conversationHistory = getBranchMessages(
        activeBranchId,
        branchesData
      );

      // Get user's API key
      const userApiKey = await getUserApiKey();

      try {
        // Call streaming API
        const response = await sendMessageStreaming(
          userMessageText,
          conversationHistory,
          CHAT_API_ENDPOINT,
          userApiKey || undefined
        );

        // Parse streaming response
        await parseStreamingResponse(
          response,
          (delta, content) => {
            // Update streaming content for UI
            setStreamingContent(content);
          },
          async (finalContent) => {
            // Streaming complete
            setStreamingContent("");
            assistantMessage.content = finalContent;

            // Save assistant message to Firestore
            await addMessageToBranch(
              currentUserData.uid,
              activeChatId,
              activeBranchId,
              assistantMessage
            );

            // Scroll to bottom after complete message
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }
        );
      } catch (error) {
        console.error("Error calling AI API:", error);

        // Fallback: Add a mock response
        assistantMessage.content =
          "I'm currently in development mode. Please configure your API endpoint in the app settings to enable AI responses.";

        await addMessageToBranch(
          currentUserData.uid,
          activeChatId,
          activeBranchId,
          assistantMessage
        );

        Alert.alert(
          "API Not Configured",
          "Please update the API_BASE_URL in chat.tsx with your backend URL to enable AI responses."
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const isUser = item.role === "user";
    const isForkPoint = isMessageForkPoint(item.id, branchesData);
    const isFromActiveBranch = isMessageFromBranch(
      item.id,
      activeBranchId,
      branchesData
    );
    const childBranches = isForkPoint
      ? getChildBranchesFromMessage(item.id, branchesData)
      : [];

    // Check if this is the first message from the current branch (transition point)
    const isTransitionPoint =
      index > 0 &&
      isFromActiveBranch &&
      !isMessageFromBranch(
        messages[index - 1].id,
        activeBranchId,
        branchesData
      );

    return (
      <View>
        {/* Branch Transition Indicator */}
        {isTransitionPoint && (
          <View style={styles.transitionIndicator}>
            <View style={styles.transitionLine} />
            <View style={styles.transitionBadge}>
              <MaterialCommunityIcons
                name="source-branch"
                size={12}
                color={COLORS.primary}
              />
              <Text style={styles.transitionText}>
                Branch: {branchesData[activeBranchId]?.name}
              </Text>
            </View>
            <View style={styles.transitionLine} />
          </View>
        )}

        {/* User Message - Card Style */}
        {isUser ? (
          <View style={styles.userMessageContainer}>
            <View
              style={[styles.userBubble, isForkPoint && styles.forkPointBubble]}
            >
              {isForkPoint && (
                <View style={styles.forkPointIndicator}>
                  <MaterialCommunityIcons
                    name="source-branch"
                    size={14}
                    color={COLORS.primary}
                  />
                  <Text style={styles.forkPointText}>
                    {childBranches.length} branch
                    {childBranches.length > 1 ? "es" : ""}
                  </Text>
                </View>
              )}
              <Text style={styles.userText}>{item.content}</Text>
              <Text style={styles.userTime}>
                {new Date(item.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
        ) : (
          /* Assistant Message - Free Style with Markdown */
          <View style={styles.assistantMessageContainer}>
            <View style={styles.assistantHeader}>
              <View style={styles.assistantIcon}>
                <MaterialCommunityIcons
                  name="robot"
                  size={16}
                  color="#FFFFFF"
                />
              </View>
            </View>
            <View style={styles.assistantContent}>
              {isForkPoint && (
                <View style={styles.assistantForkIndicator}>
                  <MaterialCommunityIcons
                    name="source-branch"
                    size={14}
                    color={COLORS.primary}
                  />
                  <Text style={styles.assistantForkText}>
                    {childBranches.length} branch
                    {childBranches.length > 1 ? "es" : ""}
                  </Text>
                </View>
              )}
              <Markdown style={markdownStyles} mergeStyle={true}>
                {item.content}
              </Markdown>
              <Text style={styles.assistantTime}>
                {new Date(item.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
        )}
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

      {/* Streaming Indicator */}
      {streamingContent && (
        <View style={styles.assistantMessageContainer}>
          <View style={styles.assistantHeader}>
            <View style={styles.assistantIcon}>
              <MaterialCommunityIcons name="robot" size={16} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.assistantContent}>
            <View style={styles.streamingHeader}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.streamingLabel}>AI is typing...</Text>
            </View>
            <Markdown style={markdownStyles} mergeStyle={true}>
              {streamingContent}
            </Markdown>
          </View>
        </View>
      )}

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
  // Branch Transition Indicator Styles
  transitionIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  transitionLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.primary,
    opacity: 0.3,
  },
  transitionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.dark.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 8,
    gap: 6,
  },
  transitionText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  // Fork Point Indicator Styles
  forkPointBubble: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  forkPointIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "15",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
    gap: 4,
  },
  forkPointText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "600",
  },
  // Streaming Indicator Styles
  streamingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  streamingLabel: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  // User Message Styles (Card-based)
  userMessageContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  // Assistant Message Styles (Free-flowing)
  assistantMessageContainer: {
    flexDirection: "row",
    marginBottom: 24,
    paddingRight: 40,
  },
  assistantHeader: {
    marginRight: 12,
    paddingTop: 4,
  },
  assistantIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  assistantContent: {
    flex: 1,
    paddingRight: 8,
  },
  assistantForkIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "15",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
    gap: 4,
    alignSelf: "flex-start",
  },
  assistantForkText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "600",
  },
});

// Markdown Styles
const markdownStyles = StyleSheet.create({
  body: {
    color: COLORS.dark.text,
    fontSize: 15,
    lineHeight: 24,
  },
  heading1: {
    color: COLORS.dark.text,
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  heading2: {
    color: COLORS.dark.text,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 6,
  },
  heading3: {
    color: COLORS.dark.text,
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  paragraph: {
    marginTop: 4,
    marginBottom: 4,
    color: COLORS.dark.text,
  },
  strong: {
    fontWeight: "700",
    color: COLORS.dark.text,
  },
  em: {
    fontStyle: "italic",
  },
  code_inline: {
    backgroundColor: COLORS.dark.surface,
    color: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 14,
  },
  code_block: {
    backgroundColor: "#1E1E1E",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 13,
    color: "#D4D4D4",
  },
  fence: {
    backgroundColor: "#1E1E1E",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  bullet_list: {
    marginTop: 4,
    marginBottom: 4,
  },
  ordered_list: {
    marginTop: 4,
    marginBottom: 4,
  },
  list_item: {
    marginTop: 2,
    marginBottom: 2,
    color: COLORS.dark.text,
  },
  bullet_list_icon: {
    color: COLORS.primary,
    marginRight: 8,
  },
  blockquote: {
    backgroundColor: COLORS.dark.surface,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    paddingLeft: 12,
    paddingVertical: 8,
    marginVertical: 8,
  },
  table: {
    borderWidth: 1,
    borderColor: COLORS.dark.border,
    borderRadius: 6,
    marginVertical: 8,
  },
  thead: {
    backgroundColor: COLORS.dark.surface,
  },
  tr: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dark.border,
  },
  th: {
    padding: 8,
    fontWeight: "700",
    color: COLORS.dark.text,
  },
  td: {
    padding: 8,
    color: COLORS.dark.text,
  },
  link: {
    color: COLORS.primary,
    textDecorationLine: "underline",
  },
  hr: {
    backgroundColor: COLORS.dark.border,
    height: 1,
    marginVertical: 12,
  },
});
