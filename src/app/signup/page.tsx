'use client';
import React, { useState } from "react";
import { useAuth } from "@/app/auth/useAuth";
import SignUpForm from "../components/SignUpForm";
import Loading from "../components/Loading";
import { usePathname } from "next/navigation";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const SignUp = () => {
  const { user, loading, userData } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) return <Loading />;
  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        userEmail={userData?.email || "User"}
        userRole={userData?.role || "Guest"}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      <div className="flex flex-grow">
        <div className="flex flex-row flex-grow">
          <Sidebar
            currentPath={pathname}
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            userRole={userData?.role || "GUEST"} // Pass the user role here
          />
          <div className="flex flex-col flex-grow border-2 p-6">
            <SignUpForm />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SignUp;
