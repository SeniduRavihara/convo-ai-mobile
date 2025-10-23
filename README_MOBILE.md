# Convo AI Mobile App

A complete React Native mobile application built with Expo that mirrors the functionality of the ai-root-chat Next.js web app. This app includes Firebase authentication, real-time chat functionality, and AI-powered conversations.

## 📱 Features

- ✅ **Firebase Authentication** (Email/Password)
- ✅ **Real-time Chat** with Firestore
- ✅ **Conversation Management** (Create, view, search)
- ✅ **Branch-based Chat System**
- ✅ **Dark Mode UI**
- ✅ **Offline Persistence** with AsyncStorage
- 🔄 **AI Integration** (Ready to connect to your API)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator

### Installation

1. **Install dependencies:**

   ```bash
   cd convo-ai-mobile
   npx expo install
   ```

2. **Start the development server:**

   ```bash
   npx expo start
   ```

3. **Run on a device/simulator:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan the QR code with Expo Go app on your physical device

## 📁 Project Structure

```
convo-ai-mobile/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   │   └── index.tsx      # Home/Conversations list
│   ├── login.tsx          # Login screen
│   ├── signup.tsx         # Signup screen
│   ├── chat.tsx           # Chat conversation screen
│   └── _layout.tsx        # Root layout with context providers
├── firebase/              # Firebase configuration and services
│   ├── firebase-config.ts # Firebase initialization
│   ├── api.ts            # Firestore API functions
│   └── services/
│       ├── AuthService.ts # Authentication methods
│       └── ChatService.ts # Chat and branch management
├── context/               # React Context providers
│   ├── AuthContext.tsx   # Authentication state
│   └── DataContext.tsx   # User data and chats state
├── services/              # Business logic
│   ├── aiService.ts      # AI API integration
│   └── messageService.ts # Message creation helpers
├── utils/                 # Utility functions
│   └── branchHelpers.ts  # Branch manipulation helpers
├── hooks/                 # Custom React hooks
│   └── useAuth.ts        # Auth and data hooks
├── types/                 # TypeScript type definitions
│   └── index.ts
├── constants/             # App constants and colors
│   └── index.ts
└── package.json
```

## 🔐 Firebase Configuration

The app uses the same Firebase project as the web app. The configuration is already set up in `firebase/firebase-config.ts` with:

- **Authentication**: Email/Password (AsyncStorage persistence)
- **Firestore**: Real-time database for chats and messages
- **Storage**: (Available for future features)

### Authentication Flow

1. User signs up or logs in
2. Firebase creates/authenticates user
3. User data is stored/fetched from Firestore
4. Auth state persists across app restarts
5. Protected routes redirect to login if not authenticated

## 💬 Chat Architecture

The app uses a **branch-based conversation system**:

- Each **Chat** has multiple **Branches**
- Each **Branch** contains **Messages**
- Default "main" branch is created with each new chat
- Messages are stored in Firestore with real-time sync

### Data Structure

```typescript
User (Firestore Document)
├── uid: string
├── userName: string
└── email: string

Chat (Firestore Collection: users/{uid}/chats)
├── id: string
├── name: string
├── color: string
├── createdAt: string
└── updatedAt: string

Branch (Firestore Collection: users/{uid}/chats/{chatId}/branches)
├── id: string
├── name: string
├── parentId: string | null
├── parentMessageId: string | null
├── color: string
└── messages: Message[]

Message
├── id: string
├── role: "user" | "assistant"
├── content: string
├── timestamp: string
└── branchId: string
```

## 🤖 AI Integration

The AI service is prepared but requires your API endpoint. To integrate:

### Option 1: Use Your Next.js API

1. Deploy your Next.js app or use ngrok for local testing:

   ```bash
   cd ai-root-chat
   npm run dev
   # In another terminal
   ngrok http 3000
   ```

2. Update the API endpoint in your mobile app:

   ```typescript
   // In chat.tsx or create a config file
   const API_ENDPOINT = "https://your-api-url.com/api/chat";
   ```

