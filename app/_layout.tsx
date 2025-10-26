import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/hooks/useAuth";
import AuthContextProvider from "../context/AuthContext";
import DataContextProvider from "../context/DataContext";

export const unstable_settings = {
  initialRouteName: "index",
};

function RootLayoutNav() {
  const { currentUser, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)" || segments[0] === undefined;
    const onLoginScreen = segments[0] === "login" || segments[0] === "signup";

    if (!currentUser && !inAuthGroup && !onLoginScreen) {
      // User is not logged in and not on auth screen, redirect to login
      console.log("Redirecting to login - no user");
      router.replace("/login");
    } else if (currentUser && (inAuthGroup || onLoginScreen)) {
      // User is logged in and on auth screen or root, redirect to home
      console.log("Redirecting to home - user logged in");
      router.replace("/");
    }
  }, [currentUser, loading, segments, router]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="chat" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", title: "Modal" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <AuthContextProvider>
        <DataContextProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <RootLayoutNav />
            <StatusBar style="light" />
          </ThemeProvider>
        </DataContextProvider>
      </AuthContextProvider>
    </SafeAreaProvider>
  );
}
