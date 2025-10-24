# Quick Start Guide

## 🚀 Running the Mobile App

### 1. Install Dependencies

```bash
cd convo-ai-mobile
npm install
```

### 2. Start the Development Server

```bash
npx expo start
```

### 3. Run on Device

- **iOS**: Press `i` (requires Xcode on Mac)
- **Android**: Press `a` (requires Android Studio)
- **Physical Device**: Scan QR code with Expo Go app

## 🔑 Test Accounts

You can create new accounts or use these test credentials:

**Test Account:**

- Email: `test@example.com`
- Password: `test123` (create this account first)

## 🔧 Configuration Steps

### Step 1: Firebase is Already Configured ✅

The app uses the same Firebase project as the web app, so authentication and database are ready to go!

### Step 2: Connect to Your AI API

#### Option A: Use Local Next.js Server (Development)

1. Start your Next.js server:

   ```bash
   cd ../ai-root-chat
   npm run dev
   ```

2. Find your computer's local IP address:

   - **Mac/Linux**: Run `ifconfig` and look for `inet` under `en0`
   - **Windows**: Run `ipconfig` and look for `IPv4 Address`

3. Update the API configuration in `config/api.ts`:
   ```typescript
   BASE_URL: "http://YOUR_LOCAL_IP:3000"; // e.g., http://192.168.1.100:3000
   ```

#### Option B: Use ngrok (Easier for Testing)

1. Start your Next.js server:

   ```bash
   cd ../ai-root-chat
   npm run dev
   ```

2. In a new terminal, start ngrok:

   ```bash
   ngrok http 3000
   ```

3. Copy the HTTPS URL from ngrok (e.g., `https://abc123.ngrok.io`)

4. Update `config/api.ts`:
   ```typescript
   BASE_URL: "https://abc123.ngrok.io";
   ```

#### Option C: Use Deployed API (Production)

If you've deployed your Next.js app (e.g., on Vercel):

1. Update `config/api.ts`:
   ```typescript
   BASE_URL: "https://your-app.vercel.app";
   ```

### Step 3: Enable AI Responses in Chat

Currently, the app sends messages but shows a placeholder AI response. To enable real AI:

1. Open `app/chat.tsx`

2. Find the `handleSendMessage` function (around line 44)

3. Replace the mock response section with this code:

```typescript
// Remove this:
const assistantMessage = createAssistantMessage(
  "I'm a mobile app now! ...",
  activeBranchId
);

// Add this instead:
import { getApiUrl, API_CONFIG } from "../config/api";
import {
  sendMessageStreaming,
  parseStreamingResponse,
} from "../services/aiService";

// In handleSendMessage:
const response = await sendMessageStreaming(
  message,
  messages,
  getApiUrl(API_CONFIG.ENDPOINTS.CHAT)
);

let fullContent = "";
await parseStreamingResponse(
  response,
  (delta, full) => {
    fullContent = full;
    // Optionally show streaming text in real-time
  },
  async (full) => {
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

## 📱 Features to Test

1. **Authentication**

   - Sign up with a new account
   - Log in with existing credentials
   - Auth persists across app restarts

2. **Conversations**

   - Create a new conversation
   - Search conversations
   - Multiple conversations sync in real-time

3. **Messaging**

   - Send messages
   - Messages persist in Firestore
   - Real-time updates

4. **Multi-device Sync**
   - Open the web app and mobile app
   - Changes in one app appear in the other instantly

## 🐛 Common Issues

### "Network request failed"

- Check your API URL in `config/api.ts`
- Make sure your Next.js server is running
- If using local IP, ensure your phone and computer are on the same WiFi network

### "Firebase Auth Error"

- Firebase is already configured and should work
- If you see auth issues, check the console logs

### "Cannot connect to Metro"

- Run `npx expo start --clear` to clear cache
- Make sure port 8081 is not in use

### App crashes on startup

- Delete `node_modules` and run `npm install` again
- Check for TypeScript errors in the console

## 🎯 Next Steps

1. ✅ Test authentication
2. ✅ Create a conversation
3. ✅ Send a message
4. 🔄 Connect to AI API (follow Step 2 above)
5. 🎨 Customize colors in `constants/index.ts`
6. 📱 Test on physical device

## 📚 Need Help?

Check the full `README_MOBILE.md` for:

- Complete architecture documentation
- Firebase data structure
- State management guide
- Styling guide
- Troubleshooting

---

**Happy Coding! 🚀**
