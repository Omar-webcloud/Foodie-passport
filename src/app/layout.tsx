import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Foodie Passport",
  description: "Discover Bangladesh one dish at a time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
