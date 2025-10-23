// Enhanced Data Context with user data fetching
// This version automatically fetches user data when auth changes
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, onSnapshot } from "firebase/firestore";
import React, {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { INITIAL_DATA_CONTEXT } from "../constants";
import { fetchCurrentUserData } from "../firebase/api";
import { db } from "../firebase/firebase-config";
import { useAuth } from "../hooks/useAuth";
import {
  BranchWithMessages,
  Chat,
  DataContextType,
  UserDataType,
} from "../types";

export const DataContext = createContext<DataContextType>(INITIAL_DATA_CONTEXT);

interface DataContextProviderProps {
  children: React.ReactNode;
}

const DataContextProviderEnhanced: React.FC<DataContextProviderProps> = ({
  children,
}) => {
  const { currentUser } = useAuth();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [allChats, setAllChats] = useState<Chat[]>([]);
  const [isChatsLoading, setIsChatsLoading] = useState<boolean>(false);

  const [currentUserData, setCurrentUserData] = useState<UserDataType | null>(
    null
  );
  const [rawBranchesData, setRawBranchesData] = useState<
    Record<string, BranchWithMessages>
  >({});

  const stableBranchesDataRef = useRef<Record<string, BranchWithMessages>>({});

  // Auto-fetch user data when user logs in
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser && !currentUserData) {
        try {
          const userData = await fetchCurrentUserData(currentUser);
          setCurrentUserData(userData);
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      } else if (!currentUser && currentUserData) {
        // Clear data when user logs out
        setCurrentUserData(null);
        setAllChats([]);
        setRawBranchesData({});
        setActiveChatId(null);
      }
    };
    loadUserData();
  }, [currentUser, currentUserData]);

  // Memoize branchesData with deep comparison
  const branchesData = useMemo(() => {
    const newKeys = Object.keys(rawBranchesData).sort();
    const oldKeys = Object.keys(stableBranchesDataRef.current).sort();

    if (newKeys.join(",") !== oldKeys.join(",")) {
      stableBranchesDataRef.current = rawBranchesData;
      return rawBranchesData;
    }

    let hasChanges = false;
    for (const key of newKeys) {
      const newBranch = rawBranchesData[key];
      const oldBranch = stableBranchesDataRef.current[key];

      if (!oldBranch) {
        hasChanges = true;
        break;
      }

      if (
        newBranch.name !== oldBranch.name ||
        newBranch.parentId !== oldBranch.parentId ||
        newBranch.parentMessageId !== oldBranch.parentMessageId ||
        newBranch.color !== oldBranch.color
      ) {
        hasChanges = true;
        break;
      }

      const newMessages = newBranch.messages || [];
      const oldMessages = oldBranch.messages || [];

      if (newMessages.length !== oldMessages.length) {
        hasChanges = true;
        break;
      }

      for (let i = 0; i < newMessages.length; i++) {
        if (
          newMessages[i].id !== oldMessages[i].id ||
          newMessages[i].content !== oldMessages[i].content ||
          newMessages[i].role !== oldMessages[i].role
        ) {
          hasChanges = true;
          break;
        }
      }

      if (hasChanges) break;
    }

    if (hasChanges) {
      stableBranchesDataRef.current = rawBranchesData;
      return rawBranchesData;
    }

    return stableBranchesDataRef.current;
  }, [rawBranchesData]);

  // Subscribe to user's chats
  useEffect(() => {
    if (!currentUserData) {
      setAllChats([]);
      setIsChatsLoading(false);
      return;
    }

    setIsChatsLoading(true);

    const chatsCollectionRef = collection(
      db,
      "users",
      currentUserData.uid,
      "chats"
    );

    const unsubscribe = onSnapshot(
      chatsCollectionRef,
      (QuerySnapshot) => {
        const chatsArr = QuerySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Chat[];
        console.log(
          "📋 Chats updated from Firestore:",
          chatsArr.map((c) => ({ id: c.id, name: c.name }))
        );
        setAllChats(chatsArr);
        setIsChatsLoading(false);
      },
      (error) => {
        console.error("Error loading chats:", error);
        setIsChatsLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUserData]);

  // Load last active chat from AsyncStorage
  useEffect(() => {
    const loadActiveChatId = async () => {
      try {
        const savedChatId = await AsyncStorage.getItem("activeChatId");
        if (savedChatId) setActiveChatId(savedChatId);
      } catch (error) {
        console.error("Error loading active chat ID:", error);
      }
    };
    loadActiveChatId();
  }, []);

  // Subscribe to branches of the active chat
  useEffect(() => {
    if (!currentUserData?.uid || !activeChatId) {
      setRawBranchesData({});
      stableBranchesDataRef.current = {};
      return;
    }

    const branchesRef = collection(
      db,
      "users",
      currentUserData.uid,
      "chats",
      activeChatId,
      "branches"
    );

    const unsubscribe = onSnapshot(
      branchesRef,
      (querySnapshot) => {
        const map: Record<string, BranchWithMessages> = {};
        querySnapshot.forEach((docSnap) => {
          const branch = docSnap.data() as BranchWithMessages;
          map[branch.id] = branch;
        });

        setRawBranchesData(map);
      },
      (error) => {
        console.error("Error subscribing to branches:", error);
      }
    );

    return unsubscribe;
  }, [currentUserData?.uid, activeChatId]);

  const makeChatActive = async (id: string) => {
    console.log("Active Chat ID", id);
    setActiveChatId(id);
    try {
      await AsyncStorage.setItem("activeChatId", id);
    } catch (error) {
      console.error("Error saving active chat ID:", error);
    }
  };

  const contextValue = useMemo(
    () => ({
      currentUserData,
      setCurrentUserData,
      branchesData,
      setBranchesData: setRawBranchesData,
      makeChatActive,
      allChats,
      activeChatId,
      isChatsLoading,
    }),
    [currentUserData, branchesData, allChats, activeChatId, isChatsLoading]
  );

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

export default DataContextProviderEnhanced;
