"use client";

import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useAuth } from "@/app/auth/useAuth";
import { usePathname } from "next/navigation";
import Loading from "../components/Loading";
import DriverDatabase from "../components/DriverDatabase";
import PassengerDatabase from "../components/PassengerDatabase";
import WebsiteUserDatabase from "../components/WebsiteUserDatabase";
import TransactionDatabase from "../components/TransactionDatabase";
import BillingRecordsDatabase from "../components/BillingRecordsDatabase";
import { useRouter } from "next/navigation";

const Database = () => {
  const { user, loading, userData } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter(); // Initialize useRouter for redirection

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const tabsForDatabases = [
    "Billing Records",
    "Drivers",
    "Passengers",
    "Queueing Transactions",
    "Website Users",
  ];

  useEffect(() => {
    // Redirect if the user is not an administrator
    if (!loading && (!user || userData?.role !== "ADMINISTRATOR")) {
      router.push('/'); // Redirect to the home page (or another page)
    }
  }, [loading, user, userData, router]);

  if (loading) return <Loading />;

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
          <div role="tablist" className="tabs tabs-lifted overflow-x-auto max-w-[430px] sm:max-w-[630px] md:max-w-full shadow-lg">
            {tabsForDatabases.map((tab) => (
              <React.Fragment key={tab}>
                <input
                  type="radio"
                  name="my_tabs_1"
                  role="tab"
                  className="tab whitespace-nowrap"
                  aria-label={tab}
                  defaultChecked={tab === "Billing Records"}
                />
                <div role="tabpanel" className="tab-content p-4">
                  {tab === "Billing Records" && <BillingRecordsDatabase />}
                  {tab === "Drivers" && <DriverDatabase />}
                  {tab === "Passengers" && <PassengerDatabase />}
                  {tab === "Queueing Transactions" && <TransactionDatabase />}
                  {tab === "Website Users" && <WebsiteUserDatabase />}
                </div>
              </React.Fragment>
            ))}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Database;
