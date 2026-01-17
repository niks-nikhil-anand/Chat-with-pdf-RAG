import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner"; // Added import

import {
  ClerkProvider,
  SignIn,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chat with PDF | RAG-Powered Assistant",
  description:
    "Upload PDFs and ask questions with AI using Retrieval-Augmented Generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <header>
            <SignedOut>
              <section className="min-h-screen w-screen flex justify-center items-center">
                <SignIn />
              </section>
            </SignedOut>
            <SignedIn>
              <Navbar />
              {children}
            </SignedIn>
          </header>
          <Toaster position="top-center" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
