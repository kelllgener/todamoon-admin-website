"use client";

import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useAuth } from "@/app/auth/useAuth";
import { usePathname } from "next/navigation";
import Loading from "../components/Loading";

import Overview from "../components/dashboardComponent/Overview";
import RecentActivity from "../components/dashboardComponent/RecentActivity";
import GrowChart from "../components/dashboardComponent/GrowChart";

const Dashboard = () => {
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
        <Sidebar
          currentPath={pathname}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          userRole={userData?.role || "GUEST"} // Pass the user role here
        />
        <main className="flex flex-col flex-grow p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 grid-rows-[auto,auto,1fr] gap-6 h-full">
            <div className="lg:col-span-1">
              <Overview />
            </div>
            <div className="lg:col-span-2">
              <GrowChart />
              <RecentActivity />
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
