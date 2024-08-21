"use server";

import { currentRoles } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export const admin = async () => {
    const role = await currentRoles();

    // Check if we have the admin role
    if (!role.includes(UserRole.ADMIN)) return { error: "Forbidden Server Action!" }


    return { success: "Allowed Server Action!" }
}