import React from "react";
import Image from "next/image";
import Link from "next/link"; // Import Link from Next.js

interface Props {
  src?: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  href: string; // Add href prop
  active?: boolean; // Add active prop
}

const SidebarRow: React.FC<Props> = ({ src, Icon, title, href, active }) => {
  return (
    <Link href={href}>
      <div
        className={`flex items-center space-x-2 p-4 cursor-pointer ${
          active ? "bg-amber-500" : "hover:bg-gray-400"
        }`}
      >
        {Icon && <Icon className="h-6 w-6 text-gray-700" />}
        <p className="hidden sm:inline-flex font-normal">{title}</p>
      </div>
    </Link>
  );
};

export default SidebarRow;
