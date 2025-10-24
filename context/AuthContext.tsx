// Authentication Context Provider for React Native
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged, User } from "firebase/auth";
import React, { createContext, useEffect, useState } from "react";
import { INITIAL_AUTH_CONTEXT } from "../constants";
import { auth } from "../firebase/firebase-config";
import { AuthContextType } from "../types";

export const AuthContext = createContext<AuthContextType>(INITIAL_AUTH_CONTEXT);

interface AuthContextProviderProps {
  children: React.ReactNode;
}

const AuthContextProvider: React.FC<AuthContextProviderProps> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Check for persisted user on mount
    const checkPersistedAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser && isMounted) {
          console.log("Found persisted user data");
        }
      } catch (error) {
        console.error("Error checking persisted auth:", error);
      }
    };

    checkPersistedAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      try {
        if (!user) {
          setCurrentUser(null);
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("user");
          console.log("Auth state changed: LoggedOut");
        } else {
          setCurrentUser(user);
          const accessToken = await user.getIdToken();
          await AsyncStorage.setItem("token", accessToken);
          await AsyncStorage.setItem("user", JSON.stringify(user));
          console.log("Auth state changed: LoggedIn", user.email);
        }
      } catch (error) {
        console.error("Error during auth state change:", error);
        if (isMounted) {
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    currentUser,
    setCurrentUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContextProvider;
