// Firebase configuration for React Native
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAI4RB4drp6DFn915g6Ju3r6rEOOrROXI8",
  authDomain: "convo-tree-ai.firebaseapp.com",
  projectId: "convo-tree-ai",
  storageBucket: "convo-tree-ai.firebasestorage.app",
  messagingSenderId: "148424182787",
  appId: "1:148424182787:web:95682b17241501b29c5236",
  measurementId: "G-0HDQH01FYW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence for React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore and Storage
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
