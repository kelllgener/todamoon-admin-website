"use client";

import React from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useAuth } from "@/app/auth/useAuth";
import { usePathname } from "next/navigation";
import Loading from "../components/Loading";

const Dashboard = () => {
  const { user, loading, userData } = useAuth(); // Use the useAuth hook
  const pathname = usePathname();

  if (loading) return <Loading />; // Render loading state
  if (!user) return null; // Render nothing if not authenticated

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-row flex-grow">
        <Sidebar currentPath={pathname} />
        <div className="flex flex-col flex-grow">
          <Header
            userEmail={userData?.email || "User"}
            userRole={userData?.role || "Guest"} // Access role from userData
          />
          <div className="flex flex-col flex-grow border-2 p-6">
            <p>Dashboard</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
