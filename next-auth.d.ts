import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
    roles: UserRole[];
    isTwoFactorEnabled?: boolean;
    isOAuth?: boolean;
};