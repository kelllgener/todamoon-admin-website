// utils/firestoreUtils.ts
import { doc, getDoc, updateDoc, deleteDoc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from "@/app/firebase/config"; // Adjust import based on your setup
import { User } from "firebase/auth";

export const fetchUserData = async (user: User | null) => {
  if (!user) {
    throw new Error("User is not authenticated");
  }

  try {
    const userDoc = await getDoc(doc(db, "website-users", user.uid));
    if (userDoc.exists()) {
      return userDoc.data(); // Returns user data
    } else {
      throw new Error("User not found in Firestore");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export async function fetchTerminalFee() {
  try {
    const feeDoc = await getDoc(doc(db, 'dashboard-counts', 'terminal-fee'));
    if (feeDoc.exists()) {
      const terminalData = feeDoc.data();
      return terminalData?.fee;
    }
  } catch (error) {
    console.error('Error fetching terminal fee:', error);
    return null;
  }
}

export async function fetchUserDataFromFirestore(userId: string) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      console.log(`User with UID ${userId} not found in Firestore.`);
      return null;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}