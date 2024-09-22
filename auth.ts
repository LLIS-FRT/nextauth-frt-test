import NextAuth from "next-auth" // ADD type before DefaultSession
import { PrismaAdapter } from "@auth/prisma-adapter"
import { UserRole } from "@prisma/client"
import authConfig from "./auth.config"

import { db } from "@/lib/db"
import { getUserById } from "@/data/user"
import { getTwoFactorConfirmationByUserId } from "@/data/twoFactorConfirmation"

import { JWT } from "next-auth/jwt"
import { ExtendedUser } from "./next-auth"
import { getAccountByUserId } from "./data/account"

declare module "next-auth" {
    /**
     * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: ExtendedUser
    }
}

declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
    interface JWT {
        /** OpenID ID Token */
        user: {
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
        }
    }
}

// The max amount of time a token is valid for
const ACTIVE_EXPIRY_MS = 1000 * 60 * 60 * 24 * 1; // 1 days

// The max amount of time a token is valid for when inactive
const INACTIVE_EXPIRY_MS = 1000 * 60 * 60 * 2; // 2 hours

export const { auth, handlers, signIn, signOut } = NextAuth({
    events: {
        async linkAccount({ user }) {
            await db.user.update({
                where: {
                    id: user.id
                },
                data: {
                    emailVerified: new Date()
                }
            })
        },
    },
    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            if (!user.id) return false;

            // Only email and pwd users have to verify email
            if (account?.type !== "credentials") return true

            const existingUser = await getUserById(user.id);

            if (!existingUser?.emailVerified) return false;

            if (existingUser.isTwoFactorEnabled) {
                const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

                if (!twoFactorConfirmation) return false;

                // TODO: Maybe use expiration date instead
                // Delete two factor confirmation for next sign in
                await db.twoFactorConfirmation.delete({
                    where: {
                        id: twoFactorConfirmation.id
                    }
                })
            }

            return true;
        },
        async session({ session, token }) {
            if (session.user) session.user = token.user

            return session;
        },
        async jwt({ token }) {
            // Ensure token.sub exists
            if (!token.sub) return token;

            const existingUser = await getUserById(token.sub);

            if (!existingUser) return token;
            const existingAccount = await getAccountByUserId(existingUser.id);

            // Create the user object
            const user: ExtendedUser = {
                firstName: existingUser.firstName || "",
                lastName: existingUser.lastName || "",
                studentClass: existingUser.studentClass || "",
                isTwoFactorEnabled: existingUser.isTwoFactorEnabled,
                isOAuth: Boolean(existingAccount),
                IAM: existingUser.IAM?.toLowerCase(),
                onboardingComplete: existingUser.onboardingComplete,
                email: existingUser.email,
                id: existingUser.id,
                emailVerified: existingUser.emailVerified,
                roles: existingUser.roles
            };

            // Initialize token.user if it doesn't exist
            token.user = token.user || {}; // Ensure token.user is defined

            // Assign user properties to token.user
            token.user.firstName = user.firstName;
            token.user.lastName = user.lastName;
            token.user.studentClass = user.studentClass;
            token.user.isOAuth = user.isOAuth;
            token.user.IAM = user.IAM;
            token.user.onboardingComplete = user.onboardingComplete;
            token.user.roles = user.roles;
            token.user.isTwoFactorEnabled = user.isTwoFactorEnabled;
            token.user.emailVerified = user.emailVerified;
            token.user.email = user.email;
            token.user.id = user.id;

            return token;
        }

    },
    session: {
        strategy: "jwt",
        maxAge: ACTIVE_EXPIRY_MS / 1000,
    },
    jwt: {
        maxAge: ACTIVE_EXPIRY_MS / 1000,
    },
    ...authConfig,
})