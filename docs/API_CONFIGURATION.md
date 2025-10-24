# ⚙️ API Configuration Guide

## Quick Setup for AI Streaming

Your mobile app is **fully implemented** and ready to use! You just need to configure your backend URL.

---

## 📍 Step 1: Update API URL

**File**: `convo-ai-mobile/app/chat.tsx`

**Find Line 45**:
```typescript
const API_BASE_URL = "https://your-api-url.com"; // TODO: Update with actual API URL
```

**Replace with your backend URL**:
```typescript
const API_BASE_URL = "https://myapp.herokuapp.com"; // Your actual URL
// OR
const API_BASE_URL = "https://api.myapp.com";
// OR (for local testing)
const API_BASE_URL = "http://192.168.1.100:3000"; // Your computer's local IP
```

---

## 🔌 Step 2: Backend Requirements

Your backend needs **2 endpoints**:

### Endpoint 1: Streaming Chat
```
POST /api/chat
Content-Type: application/json

Request Body:
{
  "question": "User's message",
  "history": [
    { 
      "role": "user", 
      "parts": [{ "text": "Previous user message" }] 
    },
    { 
      "role": "model", 
      "parts": [{ "text": "Previous AI response" }] 
    }
  ],
  "apiKey": "optional-user-api-key"
}

Response (Server-Sent Events):
data: {"delta": "Hello", "done": false}

data: {"delta": " there!", "done": false}

data: {"delta": " How can", "done": false}

data: {"delta": " I help?", "done": false}

data: {"done": true}

data: [DONE]

```

### Endpoint 2: Naming API
```
GET /api/chat2?question=<prompt>&type=naming&apiKey=<optional>

Response:
{
  "answer": "Generated Name"
}
```

---

## 🚀 Step 3: Test It!

### Without API (Mock Data):
```
1. Open app
2. Tap "Load Mock Data"
3. Test branch switching
4. Everything works! (except AI responses)
```

### With API Configured:
```
1. Create new chat
2. Send message
3. AI response streams in real-time! 🎉
4. Chat auto-names after 2 messages
5. Branches auto-name when created
```

---

## 🔧 Alternative: Use Web App's API

If you already have the Next.js web app deployed:

```typescript
// Use your deployed web app's URL
const API_BASE_URL = "https://your-nextjs-app.vercel.app";
```

The mobile app will call the same API routes as the web app!

---

## 🏠 Local Testing (Development)

### Option A: Use your computer's local IP
```typescript
// Find your IP: ipconfig (Windows) or ifconfig (Mac/Linux)
const API_BASE_URL = "http://192.168.1.100:3000";
```

### Option B: Use ngrok
```bash
# In your Next.js project:
npm run dev  # Start on localhost:3000

# In another terminal:
ngrok http 3000

# Use the ngrok URL:
const API_BASE_URL = "https://abc123.ngrok.io";
```

---

## 📝 Backend Code Examples

### Using Google Gemini (Recommended):

```typescript
// pages/api/chat.ts (Next.js)
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  const { question, history, apiKey } = req.body;
  
  const genAI = new GoogleGenerativeAI(apiKey || process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(question);
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  for await (const chunk of result.stream) {
    const text = chunk.text();
    res.write(`data: ${JSON.stringify({ delta: text, done: false })}\n\n`);
  }
  
  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.write(`data: [DONE]\n\n`);
  res.end();
}
```

### Using OpenAI:

```typescript
// pages/api/chat.ts (Next.js)
import OpenAI from "openai";

export default async function handler(req, res) {
  const { question, history, apiKey } = req.body;
  
  const openai = new OpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY });
  
  const messages = history.map(msg => ({
    role: msg.role === "model" ? "assistant" : "user",
    content: msg.parts[0].text
  }));
  
  messages.push({ role: "user", content: question });
  
  const stream = await openai.chat.completions.create({
    model: "gpt-4",
    messages,
    stream: true
  });
  
  res.setHeader('Content-Type', 'text/event-stream');
  
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || "";
    if (text) {
      res.write(`data: ${JSON.stringify({ delta: text, done: false })}\n\n`);
    }
  }
  
  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.write(`data: [DONE]\n\n`);
  res.end();
}
```

---

## 🐛 Troubleshooting

### Error: "API Not Configured"
**Solution**: Update `API_BASE_URL` in `chat.tsx`

### Error: "Network request failed"
**Solutions**:
- ✅ Check API URL is correct
- ✅ Check backend is running
- ✅ For local testing, use your IP address (not localhost)
- ✅ Check phone and computer are on same WiFi

### Error: "Streaming not working"
**Solutions**:
- ✅ Verify backend returns SSE format
- ✅ Check `Content-Type: text/event-stream` header
- ✅ Ensure response format matches: `data: {...}\n\n`

### Messages not saving
**Solutions**:
- ✅ Check Firebase configuration
- ✅ Verify user is logged in
- ✅ Check Firebase rules allow writes

---

## ✅ Verification Checklist

After configuration, test these:

- [ ] App opens without errors
- [ ] Mock data loads correctly
- [ ] Can switch branches
- [ ] Fork points show blue borders
- [ ] Branch transitions show dividers
- [ ] Can create new chat
- [ ] Can send message
- [ ] AI response streams in real-time
- [ ] Chat auto-names after 2 messages
- [ ] Branch auto-names when created
- [ ] Messages save to Firebase
- [ ] Messages sync across devices

---

## 🎉 You're Done!

Once configured, your mobile app will have **full AI streaming functionality** with:
- ✅ Real-time streaming responses
- ✅ Auto-naming for chats and branches
- ✅ Complete branch tree system
- ✅ Context separation
- ✅ Visual indicators
- ✅ Professional UI

**Ready to ship!** 🚀📱
