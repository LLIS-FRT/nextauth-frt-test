import NextAuth from "next-auth" // ADD type before DefaultSession
import { Permission, UserRole, UserRole_ } from "@prisma/client"
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
            roles?: UserRole_[];
            userRoles?: UserRole[];
            permissions?: Permission[];
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
        }

    },
    callbacks: {
        async signIn({ user, account }) {
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
            session.user = token.user;

            return session;
        },
        async jwt({ token, user }) {
            // When the user logs in (only during the first login), `user` will be available
            if (user && user.id && user.email) {
                // Initialize the user object inside the token if it doesn't exist
                token.user = {
                    id: user.id,
                    email: user.email,
                    emailVerified: null,
                    isOAuth: false,
                };
            } else if (token.user && token.sub) {
                // For subsequent requests, ensure token.user exists and is assigned properly
                const existingUser = await getUserById(token.sub); // `sub` contains the user ID
                if (!existingUser) {
                    console.info('User not found\nLogging out user');
                    return null;
                }

                const lastActiveAt = new Date();
                const existingAccount = await getAccountByUserId(existingUser.id);

                const userRoles = existingUser.UserRoles;
                const permissions = userRoles.map((userRole) => userRole.permissions).flat();
                // Remove duplicates
                const uniquePermissions = permissions.filter((permission, index) => permissions.indexOf(permission) === index);

                // Populate token.user if not already done
                token.user = {
                    ...token.user, // Retain existing values
                    firstName: existingUser.firstName || "",
                    lastName: existingUser.lastName || "",
                    studentClass: existingUser.studentClass || "",
                    isTwoFactorEnabled: existingUser.isTwoFactorEnabled,
                    isOAuth: Boolean(existingAccount),
                    IAM: existingUser.IAM?.toLowerCase(),
                    onboardingComplete: existingUser.onboardingComplete,
                    email: existingUser.email,
                    emailVerified: existingUser.emailVerified,
                    roles: existingUser.roles,
                    permissions: uniquePermissions,
                    userRoles: userRoles,
                };
            }

            return token;
        }
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 60,
        updateAge: 5 * 60,
    },
    ...authConfig
})