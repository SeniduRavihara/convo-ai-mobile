# Troubleshooting Guide

Common issues and solutions for the Convo AI Mobile App.

---

## 🔴 Authentication Issues

### Issue: "Auth state not persisting"

**Symptoms**: User is logged out when app restarts

**Solution**:

1. Check that AsyncStorage is properly installed:

   ```bash
   npx expo install @react-native-async-storage/async-storage
   ```

2. Verify in `firebase/firebase-config.ts`:

   ```typescript
   import { initializeAuth, getReactNativePersistence } from "firebase/auth";
   import AsyncStorage from "@react-native-async-storage/async-storage";

   const auth = initializeAuth(app, {
     persistence: getReactNativePersistence(AsyncStorage),
   });
   ```

---

### Issue: "Firebase Auth Error: network-request-failed"

**Symptoms**: Can't sign up or log in

**Solution**:

1. Check internet connection
2. Verify Firebase project is active in Firebase Console
3. Check if email/password auth is enabled in Firebase Console → Authentication → Sign-in method

---

## 🔴 Navigation Issues

### Issue: "Can't navigate to /chat"

**Symptoms**: TypeScript error about route not existing

**Solution**:

1. Ensure `chat.tsx` is in the `app/` directory (not in `app/(tabs)/`)
2. Restart TypeScript server: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
3. Clear Metro cache: `npx expo start --clear`

---

## 🔴 API Connection Issues

### Issue: "Network request failed" when sending messages

**Symptoms**: Messages send but no AI response

**Solution**:

#### For Local Development:

1. **Find your local IP**:

   ```bash
   # Mac/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. **Update config/api.ts**:

   ```typescript
   BASE_URL: "http://192.168.1.100:3000"; // Your IP here
   ```

3. **Ensure phone and computer are on same WiFi**

#### For ngrok:

1. **Start Next.js**:

   ```bash
   cd ai-root-chat
   npm run dev
   ```

2. **Start ngrok**:

   ```bash
   ngrok http 3000
   ```

3. **Use the https URL** in `config/api.ts`

---

## 🔴 Metro Bundler Issues

### Issue: "Unable to resolve module"

**Symptoms**: Import errors, module not found

**Solution**:

```bash
# Clear cache and restart
npx expo start --clear

# If that doesn't work, reinstall dependencies
rm -rf node_modules
npm install
npx expo start --clear
```

---

### Issue: "Port 8081 already in use"

**Symptoms**: Metro bundler won't start

**Solution**:

```bash
# Mac/Linux - Kill process on port 8081
lsof -ti:8081 | xargs kill

# Windows - Kill process on port 8081
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Then restart
npx expo start
```

---

## 🔴 Firestore Issues

### Issue: "Chats not loading" or "Chats not updating"

**Symptoms**: Empty chat list or changes don't sync

**Solution**:

1. **Check Firestore rules** in Firebase Console:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

2. **Check user data exists**:

   - Go to Firebase Console → Firestore Database
   - Look for `users/{uid}` document
   - Should have `userName` and `email` fields

3. **Check context provider is wrapping app**:
   ```typescript
   // app/_layout.tsx should have:
   <AuthContextProvider>
     <DataContextProvider>{/* ... */}</DataContextProvider>
   </AuthContextProvider>
   ```

---

## 🔴 TypeScript Errors

### Issue: "Cannot find module" or type errors

**Symptoms**: Red squiggly lines in VS Code

**Solution**:

1. **Restart TypeScript server**:

   - Cmd/Ctrl + Shift + P
   - Type: "TypeScript: Restart TS Server"

2. **Check file paths** are correct (relative imports)

3. **Regenerate types**:
   ```bash
   rm -rf node_modules
   npm install
   ```

---

## 🔴 iOS Specific Issues

### Issue: "Command PhaseScriptExecution failed"

**Symptoms**: Build fails on iOS

**Solution**:

```bash
cd ios
pod deintegrate
pod install
cd ..
npx expo run:ios
```

---

### Issue: "No development team found"

**Symptoms**: Can't build on iOS

**Solution**:

1. Open Xcode
2. Open `ios/[YourApp].xcworkspace`
3. Select your project → Signing & Capabilities
4. Select your development team

---

## 🔴 Android Specific Issues

### Issue: "Could not connect to development server"

**Symptoms**: Android app shows red screen

**Solution**:

1. **Enable debugging**:

   - Shake device → Dev Settings → Debug server host & port
   - Enter: `YOUR_IP:8081`

2. **Reverse ADB port**:
   ```bash
   adb reverse tcp:8081 tcp:8081
   ```

---

## 🔴 Performance Issues

### Issue: "App is slow or laggy"

**Symptoms**: UI feels sluggish

**Solution**:

1. **Enable Hermes** (already enabled in Expo 54)

2. **Check for unnecessary re-renders**:

   - Context providers use memoization ✅
   - FlatList has proper `keyExtractor` ✅

3. **Reduce real-time listeners**:
   - Already optimized with cleanup functions ✅

---

## 🔴 Build Issues

### Issue: "Expo build fails"

**Symptoms**: Can't create production build

**Solution**:

```bash
# Clear everything and rebuild
npx expo prebuild --clean
npx expo run:ios
# or
npx expo run:android
```

---

## 🔴 Hot Reload Not Working

### Issue: "Changes don't appear"

**Symptoms**: Edit files but app doesn't update

**Solution**:

1. **Fast Refresh**: Shake device → Enable Fast Refresh
2. **Restart**: Press 'r' in Metro terminal
3. **Clear cache**: `npx expo start --clear`

---

## 📱 Testing Checklist

If you're experiencing issues, test these in order:

- [ ] Can you run `npx expo start` without errors?
- [ ] Can you see the app in Expo Go / Simulator?
- [ ] Can you sign up with a new account?
- [ ] Does the auth persist when you close and reopen the app?
- [ ] Can you create a new conversation?
- [ ] Can you see the conversation in the list?
- [ ] Can you send a message?
- [ ] Does the message appear in Firestore? (Check Firebase Console)

---

## 🆘 Still Having Issues?

### Check These Files

1. **`firebase/firebase-config.ts`** - Firebase initialization
2. **`context/AuthContext.tsx`** - Auth state management
3. **`context/DataContext.tsx`** - Data state management
4. **`app/_layout.tsx`** - Context providers are wrapping app
5. **`config/api.ts`** - API URL is correct

### Enable Debug Logging

Add this to see what's happening:

```typescript
// In any component
useEffect(() => {
  console.log("Current User:", currentUser);
  console.log("All Chats:", allChats);
  console.log("Branches Data:", branchesData);
}, [currentUser, allChats, branchesData]);
```

### Check Metro Logs

Look at the terminal where `npx expo start` is running for error messages.

### Check Device Logs

- **iOS**: Xcode → Window → Devices and Simulators → Select device → Console
- **Android**: `adb logcat`

---

## 💡 Pro Tips

1. **Always restart Metro after installing packages**:

   ```bash
   npx expo start --clear
   ```

2. **Use TypeScript errors as hints** - they usually point to the issue

3. **Check Firebase Console** - verify data is being written

4. **Test on multiple devices** - iOS and Android can behave differently

5. **Use Expo Go for quick testing** - don't build native unless necessary

---

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Firebase JS SDK Docs](https://firebase.google.com/docs/web/setup)
- [React Native Docs](https://reactnative.dev/)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)

---

**If you're still stuck, check the console logs and error messages carefully. They usually tell you exactly what's wrong!** 🔍
