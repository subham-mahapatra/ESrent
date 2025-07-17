import type { Metadata } from "next";

import "../globals.css";
import Footer from "@/components/Footer";
// import CrispChat from "@/components/CrispChat";

export const metadata: Metadata = {
  title: "Autoluxe - Luxury Car Rental in Dubai",
  description: "Find the best cars for rent in Dubai. Explore our wide range of luxury vehicles and book your dream car today.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          </>
  );
}
