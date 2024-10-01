"use client";

import React from "react";
import SidebarRow from "./SidebarRow";
import {
  UserPlusIcon,
  CurrencyDollarIcon,
  PresentationChartLineIcon,
  CircleStackIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
  currentPath: string;
  isSidebarOpen: boolean; // Pass the state
  toggleSidebar: () => void; // Function to toggle sidebar
  userRole: string; // Add userRole to props
}

const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  isSidebarOpen,
  toggleSidebar,
  userRole,
}) => {
  return (
    <div className="relative">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transform fixed left-0 h-full bg-gray-300 shadow-lg sm:translate-x-0 sm:relative sm:flex flex-col 
         justify-between max-w-[250px] xl:min-w-[250px] transition-transform duration-300 ease-in-out z-40`}
      >
        <div>
          <div className="space-y-2">
            <SidebarRow
              Icon={PresentationChartLineIcon}
              title="Dashboard"
              href="/dashboard"
              active={currentPath === "/dashboard"}
            />
            <SidebarRow
              Icon={CreditCardIcon}
              title="Recharge Balance"
              href="/recharge-balance"
              active={currentPath === "/recharge-balance"}
            />
            <SidebarRow
              Icon={CurrencyDollarIcon}
              title="Terminal Fee"
              href="/terminal-fee"
              active={currentPath === "/terminal-fee"}
            />
            <SidebarRow
              Icon={UserPlusIcon}
              title="Register Driver"
              href="/register-driver"
              active={currentPath === "/register-driver"}
            />
            {userRole === "ADMINISTRATOR" && ( 
              <SidebarRow
                Icon={CircleStackIcon}
                title="Databases"
                href="/databases"
                active={currentPath === "/databases"}
              />
            )}
          </div>
        </div>
      </div>

      {/* Overlay for when the sidebar is open on small screens */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 sm:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default Sidebar;
