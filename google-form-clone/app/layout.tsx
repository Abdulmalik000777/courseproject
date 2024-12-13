import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Google Form Clone",
  description: "A simple Google Form clone built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
