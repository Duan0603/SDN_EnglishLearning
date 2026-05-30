import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ocean of Knowledge | IELTS Learning",
  description: "Dive into the depths of knowledge and discover your true potential.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-ocean-abyss text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
