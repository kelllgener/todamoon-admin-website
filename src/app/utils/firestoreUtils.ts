import { doc, getDoc } from "firebase/firestore";
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
