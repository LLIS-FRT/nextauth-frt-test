"use server";

import { currentUser, protectedServerAction } from "@/lib/auth";
import { db } from "@/lib/db";
import { Availability, UserRole } from "@prisma/client";

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

        const validUser = await db.user.findUnique({ where: { id: userId }, select: { roles: true } });
        if (!validUser) throw new Error("User not found");

        const isAdmin = validUser.roles.includes(UserRole.ADMIN);

        const select = {
            startDate: true,
            endDate: true,
            id: true,
            userId: true,
        };

        const needsUserId = isAdmin ? undefined : userId;

        if (!availabilityId) {
            const availabilities = await db.availability.findMany({ where: { userId: needsUserId }, select });

            return { allAvailabilities: isAdmin, availabilities };
        } else if (Array.isArray(availabilityId)) {
            const availabilities = await db.availability.findMany({ where: { id: { in: availabilityId }, userId: needsUserId }, select });

            return { allAvailabilities: isAdmin, availabilities };
        } else if (typeof availabilityId === "string") {
            const availability = await db.availability.findUnique({ where: { id: availabilityId, userId: needsUserId }, select });

            if (!availability) throw new Error("Availability not found");

            return { allAvailabilities: isAdmin, availabilities: [availability] };
        } else {
            throw new Error("Invalid id");
        }
    }, {
    allowedRoles: [UserRole.ADMIN, UserRole.MEMBER],
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
        const currentUserIAM = current_user.IAM;

        if (isIAM) {
            throw new Error("Not implemented! Use ID");
        }

        // If the current user id is not the same as the id in the request 
        if (currentUserId !== id) {
            const user = await db.user.findUnique({ where: { id }, select: { roles: true } });
            if (!user) throw new Error("User not found");

            const roles = user.roles;
            if (!roles) throw new Error("User not found");

            const isAdmin = roles.includes(UserRole.ADMIN);

            if (!isAdmin) throw new Error("Unauthorized");

            const availabilities = await db.availability.findMany({ where: { userId: id } });
            return availabilities;
        } else {
            const user = await db.user.findUnique({ where: { id: currentUserId }, select: { roles: true } });
            if (!user) throw new Error("User not found");

            const availabilities = await db.availability.findMany({ where: { userId: currentUserId } });
            return availabilities;
        }
    }, {
    allowedRoles: [UserRole.ADMIN, UserRole.MEMBER],
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

        const roles = user.roles;
        if (!roles) throw new Error("User not found");

        const isAdmin = roles.includes(UserRole.ADMIN);

        const { endDate, startDate, userId } = availability;

        // Check if the userId is the same as the current user
        if (userId !== user.id && !isAdmin) throw new Error("Unauthorized");

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
    allowedRoles: [UserRole.MEMBER, UserRole.ADMIN],
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

        const roles = user.roles;
        if (!roles) throw new Error("User not found");

        const isAdmin = roles.includes(UserRole.ADMIN);

        const availability = await db.availability.findUnique({ where: { id }, select: { userId: true } });
        if (!availability) throw new Error("Availability not found");

        // Check if the userId is the same as the current user
        if (availability.userId !== user.id && !isAdmin) throw new Error("Unauthorized");

        const deletedAvailability = await db.availability.delete({ where: { id } });
        return deletedAvailability;
    }, {
    allowedRoles: [UserRole.MEMBER, UserRole.ADMIN],
});