"use server";

import { currentUser, permissionsChecker, protectedServerAction } from "@/lib/auth";
import { db } from "@/lib/db";
import { PermissionName, User, UserRole_ } from "@prisma/client";

interface GetUserResponse {
    user: Pick<User, "firstName" | "lastName" | "email" | "IAM" | "id"> | undefined;
}


/**
 * @description Get availabilities based on availability id or all for the current user
 * 
 * @param {string | string[] | undefined} availabilityId - The availability id to get
 * 
 * @returns {Promise<GetAvailabilitiesResponse>}
 */
export const getUser = protectedServerAction(
    async ({ userID, userIAM }: { userID?: string, userIAM?: string }): Promise<GetUserResponse> => {
        if (userID && userIAM) throw new Error("Only one of userID and userIAM can be provided");

        const user = await currentUser();
        if (!user) throw new Error("User not found");

        const currentUserId = user.id;

        const validUser = await db.user.findUnique({ where: { id: currentUserId }, select: { roles: true, IAM: true } });
        if (!validUser) throw new Error("User not found");

        const canViewAny = await permissionsChecker([PermissionName.VIEW_ANY_PROFILE]);

        const select = { firstName: true, lastName: true, email: true, IAM: true, id: true };

        if (userID) {
            // The user ID was provided
            if (!canViewAny && userID !== currentUserId) throw new Error("Unauthorized");

            const user = await db.user.findUnique({ where: { id: userID }, select });
            return { user: user || undefined };
        } else if (userIAM) {
            // The user IAM was provided
            if (!canViewAny && userIAM !== validUser.IAM) throw new Error("Unauthorized");
            const user = await db.user.findUnique({ where: { IAM: userIAM }, select });
            return { user: user || undefined };
        } else {
            throw new Error("Either userID or userIAM must be provided");
        }
    }, {
    requiredPermissions: [PermissionName.VIEW_OWN_PROFILE]
});