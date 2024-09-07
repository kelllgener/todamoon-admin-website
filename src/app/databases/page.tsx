"use client";
import React from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useAuth } from "@/app/auth/useAuth";
import { usePathname } from "next/navigation"; // Or useRouter if working
import Loading from "../components/Loading";
import DriverDatabase from "../components/DriverDatabase";
import PassengerDatabase from "../components/PassengerDatabase";
import WebsiteUserDatabase from "../components/WebsiteUserDatabase";

const Database = () => {
  const { user, loading, userData } = useAuth();
  const pathname = usePathname();

  if (loading) return <Loading />; // Render loading state
  if (!user) return null; // Render nothing if not authenticated

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-row flex-grow">
        <Sidebar currentPath={pathname} />
        <div className="flex flex-col flex-grow">
          <Header
            userEmail={user.email || "User"}
            userRole={userData?.role || "Guest"}
          />
          <div className="flex flex-col flex-grow border-2 p-6">
            <div role="tablist" className="tabs tabs-lifted">
              <input
                type="radio"
                name="my_tabs_1"
                role="tab"
                className="tab"
                aria-label="Drivers"
              />
              <div role="tabpanel" className="tab-content p-10">
                <DriverDatabase />
              </div>

              <input
                type="radio"
                name="my_tabs_1"
                role="tab"
                className="tab"
                aria-label="Passengers"
                defaultChecked
              />
              <div role="tabpanel" className="tab-content p-10">
                <PassengerDatabase />
              </div>

              <input
                type="radio"
                name="my_tabs_1"
                role="tab"
                className="tab"
                aria-label="Website Users"
                defaultChecked
              />
              <div role="tabpanel" className="tab-content p-10">
                <WebsiteUserDatabase />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Database;
