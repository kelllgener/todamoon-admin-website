import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "./auth/UserContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Todamoon",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="corporate">
      <body className={inter.className}>
        <UserProvider>
          <div className="flex flex-col min-h-screen">
            {children}
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
