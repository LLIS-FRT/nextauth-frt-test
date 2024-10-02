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
import { ACTIVE_EXPIRATION_MS, INACTIVE_EXPIRATION_MS } from "./constants"
import { getTimeUntilExpiry } from "./lib/auth"

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
            lastActiveAt: Date;
            sessionId?: string;
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
        },
        async signOut(message: any) {
            const sessionId = message?.token?.user?.sessionId as string;
            if (!sessionId) return;

            await db.session.delete({
                where: {
                    id: sessionId
                }
            })
        },

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
        // async jwt({ token, user }) {
        //     if (user) {
        //         // When a user logs in, create a session in the database
        //         const session = await db.session.create({
        //             data: {
        //                 userId: user.id,
        //                 createdAt: new Date(),
        //                 updatedAt: new Date(),
        //                 lastActiveAt: new Date(),
        //             },
        //         });

        //         // Store the session ID in the token
        //         token.user.sessionId = session.id;
        //     }
        //     // Ensure token.sub exists
        //     if (!token.sub) return token;

        //     const existingUser = await getUserById(token.sub);

        //     if (!existingUser) return token;
        //     const existingAccount = await getAccountByUserId(existingUser.id);

        //     const lastActiveAt = new Date();

        //     // Create the user object
        //     const userObj: ExtendedUser = {
        //         firstName: existingUser.firstName || "",
        //         lastName: existingUser.lastName || "",
        //         studentClass: existingUser.studentClass || "",
        //         isTwoFactorEnabled: existingUser.isTwoFactorEnabled,
        //         isOAuth: Boolean(existingAccount),
        //         IAM: existingUser.IAM?.toLowerCase(),
        //         onboardingComplete: existingUser.onboardingComplete,
        //         email: existingUser.email,
        //         id: existingUser.id,
        //         emailVerified: existingUser.emailVerified,
        //         roles: existingUser.roles,
        //         lastActiveAt: lastActiveAt,
        //         sessionId: token.user.sessionId
        //     };

        //     // Initialize token.user if it doesn't exist
        //     token.user = token.user || {}; // Ensure token.user is defined

        //     // Assign user properties to token.user
        //     token.user.firstName = userObj.firstName;
        //     token.user.lastName = userObj.lastName;
        //     token.user.studentClass = userObj.studentClass;
        //     token.user.isOAuth = userObj.isOAuth;
        //     token.user.IAM = userObj.IAM;
        //     token.user.onboardingComplete = userObj.onboardingComplete;
        //     token.user.roles = userObj.roles;
        //     token.user.isTwoFactorEnabled = userObj.isTwoFactorEnabled;
        //     token.user.emailVerified = userObj.emailVerified;
        //     token.user.email = userObj.email;
        //     token.user.id = userObj.id;
        //     token.user.lastActiveAt = lastActiveAt;

        //     const timeUntilExpiration = await getTimeUntilExpiry(existingUser);

        //     // Adjust token expiration based on activity
        //     if (timeUntilExpiration <= 0) return null;

        //     // Optionally, update the last-seen timestamp in the database if the user is active
        //     if (timeUntilExpiration > 0) {
        //         await db.user.update({
        //             where: { id: existingUser.id },
        //             data: { lastActiveAt }
        //         });
        //     }

        //     return token;
        // }
        async jwt({ token, user }) {
            // When the user logs in (only during the first login), `user` will be available
            if (user && user.id && user.email) {
                // Create a new session in the database for the logged-in user
                const session = await db.session.create({
                    data: {
                        userId: user.id,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        lastActiveAt: new Date(),
                    },
                });

                // Initialize the user object inside the token if it doesn't exist
                token.user = {
                    sessionId: session.id,
                    id: user.id,
                    email: user.email,
                    emailVerified: null,
                    isOAuth: false,
                    lastActiveAt: new Date(),
                };
            } else if (token.user && token.sub) {
                // For subsequent requests, ensure token.user exists and is assigned properly
                const existingUser = await getUserById(token.sub); // `sub` contains the user ID
                if (!existingUser) return token;

                const lastActiveAt = new Date();
                const existingAccount = await getAccountByUserId(existingUser.id);

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
                    lastActiveAt: lastActiveAt,
                };

                // Optionally, update the user's last activity time in the database
                await db.user.update({
                    where: { id: existingUser.id },
                    data: { lastActiveAt }
                });

                const session = await db.session.update({
                    where: { id: token.user.sessionId },
                    data: { lastActiveAt }
                });

                const timeUntilExpiration = await getTimeUntilExpiry(session);

                // Adjust the token expiration based on activity
                if (timeUntilExpiration <= 0) {
                    await db.session.delete({
                        where: { id: token.user.sessionId }
                    })
                    return null;
                } // Expired session
            }

            return token;
        }
    },
    session: {
        strategy: "jwt",
        maxAge: ACTIVE_EXPIRATION_MS / 1000 // Set maxAge to the active expiration time
    },
    jwt: {
        maxAge: ACTIVE_EXPIRATION_MS / 1000, // Set maxAge to the active expiration time
    },
    ...authConfig,
})