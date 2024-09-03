"use client";
import React from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useAuth } from "@/app/auth/useAuth";
import DriverRegistrationForm from "../components/DriverRegistrationForm";
import { usePathname } from "next/navigation"; // Or useRouter if working

const RegisterDriver = () => {
  const user = useAuth();
  const pathname = usePathname(); // Or useRouter

  if (!user) return null; // Render nothing if not authenticated (redirecting)

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-row flex-grow">
        <Sidebar currentPath={pathname} />
        <div className="flex flex-col flex-grow">
          <Header userEmail={user.email || "User"} />
          <div className="flex flex-col flex-grow border-2 p-6">
            <DriverRegistrationForm />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterDriver;