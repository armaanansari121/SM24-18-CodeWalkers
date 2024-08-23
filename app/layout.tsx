import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import  { ContractProvider } from "./_contexts/ContractContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Swartz",
  description: "Decentralized social media platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <ContractProvider>
      <body className={inter.className}>{children}</body>
    
    </ContractProvider>
    </html>
  );
}
