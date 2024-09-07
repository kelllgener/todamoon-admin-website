"use client";
import React from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useAuth } from "@/app/auth/useAuth";
import { usePathname } from "next/navigation"; // Or useRouter if working
import RechargeAmountForm from "../components/RechargeAmountForm";
import Loading from "../components/Loading";

const RechargeBalance = () => {
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
            <RechargeAmountForm />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RechargeBalance;
