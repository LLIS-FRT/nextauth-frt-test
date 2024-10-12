import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";
import { currentDbSession, currentUser } from "@/lib/auth";
import { Onboarding } from "@/components/auth/onboarding";
import ExpiryCountdownPopUp from "@/components/auth/expiryCountdownPopUp";
import { LastActiveManagerProvider } from "@/providers/LastActiveManagerProvider";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";

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

  const ChildrenOrOnboarding = () => {
    if (user && !user?.onboardingComplete) {
      return <Onboarding />;
    } else {
      return children;
    }
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {/* Pass dbSession to LastActiveManagerProvider */}
          <LastActiveManagerProvider dbSession={dbSession}>
            <Toaster />
            <ExpiryCountdownPopUp />
            <ReactQueryProvider>
              <ChildrenOrOnboarding />
            </ReactQueryProvider>
          </LastActiveManagerProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
