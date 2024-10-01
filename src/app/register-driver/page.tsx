"use client";
import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useAuth } from "@/app/auth/useAuth";
import { usePathname } from "next/navigation"; // Or useRouter if working
import DriverRegistrationForm from "../components/DriverRegistrationForm";
import Loading from "../components/Loading";

const RegisterDriver = () => {
  const { user, loading, userData } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) return <Loading />; // Render loading state
  if (!user) return null; // Render nothing if not authenticated

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        userEmail={userData?.email || "User"}
        userRole={userData?.role || "Guest"}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      <div className="flex flex-row flex-grow">
        <Sidebar
          currentPath={pathname}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          userRole={userData?.role || "GUEST"} // Pass the user role here
        />
        <div className="flex flex-col flex-grow">
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
