// src/app/components/Header.tsx
"use client"; // Ensure this is at the top

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/app/firebase/config";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface HeaderProps {
  userEmail: string;
  userRole: string;
}

const routeTitles: { [key: string]: string } = {
  "/dashboard": "Dashboard",
  "/recharge-balance": "Recharge Balance",
  "/register-driver": "Register Driver",
  "/databases": "Databases",
  "/logout": "Logout",
};

const Header: React.FC<HeaderProps> = ({ userEmail, userRole }) => {
  const pathname = usePathname();
  const router = useRouter();
  const title = routeTitles[pathname] || "Dashboard";

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login"); // Redirect to the login page
  };

  return (
    <div className="flex flex-row justify-between items-center h-14 bg-gray-300 shadow-lg p-4">
      <h1 className="ml-2 font-bold">{title}</h1>
      <div>
        <div className="dropdown dropdown-end bg-transparent">
          <div
            className="text-sm flex flex-col items-start text-gray-900"
            tabIndex={0}
            role="button"
          >
            <div className="flex flex-row">
              <span className="">{userEmail}</span>
              <ChevronDownIcon className="h-4 w-4 mt-1 mr-2" />
            </div>
            <span className="text-xs text-gray-600">{userRole}</span>
          </div>

          <ul
            tabIndex={1}
            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
          >
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;
