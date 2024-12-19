"use server";

import { currentUser, permissionsChecker, protectedServerAction } from "@/lib/auth";
import { db } from "@/lib/db";
import { Availability, PermissionName, UserRole_ } from "@prisma/client";

export type LimitedAvailability = Pick<Availability, "startDate" | "endDate" | "id" | "userId">

export interface GetAvailabilitiesResponse {
    allAvailabilities: boolean;
    availabilities: LimitedAvailability[];
}

/**
 * @description Get availabilities based on availability id or all for the current user
 * 
 * @param {string | string[] | undefined} availabilityId - The availability id to get
 * 
 * @returns {Promise<GetAvailabilitiesResponse>}
 */
export const getAvailabilities = protectedServerAction(
    async (availabilityId: string | string[] | undefined): Promise<GetAvailabilitiesResponse> => {
        const user = await currentUser();
        if (!user) throw new Error("User not found");
        const userId = user.id;

        const canGetAnyAvailabilities = await permissionsChecker([PermissionName.VIEW_ANY_AVAILABILITY]);

        const select = {
            startDate: true,
            endDate: true,
            id: true,
            userId: true,
        };

        const needsUserId = canGetAnyAvailabilities ? undefined : userId;

        if (!availabilityId) {
            const availabilities = await db.availability.findMany({ where: { userId: needsUserId }, select });

            return { allAvailabilities: canGetAnyAvailabilities, availabilities };
        } else if (Array.isArray(availabilityId)) {
            const availabilities = await db.availability.findMany({ where: { id: { in: availabilityId }, userId: needsUserId }, select });

            return { allAvailabilities: canGetAnyAvailabilities, availabilities };
        } else if (typeof availabilityId === "string") {
            const availability = await db.availability.findUnique({ where: { id: availabilityId, userId: needsUserId }, select });

            if (!availability) throw new Error("Availability not found");

            return { allAvailabilities: canGetAnyAvailabilities, availabilities: [availability] };
        } else {
            throw new Error("Invalid id");
        }
    }, {
    requiredPermissions: [PermissionName.VIEW_OWN_AVAILABILITY]
});

/**
 * @description Get all availabilities based on user id
 * 
 * @param {string} availabilityId - The user id to get
 * @param {boolean} isIAM - Whether the user is an IAM
 * 
 * @returns {Promise<GetAvailabilitiesResponse>}
 */
export const getAvailabilitiesByUser = protectedServerAction(
    async (id: string, isIAM: boolean): Promise<LimitedAvailability[]> => {
        const current_user = await currentUser();
        if (!current_user) throw new Error("User not found");

        const currentUserId = current_user.id;

        if (isIAM) throw new Error("Not implemented! Use ID");

        // If the current user id is not the same as the id in the request 
        if (currentUserId !== id) {
            // Replace with permissions system
            const canViewAny = permissionsChecker([PermissionName.VIEW_ANY_AVAILABILITY]);
            if (!canViewAny) throw new Error("Unauthorized");

            const availabilities = await db.availability.findMany({ where: { userId: id } });
            return availabilities;
        } else {
            const user = await db.user.findUnique({ where: { id: currentUserId }, select: { roles: true } });
            if (!user) throw new Error("User not found");

            const availabilities = await db.availability.findMany({ where: { userId: currentUserId } });
            return availabilities;
        }
    }, {
    requiredPermissions: [PermissionName.VIEW_OWN_AVAILABILITY]
});

/**
 * @description Create an availability
 * @param {Omit<Availability, "id" | "confirmed" | "confirmedAt" | "confirmedByuserId">} availability - The availability to create
 * 
 * @returns {Promise<Availability>}
 */
export const createAvailability = protectedServerAction(
    async (availability: Omit<Availability, "id" | "confirmed" | "confirmedAt" | "confirmedByuserId">) => {
        const user = await currentUser();
        if (!user) throw new Error("User not found");

        const canCreateAny = await permissionsChecker([PermissionName.CREATE_ANY_AVAILABILITY]);

        const { endDate, startDate, userId } = availability;

        // Check if the userId is the same as the current user
        if (userId !== user.id && !canCreateAny) throw new Error("Unauthorized");

        // Ensure the start date is before the end date
        if (startDate.getTime() > endDate.getTime()) throw new Error("Start date cannot be after end date");

        const newAvailability = await db.availability.create({
            data: {
                confirmed: false,
                endDate,
                startDate,
                userId,
            }
        }
        );
        return newAvailability;
    }, {
    requiredPermissions: [PermissionName.CREATE_OWN_AVAILABILITY]
});

/**
 * @description Delete an availability
 * @param {string} id - The availability id to update
 * 
 * @returns {Promise<Availability>}
 */
export const deleteAvailability = protectedServerAction(
    async (id: string) => {
        const user = await currentUser();
        if (!user) throw new Error("User not found");

        const canDeleteAny = await permissionsChecker([PermissionName.DELETE_ANY_AVAILABILITY]);

        const availability = await db.availability.findUnique({ where: { id }, select: { userId: true } });
        if (!availability) throw new Error("Availability not found");

        // Check if the userId is the same as the current user
        if (availability.userId !== user.id && !canDeleteAny) throw new Error("Unauthorized");

        const deletedAvailability = await db.availability.delete({ where: { id } });
        return deletedAvailability;
    }, {
    requiredPermissions: [PermissionName.DELETE_OWN_AVAILABILITY]
});

/**
 * @description Update an availability
 * @param {string} id - The availability id to update   
 * @param {Omit<Availability, "id" | "confirmed" | "confirmedAt" | "confirmedByuserId">} availability - The availability to update
 * 
 * @returns {Promise<Availability>}
 */
export const updateAvailability = protectedServerAction(
    async (id: string, data?: Omit<Availability, "id" | "confirmed" | "confirmedAt" | "confirmedByuserId">) => {
        const user = await currentUser();
        if (!user) throw new Error("User not found");
        
        const canUpdateAny = await permissionsChecker([PermissionName.UPDATE_ANY_AVAILABILITY]);

        const availability = await db.availability.findUnique({ where: { id }, select: { userId: true } });
        if (!availability) throw new Error("Availability not found");

        // Check if the userId is the same as the current user
        if (availability.userId !== user.id && !canUpdateAny) throw new Error("Unauthorized");

        const finalData = { ...data }

        const updatedAvailability = await db.availability.update({ where: { id }, data: finalData });

        return updatedAvailability;
    }, {
    requiredPermissions: [PermissionName.UPDATE_OWN_AVAILABILITY]
});