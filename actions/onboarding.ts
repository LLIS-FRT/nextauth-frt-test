"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { OnboardingSchema } from "@/schemas";
import { getUserById } from "@/data/user";
import { currentUser } from "@/lib/auth";

export const onboarding = async (
    values: z.infer<typeof OnboardingSchema>
) => {
    const validatedFields = OnboardingSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields" };
    }

    const {
        firstName,
        lastName,
        isTwoFactorEnabled,
        studentClass
    } = validatedFields.data;

    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };
    if (!user?.id) return { error: "Unauthorized" };

    const dbUser = await getUserById(user.id);
    if (!dbUser) return { error: "Unauthorized" };

    await db.user.update({
        where: {
            id: dbUser.id
        },
        data: {
            firstName,
            lastName,
            isTwoFactorEnabled,
            studentClass,
            onboardingComplete: true
        }
    });

    return { success: "Settings updated!" };
}