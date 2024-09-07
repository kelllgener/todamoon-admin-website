// src/components/Sidebar.tsx
"use client";

import React from "react";
import SidebarRow from "./SidebarRow";
import logo from "/public/logo.png";
import {
  UserPlusIcon,
  CurrencyDollarIcon,
  PresentationChartLineIcon,
  CircleStackIcon,
  CreditCardIcon
} from "@heroicons/react/24/outline";
import Image from "next/image";

interface SidebarProps {
  currentPath: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPath }) => {
  return (
    <div className="flex flex-col justify-between max-w-[250px] xl:min-w-[250px] bg-gray-300">
      <div>
        <div className="flex justify-center h-14 mb-8 sm:mb-12 shadow-md">
          <Image
            src={logo}
            width={60}
            height={60}
            alt="logo"
            className="object-contain"
          />
        </div>
        <div className="space-y-2 sm:space-y-4">
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
            title="Terminal-Fee"
            href="/terminal-fee"
            active={currentPath === "/terminal-fee"}
          />
          <SidebarRow
            Icon={UserPlusIcon}
            title="Register Driver"
            href="/register-driver"
            active={currentPath === "/register-driver"}
          />
          <SidebarRow
            Icon={CircleStackIcon}
            title="Databases"
            href="/databases"
            active={currentPath === "/databases"}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
