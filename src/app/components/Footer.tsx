import Image from "next/image";
import React from "react";


const currentYear = new Date().getFullYear();

const Footer = () => {
  return (
    <>
      <footer className="flex justify-center items-center border z-60">
        <Image 
          src="/logo.png"  // Reference the image from the root
          width={50} 
          height={50} 
          alt="Logo"   // Consider adding an alt attribute for accessibility
          className="mr-2"
        />
        <span className="text-center text-amber-900">
          <p>
            &copy; {currentYear} Todamoon. All rights reserved.
          </p>
        </span>
      </footer>
    </>
  );
};

export default Footer;
