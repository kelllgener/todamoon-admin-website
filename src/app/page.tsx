"use client"; // Ensure this component is treated as a Client Component

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/useAuth";

const Home = () => {
  const { user, loading } = useAuth(); // Use the useAuth hook
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard"); // Redirect to dashboard if logged in
      } else {
        router.push("/login"); // Redirect to login if not authenticated
      }
    }
  }, [user, loading, router]);

  // Render nothing while loading
  if (loading) return null;

  return null; // This will not be rendered because of the redirection
};

export default Home;
