"use client";
import { useState } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, db } from "@/app/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import Loading from "../components/Loading"; // Import the Loading component

const SignUpForm = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null); // Add success state
  const [loading, setLoading] = useState<boolean>(false); // Add loading state
  const [role, setRole] = useState<string>("ADMINISTRATOR"); // Add role state

  const [createUserWithEmailAndPassword] =
    useCreateUserWithEmailAndPassword(auth);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true); // Set loading to true when registration starts
    setError(null); // Clear previous errors
    setSuccess(null); // Clear previous success messages

    try {
      const userCredential = await createUserWithEmailAndPassword(
        email,
        password
      );

      if (!userCredential) {
        throw new Error("Failed to create user");
      }

      const user = userCredential.user;

      // Add user data to Firestore
      await setDoc(doc(db, "website-users", user.uid), {
        email: user.email,
        uid: user.uid,
        createdAt: new Date().toISOString(),
        role: role, // Add role to Firestore document
      });

      console.log(
        "User created and added to Firestore successfully:",
        userCredential
      );
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setSuccess("Signup successful! Welcome to TODAMOON."); // Set success message
    } catch (e: any) {
      console.error("Error during sign-up:", e.message);

      // Handle specific Firebase Auth errors
      switch (e.code) {
        case "auth/email-already-in-use":
          setError("Email is already in use. Please use a different email.");
          break;
        case "auth/invalid-email":
          setError("Invalid email format. Please enter a valid email address.");
          break;
        case "auth/weak-password":
          setError("Password is too weak. Please choose a stronger password.");
          break;
        case "auth/missing-email":
          setError("Email is required.");
          break;
        case "auth/missing-password":
          setError("Password is required.");
          break;
        default:
          setError("An error occurred during sign-up. Please try again.");
          break;
      }
    } finally {
      setLoading(false); // Set loading to false when registration completes
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-md">
        <>
          {error && (
            <div className="alert alert-error mb-4">
              <div>
                <span>{error}</span>
              </div>
            </div>
          )}
          {success && (
            <div className="alert alert-success mb-4">
              <div>
                <span>{success}</span>
              </div>
            </div>
          )}
          <h2 className="text-2xl font-semibold text-center mb-6">
            TODAMOON Signup
          </h2>
          {loading ? (
            <Loading /> // Show Loading component while processing
          ) : (
            <form onSubmit={handleSignup}>
              <div className="mb-4">
                <label
                  className="block mb-2 text-sm text-gray-700"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="input input-bordered w-full input-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block mb-2 text-sm text-gray-700"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="input input-bordered w-full input-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  className="block mb-2 text-sm text-gray-700"
                  htmlFor="confirmPassword"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="input input-bordered w-full input-sm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-neutral w-full btn-sm">
                Signup
              </button>
            </form>
          )}
        </>
      </div>
    </div>
  );
};

export default SignUpForm;
