# 🌳 Branching Conversation Tree - Mobile App

A React Native mobile app with **branching conversation trees** and **context separation** - explore multiple conversation paths simultaneously with AI!

![React Native](https://img.shields.io/badge/React_Native-0.81.5-blue)
![Expo](https://img.shields.io/badge/Expo-54-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Firebase](https://img.shields.io/badge/Firebase-12.4.0-orange)

---

## 🚀 Features

✅ **Branching Conversation Trees** - Create multiple conversation paths from any message  
✅ **Context Separation** - Each branch maintains its own isolated context  
✅ **Message Inheritance** - Child branches inherit parent messages up to fork point  
✅ **AI Streaming Responses** - Real-time character-by-character streaming (like ChatGPT)  
✅ **Auto-Naming** - AI automatically names chats and branches based on content  
✅ **Visual Indicators** - Fork points and branch transitions clearly marked  
✅ **Branch Visualizations** - List view and horizontal tree flow view  
✅ **Firebase Sync** - Real-time synchronization across devices  
✅ **Cross-Platform** - Works on iOS and Android

---

## 📦 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npx expo start
```

Then press:

- `i` for iOS simulator
- `a` for Android emulator
- Scan QR code with Expo Go app on your phone

---

## ⚙️ Configuration

### API Setup (Required for AI Streaming)

1. Open `app/chat.tsx`
2. Update line 45 with your backend URL:

```typescript
const API_BASE_URL = "https://your-backend-url.com";
```

See **[API Configuration Guide](docs/API_CONFIGURATION.md)** for detailed setup instructions.

### Firebase Setup

Firebase is already configured. To use your own Firebase project:

1. Update `firebase/firebase-config.ts` with your credentials
2. Enable Firestore and Authentication in Firebase Console
3. Set up authentication (Email/Password)

---

## 🧪 Testing

### Test with Mock Data (No API needed)

```bash
1. Run the app
2. Tap "Load Mock Data" button
3. Explore 5 pre-configured branches
4. Test branch switching and context separation
```

### Test with Real API

```bash
1. Configure API_BASE_URL (see above)
2. Create new chat
3. Send message
4. AI response streams in real-time
5. Chat auto-names after 2 messages
```

---

## 📂 Project Structure

```
convo-ai-mobile/
├── app/                      # File-based routing
│   ├── index.tsx            # Home screen (chat list)
│   ├── chat.tsx             # Main chat interface
│   ├── login/               # Auth screens
│   └── signup/
├── components/              # Reusable components
│   ├── BranchBottomSheet.tsx
│   ├── BranchFlowView.tsx
│   └── BranchPicker.tsx
├── services/                # Business logic
│   ├── branchTreeService.ts # Tree traversal & inheritance
│   ├── aiService.ts         # AI streaming & naming
│   └── messageService.ts    # Message utilities
├── firebase/                # Firebase integration
│   ├── firebase-config.ts
│   └── services/
├── utils/                   # Helper functions
└── docs/                    # Documentation
```

---

## 🌳 How Branching Works

```
Main Branch
├─ Message 1: "What is React?"
├─ Message 2: "React is a JavaScript library..."
└─ Message 3: "Tell me about hooks" ← FORK POINT
    ├─ Branch A: "useState Hook" (inherits 1-3, adds own)
    │   ├─ Message 4a: "useState manages state..."
    │   └─ Message 5a: "Here's an example..."
    │
    └─ Branch B: "useEffect Hook" (inherits 1-3, adds own)
        ├─ Message 4b: "useEffect handles side effects..."
        └─ Message 5b: "Common use cases..."
```

**Each branch maintains complete context isolation!** 🎯

---

## 📖 Documentation

- **[Full Functionality Guide](docs/FULL_FUNCTIONALITY_GUIDE.md)** - Complete feature overview
- **[API Configuration](docs/API_CONFIGURATION.md)** - Backend setup instructions
- **[Implementation Details](docs/IMPLEMENTATION_SUMMARY.md)** - Technical documentation

---

## 🛠️ Tech Stack

- **Framework**: React Native (Expo 54)
- **Language**: TypeScript
- **Routing**: Expo Router (File-based)
- **Backend**: Firebase (Firestore + Auth)
- **State**: React Context API
- **UI**: React Native components + custom styles
- **Animations**: React Native Reanimated
- **Gestures**: React Native Gesture Handler

---

## 🔑 Key Features Explained

### Context Separation

Each branch maintains its own conversation thread. Messages are inherited from parent branches up to the fork point, then each branch adds its own messages.

### AI Streaming

Responses stream character-by-character in real-time using Server-Sent Events (SSE), providing a ChatGPT-like experience.

### Auto-Naming

After the first message exchange, AI analyzes the conversation and generates a descriptive name (under 5 words) for better organization.

### Visual Indicators

- **Fork Points**: Messages with child branches show blue borders and branch count badges
- **Branch Transitions**: Dividers mark where inherited messages end and branch-specific messages begin
- **Streaming**: Live "AI is typing..." indicator during response generation

---

## 📱 Screenshots

_(Add screenshots of your app here)_

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev)
- Powered by [Firebase](https://firebase.google.com)
- AI integration ready for Google Gemini or OpenAI

---

## 📞 Support

For detailed documentation, see the **[docs](docs/)** folder.

For issues or questions, please open an issue on GitHub.

---

**Made with ❤️ for exploring conversations in multiple dimensions** 🌳✨
