import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
    roles?: UserRole[];
    isTwoFactorEnabled?: boolean;
    isOAuth: boolean;
    IAM?: string;
    firstName?: string;
    lastName?: string;
    studentClass?: string;
    onboardingComplete?: boolean;
    email: string;
    id: string;
    emailVerified: Date | null;
};