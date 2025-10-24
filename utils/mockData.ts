import { BranchWithMessages, Chat } from "../types";

export const MOCK_CHAT: Chat = {
  id: "mock-chat-001",
  name: "AI Assistant Demo Chat",
  color: "#3B82F6",
  messages: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const MOCK_BRANCHES: Record<string, BranchWithMessages> = {
  main: {
    id: "main",
    name: "Main Conversation",
    color: "#3B82F6",
    parentId: null,
    parentMessageId: null,
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "Hello! Can you help me understand React Native?",
        timestamp: new Date(Date.now() - 60000 * 10).toISOString(),
      },
      {
        id: "msg-2",
        role: "assistant",
        content:
          "Of course! React Native is a framework for building mobile apps using React. It allows you to write code once and deploy to both iOS and Android. What specific aspect would you like to know more about?",
        timestamp: new Date(Date.now() - 60000 * 9).toISOString(),
      },
      {
        id: "msg-3",
        role: "user",
        content: "Tell me about state management",
        timestamp: new Date(Date.now() - 60000 * 8).toISOString(),
      },
      {
        id: "msg-4",
        role: "assistant",
        content:
          "Great question! React Native supports several state management solutions:\n\n1. **useState** - For local component state\n2. **Context API** - For sharing state across components\n3. **Redux** - For complex global state\n4. **Zustand** - Lightweight alternative\n5. **MobX** - Observable-based state\n\nWhich one interests you most?",
        timestamp: new Date(Date.now() - 60000 * 7).toISOString(),
      },
    ],
  },
  "branch-redux": {
    id: "branch-redux",
    name: "Redux Deep Dive",
    color: "#8B5CF6",
    parentId: "main",
    parentMessageId: "msg-4",
    messages: [
      {
        id: "msg-5a",
        role: "user",
        content: "Tell me more about Redux",
        timestamp: new Date(Date.now() - 60000 * 6).toISOString(),
      },
      {
        id: "msg-6a",
        role: "assistant",
        content:
          "Redux is a predictable state container! Here are the key concepts:\n\n• **Store** - Single source of truth\n• **Actions** - Events that describe what happened\n• **Reducers** - Pure functions that update state\n• **Dispatch** - Method to send actions\n\nWith Redux Toolkit, setup is much simpler. Would you like to see an example?",
        timestamp: new Date(Date.now() - 60000 * 5).toISOString(),
      },
      {
        id: "msg-7a",
        role: "user",
        content: "Yes, show me a basic example",
        timestamp: new Date(Date.now() - 60000 * 4).toISOString(),
      },
      {
        id: "msg-8a",
        role: "assistant",
        content:
          '```typescript\nimport { createSlice } from "@reduxjs/toolkit";\n\nconst userSlice = createSlice({\n  name: "user",\n  initialState: { name: "", loggedIn: false },\n  reducers: {\n    login: (state, action) => {\n      state.name = action.payload;\n      state.loggedIn = true;\n    },\n    logout: (state) => {\n      state.loggedIn = false;\n    },\n  },\n});\n\nexport const { login, logout } = userSlice.actions;\n```',
        timestamp: new Date(Date.now() - 60000 * 3).toISOString(),
      },
    ],
  },
  "branch-context": {
    id: "branch-context",
    name: "Context API Exploration",
    color: "#10B981",
    parentId: "main",
    parentMessageId: "msg-4",
    messages: [
      {
        id: "msg-5b",
        role: "user",
        content: "How does Context API work?",
        timestamp: new Date(Date.now() - 60000 * 6).toISOString(),
      },
      {
        id: "msg-6b",
        role: "assistant",
        content:
          "Context API is built into React! It has three main parts:\n\n1. **createContext()** - Creates the context\n2. **Provider** - Supplies the value\n3. **useContext()** - Consumes the value\n\nIt's perfect for medium-sized apps and avoids prop drilling. Want to see how we use it in this app?",
        timestamp: new Date(Date.now() - 60000 * 5).toISOString(),
      },
      {
        id: "msg-7b",
        role: "user",
        content: "Yes! Show me the AuthContext example",
        timestamp: new Date(Date.now() - 60000 * 4).toISOString(),
      },
      {
        id: "msg-8b",
        role: "assistant",
        content:
          "Here's how our AuthContext works:\n\n```typescript\nconst AuthContext = createContext(null);\n\nexport function AuthProvider({ children }) {\n  const [user, setUser] = useState(null);\n  \n  useEffect(() => {\n    const unsubscribe = onAuthStateChanged(auth, setUser);\n    return unsubscribe;\n  }, []);\n  \n  return (\n    <AuthContext.Provider value={{ user }}>\n      {children}\n    </AuthContext.Provider>\n  );\n}\n```\n\nSimple and powerful!",
        timestamp: new Date(Date.now() - 60000 * 3).toISOString(),
      },
    ],
  },
  "branch-zustand": {
    id: "branch-zustand",
    name: "Zustand Alternative",
    color: "#F59E0B",
    parentId: "main",
    parentMessageId: "msg-4",
    messages: [
      {
        id: "msg-5c",
        role: "user",
        content: "What about Zustand? Is it better?",
        timestamp: new Date(Date.now() - 60000 * 5).toISOString(),
      },
      {
        id: "msg-6c",
        role: "assistant",
        content:
          "Zustand is excellent for simplicity! It's:\n\n✅ Minimal boilerplate\n✅ No providers needed\n✅ TypeScript-friendly\n✅ Small bundle size\n\nPerfect for small to medium apps. Here's a complete store:\n\n```typescript\nimport create from \"zustand\";\n\nconst useStore = create((set) => ({\n  count: 0,\n  increment: () => set((state) => ({ count: state.count + 1 })),\n}));\n```\n\nThat's it!",
        timestamp: new Date(Date.now() - 60000 * 4).toISOString(),
      },
    ],
  },
  "branch-nested": {
    id: "branch-nested",
    name: "Nested Branch - Redux vs Context",
    color: "#EC4899",
    parentId: "branch-redux",
    parentMessageId: "msg-8a",
    messages: [
      {
        id: "msg-9a",
        role: "user",
        content: "When should I use Redux vs Context?",
        timestamp: new Date(Date.now() - 60000 * 2).toISOString(),
      },
      {
        id: "msg-10a",
        role: "assistant",
        content:
          "**Use Redux when:**\n• Large, complex state\n• Need time-travel debugging\n• Multiple developers\n• Heavy state updates\n\n**Use Context when:**\n• Simple global state\n• Small team\n• Theme, auth, language\n• Less frequent updates\n\nFor this app, Context is perfect! 🎯",
        timestamp: new Date(Date.now() - 60000 * 1).toISOString(),
      },
    ],
  },
};

export const MOCK_CHATS: Chat[] = [MOCK_CHAT];