3. Replace the mock assistant response in `app/chat.tsx`:

   ```typescript
   import {
     sendMessageStreaming,
     parseStreamingResponse,
   } from "../services/aiService";

   // In handleSendMessage function:
   const response = await sendMessageStreaming(message, messages, API_ENDPOINT);

   let fullContent = "";
   await parseStreamingResponse(
     response,
     (delta, full) => {
       fullContent = full;
       // Update UI with streaming content
     },
     (full) => {
       // Create and save assistant message
       const assistantMessage = createAssistantMessage(full, activeBranchId);
       await addMessageToBranch(
         currentUserData.uid,
         activeChatId,
         activeBranchId,
         assistantMessage
       );
     }
   );
   ```

### Option 2: Direct Gemini API Integration

1. Install the Gemini SDK:

   ```bash
   npx expo install @google/generative-ai
   ```

2. Create a direct integration in `services/aiService.ts`
3. Store API key securely using `expo-secure-store`

## 📱 Screens Overview

### 1. Login Screen (`app/login.tsx`)

- Email and password authentication
- Link to signup page
- Loading states and error handling

### 2. Signup Screen (`app/signup.tsx`)

- Create new account with email, password, and name
- Validation and error messages
- Automatic login after signup

### 3. Home Screen (`app/(tabs)/index.tsx`)

- List of all conversations
- Search functionality
- Create new chat button
- User profile with logout

### 4. Chat Screen (`app/chat.tsx`)

- Real-time message display
- Send messages
- Keyboard-aware interface
- Auto-scroll to latest message

## 🎨 Styling

The app uses a consistent dark theme defined in `constants/index.ts`:

```typescript
export const COLORS = {
  primary: "#3B82F6", // Blue
  secondary: "#8B5CF6", // Purple
  success: "#10B981", // Green
  danger: "#EF4444", // Red
  // ... and more
};
```

All styles are created using React Native StyleSheet for optimal performance.

## 🔄 State Management

The app uses React Context API for global state:

- **AuthContext**: Current user, auth loading state
- **DataContext**: User data, chats, branches, active chat

Access context with custom hooks:

```typescript
import { useAuth, useData } from "../hooks/useAuth";

const { currentUser, loading } = useAuth();
const { allChats, activeChatId, makeChatActive } = useData();
```

## 📦 Key Dependencies

- **expo**: ~54.0.19
- **react**: 19.1.0
- **react-native**: 0.81.5
- **firebase**: Latest (installed with expo)
- **@react-native-async-storage/async-storage**: For local persistence
- **expo-router**: ~6.0.13 (File-based routing)

## 🚧 Future Enhancements

- [ ] Google Sign-In (requires expo-auth-session)
- [ ] Branch visualization and navigation
- [ ] Message editing and deletion
- [ ] Push notifications
- [ ] Image attachments
- [ ] Voice messages
- [ ] Dark/Light theme toggle
- [ ] Settings screen
- [ ] Profile customization
- [ ] Export conversations

## 🐛 Troubleshooting

### Firebase Auth Persistence Issues

If auth doesn't persist:

```typescript
// Check AsyncStorage is properly installed
import AsyncStorage from "@react-native-async-storage/async-storage";
```

### Metro Bundler Cache Issues

Clear cache and restart:

```bash
npx expo start --clear
```

### TypeScript Errors

Restart TypeScript server in VS Code:

- `Cmd/Ctrl + Shift + P`
- Type: "TypeScript: Restart TS Server"

## 📝 Notes

- The app uses Firebase JS SDK (not React Native Firebase) for compatibility with Expo Go
- Authentication persists using AsyncStorage and Firebase's built-in persistence
- All Firestore operations are real-time with `onSnapshot`
- The UI is optimized for mobile with proper keyboard handling and scrolling

## 🔗 Related Projects

- **Web App**: `ai-root-chat` (Next.js)
- **Shared Firebase Project**: convo-tree-ai

## 📄 License

This project is part of the ai-root-chat ecosystem.

---

**Built with ❤️ using Expo and Firebase**
