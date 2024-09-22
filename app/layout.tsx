import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";
import { currentUser } from "@/lib/auth";
import { Onboarding } from "@/components/auth/onboarding";

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
          {children}
        </body>
      </html>
    </SessionProvider>
  );
}
