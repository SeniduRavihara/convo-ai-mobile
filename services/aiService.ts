// AI Service for chat streaming with Gemini API
import { Message } from "../types";

/**
 * Convert our message format to Gemini API format
 */
function convertToGeminiHistory(messages: Message[]) {
  return messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));
}

/**
 * Send a message to AI and get streaming response
 * Note: You'll need to set up your API endpoint for mobile
 */
export async function sendMessageStreaming(
  message: string,
  history: Message[],
  apiEndpoint: string,
  apiKey?: string
): Promise<Response> {
  const geminiHistory = convertToGeminiHistory(history);

  const response = await fetch(apiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question: message,
      apiKey: apiKey,
      history: geminiHistory,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API failed: ${response.status}`);
  }

  return response;
}

/**
 * Parse streaming response from AI
 */
export async function parseStreamingResponse(
  response: Response,
  onDelta: (delta: string, fullContent: string) => void,
  onComplete: (fullContent: string) => void
): Promise<string> {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullContent = "";

  if (!reader) {
    throw new Error("Response body is not readable");
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

    for (const line of lines) {
      const dataStr = line.replace("data: ", "").trim();
      if (dataStr === "[DONE]") break;

      try {
        const data = JSON.parse(dataStr);

        if (data.delta) {
          fullContent += data.delta;
          onDelta(data.delta, fullContent);
        } else if (data.done) {
          onComplete(fullContent);
        }
      } catch (e) {
        console.error("Parse error:", e);
      }
    }
  }

  return fullContent;
}

/**
 * Generate a conversation name based on the first message
 */
export async function generateConversationName(
  firstMessage: string,
  apiEndpoint: string
): Promise<string> {
  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: `Generate a short, concise title (max 5 words) for a conversation that starts with: "${firstMessage}". Return ONLY the title, nothing else.`,
        history: [],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate name");
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";

    if (!reader) return "New Conversation";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk
        .split("\n")
        .filter((line) => line.startsWith("data: "));

      for (const line of lines) {
        const dataStr = line.replace("data: ", "").trim();
        if (dataStr === "[DONE]") break;

        try {
          const data = JSON.parse(dataStr);
          if (data.delta) {
            fullContent += data.delta;
          }
        } catch (e) {
          console.error("Parse error:", e);
        }
      }
    }

    return fullContent.trim() || "New Conversation";
  } catch (error) {
    console.error("Error generating conversation name:", error);
    return "New Conversation";
  }
}

/**
 * Get user's API key from AsyncStorage
 */
export async function getUserApiKey(): Promise<string | null> {
  try {
    const AsyncStorage = (
      await import("@react-native-async-storage/async-storage")
    ).default;
    return await AsyncStorage.getItem("userApiKey");
  } catch (error) {
    console.error("Error getting user API key:", error);
    return null;
  }
}

/**
 * Save user's API key to AsyncStorage
 */
export async function saveUserApiKey(apiKey: string): Promise<void> {
  try {
    const AsyncStorage = (
      await import("@react-native-async-storage/async-storage")
    ).default;
    await AsyncStorage.setItem("userApiKey", apiKey);
  } catch (error) {
    console.error("Error saving user API key:", error);
  }
}

/**
 * Generate a branch name using AI based on conversation content
 */
export async function generateBranchName(
  userMessage: string,
  aiResponse: string,
  apiEndpoint: string
): Promise<string> {
  try {
    const namingPrompt = `User: ${userMessage.substring(0, 150)}${
      userMessage.length > 150 ? "..." : ""
    }\n\nAssistant: ${aiResponse.substring(0, 150)}${
      aiResponse.length > 150 ? "..." : ""
    }\n\nBased on this conversation, suggest a short, descriptive name (under 5 words):`;

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: namingPrompt,
        history: [],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate branch name");
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";

    if (!reader) return "Branch Discussion";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk
        .split("\n")
        .filter((line) => line.startsWith("data: "));

      for (const line of lines) {
        const dataStr = line.replace("data: ", "").trim();
        if (dataStr === "[DONE]") break;

        try {
          const data = JSON.parse(dataStr);
          if (data.delta) {
            fullContent += data.delta;
          }
        } catch (e) {
          console.error("Parse error:", e);
        }
      }
    }

    // Clean up the suggested name
    const cleanName = fullContent
      .trim()
      .replace(/^["']|["']$/g, "")
      .replace(/\s+/g, " ")
      .trim();

    return cleanName || "Branch Discussion";
  } catch (error) {
    console.error("Error generating branch name:", error);
    return "Branch Discussion";
  }
}

/**
 * Generate a branch name from selected text
 */
export async function generateBranchNameFromSelection(
  selectedText: string,
  apiEndpoint: string
): Promise<string> {
  try {
    const namingPrompt = `Suggest a short, descriptive name for a conversation about: "${selectedText}". Keep it under 5 words.`;

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: namingPrompt,
        history: [],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate branch name");
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";

    if (!reader) return "Discussion";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk
        .split("\n")
        .filter((line) => line.startsWith("data: "));

      for (const line of lines) {
        const dataStr = line.replace("data: ", "").trim();
        if (dataStr === "[DONE]") break;

        try {
          const data = JSON.parse(dataStr);
          if (data.delta) {
            fullContent += data.delta;
          }
        } catch (e) {
          console.error("Parse error:", e);
        }
      }
    }

    // Clean up the suggested name
    const cleanName = fullContent
      .trim()
      .replace(/^["']|["']$/g, "")
      .replace(/\s+/g, " ")
      .trim();

    return cleanName || "Discussion";
  } catch (error) {
    console.error("Error generating branch name from selection:", error);
    return "Discussion";
  }
}
