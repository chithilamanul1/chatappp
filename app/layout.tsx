import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Free E-Book Library",
  description: "Download free PDF textbooks, study guides, and e-books.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Library",
  },
  openGraph: {
    title: "Free E-Book Library",
    description: "Download free PDF textbooks, study guides, and e-books.",
    url: "https://chatappp-eight.vercel.app",
    siteName: "E-Book Library",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0d0d0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="fixed inset-0 overflow-hidden bg-[#0d0d0f]">{children}</body>
    </html>
  );
}
