"use server";

import { permissionsChecker, } from "@/lib/auth";
import { PermissionName } from "@prisma/client";

export const admin = async () => {
    const isAdmin = permissionsChecker([PermissionName.ADMINISTRATOR])

    // Check if we have the admin permission
    if (!isAdmin) return { error: "Forbidden Server Action!" }

    return { success: "Allowed Server Action!" }
}