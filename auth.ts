import NextAuth from "next-auth" // ADD type before DefaultSession
import { PrismaAdapter } from "@auth/prisma-adapter"
import { UserRole } from "@prisma/client"
import authConfig from "./auth.config"

import { db } from "@/lib/db"
import { getUserById } from "@/data/user"
import { getTwoFactorConfirmationByUserId } from "@/data/twoFactorConfirmation"

declare module "next-auth" {
    /**
     * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: ExtendedUser
    }
}

import { JWT } from "next-auth/jwt"
import { ExtendedUser } from "./next-auth"
import { getAccountByUserId } from "./data/account"
declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
    interface JWT {
        /** OpenID ID Token */
        roles?: UserRole[];
        isTwoFactorEnabled?: boolean;
        isOauth?: boolean;
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
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }

            if (token.roles && session.user) {
                session.user.roles = token.roles
            }

            if (session.user) {
                session.user.isTwoFactorEnabled = token.isTwoFactorEnabled
            }

            if (session.user) {
                session.user.name = token.name;
                session.user.isOAuth = token.isOauth;
            }

            if (session.user && token.email) {
                session.user.email = token.email;
            }

            return session;
        },
        async jwt({ token, }) {
            if (!token.sub) return token;

            const existingUser = await getUserById(token.sub);

            if (!existingUser) return token;

            const existingAccount = await getAccountByUserId(existingUser.id);

            token.isOauth = Boolean(existingAccount);
            token.name = existingUser.name;
            token.email = existingUser.email;
            token.roles = existingUser.roles;
            token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;

            return token;
        },
    },
    session: { strategy: "jwt" },
    ...authConfig,
})