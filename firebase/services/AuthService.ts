// Authentication Service for React Native
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase-config";

/**
 * Sign out the current user
 */
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

/**
 * Sign in with email and password
 */
export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

/**
 * Sign up with email, password and name
 */
export const signup = async ({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}): Promise<void> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Create user document in Firestore
    const payload = {
      uid: user.uid,
      userName: name,
      email: email,
    };

    await setDoc(doc(db, "users", user.uid), payload);
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};

/**
 * Note: Google Sign-In for React Native requires additional setup
 * For now, we'll focus on email/password authentication
 * To implement Google Sign-In, you'll need:
 * 1. expo-auth-session or @react-native-google-signin/google-signin
 * 2. Configure OAuth credentials in Firebase Console
 * 3. Set up redirect URIs
 */
export const googleSignIn = async (): Promise<User> => {
  // This is a placeholder - implement with expo-auth-session if needed
  throw new Error(
    "Google Sign-In not implemented yet. Please use email/password authentication."
  );
};
