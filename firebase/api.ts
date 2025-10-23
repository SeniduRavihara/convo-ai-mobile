// Firebase API functions for Firestore operations
import { User } from "firebase/auth";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { BranchWithMessages, UserDataType } from "../types";
import { db } from "./firebase-config";

/**
 * Fetch current user data from Firestore
 */
export const fetchCurrentUserData = async (
  currentUser: User
): Promise<UserDataType | null> => {
  try {
    const documentRef = doc(db, "users", currentUser.uid);
    const userDataDoc = await getDoc(documentRef);

    if (userDataDoc.exists()) {
      const userData = userDataDoc.data() as UserDataType;
      console.log("Current user data fetched successfully");
      return userData;
    } else {
      console.log("Document does not exist.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

/**
 * Fetch user branch data from Firestore
 */
export const fetchUserBranchData = async (
  userId: string
): Promise<Record<string, BranchWithMessages>> => {
  const collectionRef = collection(db, "users", userId, "branches");

  try {
    const querySnapshot = await getDocs(collectionRef);
    const branchData: Record<string, BranchWithMessages> = {};

    querySnapshot.forEach((doc) => {
      const branch = doc.data() as BranchWithMessages;
      branchData[branch.id] = branch;
    });

    console.log(
      `Successfully retrieved ${
        Object.keys(branchData).length
      } branches from Firestore for user: ${userId}`
    );
    return branchData;
  } catch (error) {
    console.error("Error retrieving data from Firestore:", error);
    throw error;
  }
};

/**
 * Add mock data to Firestore (for testing)
 */
export const addMockData = async (
  userId: string,
  chatId: string,
  mockBranchesData: Record<string, BranchWithMessages>
): Promise<void> => {
  const collectionRef = collection(
    db,
    "users",
    userId,
    "chats",
    chatId,
    "branches"
  );

  try {
    const branches = Object.values(mockBranchesData);

    await Promise.all(
      branches.map((branch) => setDoc(doc(collectionRef, branch.id), branch))
    );

    console.log(
      `Successfully added ${branches.length} branches to Firestore for user: ${userId}`
    );
  } catch (error) {
    console.error("Error adding mock data to Firestore:", error);
    throw error;
  }
};
