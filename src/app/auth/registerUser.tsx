// auth/registerUser.ts
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/firebase/config";

export const registerUser = async (email: string, password: string) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    // Ensure that registration does not automatically log in the user
    // Do not call signIn methods here
  } catch (error) {
    console.error("Error registering user:", error);
  }
};
