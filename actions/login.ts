"use server";

import { signIn } from "@/auth";
import { getUserByEmail } from "@/data/user";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { LoginSchema } from "@/schemas";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import * as z from "zod";
import {
    generateVerificationToken,
    generateTwoFactorToken
} from "@/lib/tokens";
import {
    sendVerificationEmail,
    sendTwoFactorTokenEmail
} from "@/lib/mail";
import { getTwoFactorTokenByEmail } from "@/data/twoFactorToken";
import { db } from "@/lib/db";
import { getTwoFactorConfirmationByUserId } from "@/data/twoFactorConfirmation";

export const login = async (
    values: z.infer<typeof LoginSchema>,
    callbackUrl?: string
): Promise<{ error?: string; success?: string; twoFactor?: boolean }> => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) return { error: "Invalid fields" };

    const { email, password, code } = validatedFields.data;

    // Check if user exists
    const existingUser = await getUserByEmail(email);

    if (!existingUser || !existingUser.email || !existingUser.password) return { error: "Invalid credentials" };

    // Check if password is correct
    const passwordsMatch = await bcrypt.compare(password, existingUser.password);

    if (!passwordsMatch) return { error: "Invalid credentials" };

    // Check if email is verified
    if (!existingUser.emailVerified) {
        const verificationToken = await generateVerificationToken(existingUser.email);

        await sendVerificationEmail(
            verificationToken.email,
            verificationToken.token
        );

        return { success: "Confirmation email sent" };
    }

    //
    if (existingUser.isTwoFactorEnabled && existingUser.email) {
        if (code) {
            const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

            if (!twoFactorToken) return { error: "Invalid code" };

            if (twoFactorToken.token !== code) return { error: "Invalid code" };

            const hasExpired = new Date(twoFactorToken.expires) < new Date();

            if (hasExpired) return { error: "Invalid code" };

            await db.twoFactorToken.delete({ where: { id: twoFactorToken.id } });

            const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

            if (existingConfirmation) {
                await db.twoFactorConfirmation.delete({ where: { id: existingConfirmation.id } });
            }

            await db.twoFactorConfirmation.create({
                data: {
                    userId: existingUser.id
                }
            });
        } else {
            const twoFactorToken = await generateTwoFactorToken(existingUser.email);
            await sendTwoFactorTokenEmail(
                twoFactorToken.email,
                twoFactorToken.token
            );

            return { twoFactor: true };
        }
    }

    try {
        // Update lastActiveAt
        await db.user.update({
            where: {
                id: existingUser.id
            },
            data: {
                lastActiveAt: new Date()
            }
        });

        await signIn("credentials", {
            email,
            password,
            redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT
        });

        return { success: "Logged in" };
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials" };
                default:
                    return { error: "Something went wrong" };
            }
        }

        throw error;
    }
};