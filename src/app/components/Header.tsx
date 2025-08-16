"use client"; // Ensure this is at the top

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/app/firebase/config";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import DateTimeUpdater from "./DateTimeUpdater";
import Image from "next/image";
import logo from "/public/logo.png";

interface HeaderProps {
  userEmail: string;
  userRole: string;
  toggleSidebar: () => void; // Function to toggle sidebar
  isSidebarOpen: boolean; // Pass the state
}

const Header: React.FC<HeaderProps> = ({
  userEmail,
  userRole,
  toggleSidebar,
  isSidebarOpen,
}) => {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login"); // Redirect to the login page
  };

  return (
    <div className="sticky top-0 z-50 flex flex-row justify-between items-center h-14 bg-gray-300 shadow-lg p-2">
      {/* Burger Icon for small screens */}

      <div className="flex m-0">
        <label className="btn btn-circle btn-secondary btn-outline btn-sm ml-1 swap swap-rotate mr-2 md:hidden">
          {/* this hidden checkbox controls the state */}
          <input
            type="checkbox"
            checked={isSidebarOpen}
            onChange={toggleSidebar}
          />

          {/* hamburger icon */}
          <svg
            className="swap-off fill-current"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 512 512"
          >
            <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
          </svg>

          {/* close icon */}
          <svg
            className="swap-on fill-current"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 512 512"
          >
            <polygon points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
          </svg>
        </label>
        {/* Logo and User Role */}
        <div className=" flex flex-row items-center space-x-4">
          <Image
            src={logo}
            width={50}
            height={50}
            alt="logo"
            className="hidden sm:block object-contain w-auto h-auto "
          />
          <h1 className="font-bold text-md sm:text-lg sm:display">
            {userRole}
          </h1>
        </div>
      </div>
      {/* DateTimeUpdater and User Info */}
      <div className="flex flex-row items-center space-x-4">
        {/* DateTimeUpdater - Hidden on small screens */}
        <h3 className="text-sm text-gray-900 hidden sm:block">
          <DateTimeUpdater /> 
        </h3>
        <h1>|</h1>
      
        {/* Email and Dropdown */}
        <div className="dropdown dropdown-end">
          <div
            className="text-sm flex items-center cursor-pointer"
            tabIndex={0}
            role="button"
          >
            <span>{userEmail}</span>
            <ChevronDownIcon className="h-5 w-5 ml-2" />
          </div>

          {/* Dropdown Menu */}
          <ul
            tabIndex={1}
            className="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow"
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
