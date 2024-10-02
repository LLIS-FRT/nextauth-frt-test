import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";
import { currentDbSession, currentUser } from "@/lib/auth";
import { Onboarding } from "@/components/auth/onboarding";
import ExpiryCountdownPopUp from "@/components/auth/expiryCountdownPopUp";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next Auth App",
  description: "App using NextAuth",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const user = await currentUser();
  const dbSession = await currentDbSession();

  if (user && !user?.onboardingComplete) {
    return (
      <SessionProvider>
        <html lang="en">
          <body className={inter.className}>
            <Toaster />
            <Onboarding />
          </body>
        </html>
      </SessionProvider>
    )
  }

  // Here we can force users to look at stuff before they can do anything
  // Such as policy updates

  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body className={inter.className}>
          <Toaster />
          <ExpiryCountdownPopUp dbSession={dbSession} />
          {children}
        </body>
      </html>
    </SessionProvider>
  );
}
