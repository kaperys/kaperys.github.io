import type { Metadata } from "next";
import { New_Rocker, Tomorrow } from "next/font/google";
import "./globals.css";

const newRocker = New_Rocker({
  variable: "--font-new-rocker",
  subsets: ["latin"],
  weight: "400",
});

const tomorrow = Tomorrow({
  variable: "--font-tomorrow",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Mike Kaperys",
  description: "I build high-performing software engineering teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${newRocker.variable} ${tomorrow.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
