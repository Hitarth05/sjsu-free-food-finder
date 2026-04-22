import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SJSU Free Food Finder",
  description:
    "Find free food and free stuff at San José State University events",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}