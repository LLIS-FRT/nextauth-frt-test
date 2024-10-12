"use server";

import { currentUser, protectedServerAction } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendShiftAddedEmail } from "@/lib/mail";
import { Shift, UserRole } from "@prisma/client";

export type LimitedShift = Pick<Shift, "startDate" | "endDate" | "id">

export interface GetShiftsResponse {
    allShifts: boolean;
    shifts: LimitedShift[];
}

/**
 * @description Get shifts based on shift id (for the current user)
 * 
 * @param {string | string[] | undefined} id - The shift id to get
 * 
 * @returns {Promise<GetShiftsResponse>}
 */
export const getShifts = protectedServerAction(
    async (id: string | string[] | undefined): Promise<GetShiftsResponse> => {
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
        };

        if (!id) {
            const shifts = await db.shift.findMany({
                where: isAdmin ? {} : { userIds: { has: userId } },
                select
            });

            return { allShifts: isAdmin, shifts };
        } else if (Array.isArray(id)) {
            const shifts = await db.shift.findMany({
                where: {
                    id: { in: id },
                    userIds: isAdmin ? {} : { has: userId }
                },
                select
            });

            return { allShifts: isAdmin, shifts };
        } else if (typeof id === "string") {
            const shift = await db.shift.findUniqueOrThrow({
                where: {
                    id,
                    userIds: isAdmin ? {} : { has: userId }
                },
                select
            });

            return { allShifts: isAdmin, shifts: [shift] };
        } else {
            throw new Error("Invalid id");
        }
    }, {
    allowedRoles: [UserRole.ADMIN, UserRole.MEMBER],
    requireAll: false // Set to true if you need all roles to be present
});

export const createShift = protectedServerAction(
    async (shift: Omit<Shift, "id" | "createdAt">) => {
        const currentUser_ = await currentUser();
        if (!currentUser_) throw new Error("User not found");

        const roles = currentUser_.roles;
        if (!roles) throw new Error("User not found");

        const isAdmin = roles.includes(UserRole.ADMIN);
        if (!isAdmin) throw new Error("Unauthorized");

        const { startDate, endDate, userIds, createdByuserId, teamId, userPositions } = shift;
        if (!startDate || !endDate || !userIds || !createdByuserId || !teamId || !userPositions) {
            throw new Error("Missing required fields");
        }

        const positionsArray = userPositions.toString().split(",");

        // Validate there are as many users as there are positions
        if (userIds.length !== positionsArray.length) throw new Error("Invalid user positions");

        // Ensure there are no duplicate users
        if (new Set(userIds).size !== userIds.length) throw new Error("Duplicate user IDs");

        // Ensure the team exists
        const team = await db.team.findUnique({ where: { id: teamId }, select: { maxUsers: true, possiblePositions: true, name: true } });
        if (!team) throw new Error("Team not found");

        // Ensure the team max is not less than the number of users
        if (team.maxUsers < userIds.length) throw new Error("Team max is less than the number of users");

        const possiblePositionsObject = team.possiblePositions;
        const possiblePositions = possiblePositionsObject?.toString().split(",");
        if (!possiblePositions) throw new Error("Invalid team");

        // Ensure there are no duplicate positions and that all positions are valid
        for (let i = 0; i < positionsArray.length; i++) {
            const position = positionsArray[i];

            const positionCount = positionsArray.filter((p) => p === position).length;
            if (positionCount > 1) throw new Error("Duplicate user positions");

            if (!possiblePositions.includes(position)) throw new Error("Invalid user position");
        }

        const newShift = await db.shift.create({
            data: {
                startDate,
                endDate,
                users: { connect: userIds.map((userId: string) => ({ id: userId })), },
                teamId,
                userPositions,
                createdAt: new Date(),
                createdByuserId,
            }
        });

        const usersAndPosition: Promise<{ name: string; id: string; position: string }>[] = userIds.map(async (userId: string, index: number) => {
            const user = await db.user.findUnique({ where: { id: userId }, select: { firstName: true, lastName: true } });

            if (!user) throw new Error("User not found");

            return {
                name: `${user.lastName} ${user.firstName?.charAt(0)}.`,
                id: userId,
                position: positionsArray[index],
            }
        });

        if (currentUser_.email == "sebastianmostert663@gmail.com") {
            await sendShiftAddedEmail({
                email: currentUser_.email,
                id: currentUser_.id,
                name: `${currentUser_.lastName} ${currentUser_.firstName?.charAt(0)}.`,
            }, {
                endDate,
                startDate,
                teamName: team.name,
                users: usersAndPosition
            });
        }

        return newShift;
    }, {
    allowedRoles: [UserRole.ADMIN],
    requireAll: false
})

export const deleteShift = protectedServerAction(
    async (id: string) => {
        const user = await currentUser();
        if (!user) throw new Error("User not found");

        const roles = user.roles;
        if (!roles) throw new Error("User not found");

        const isAdmin = roles.includes(UserRole.ADMIN);
        if (!isAdmin) throw new Error("Unauthorized");

        const shift = await db.shift.findUnique({
            where: { id },
            select: {
                createdByuserId: true,
                userIds: true
            }
        });

        if (!shift) throw new Error("Shift not found");

        // TODO: Let the users involved in the shift know that they have been deleted
        for (let i = 0; i < shift.userIds.length; i++) {
            const userId = shift.userIds[i];
            if (userId === user.id) continue; // The user knows that they have been deleted as they have deleted the shift
            const db_user = await db.user.findUnique({ where: { id: userId }, select: { email: true } });
            const email = db_user?.email;
            if (!email) continue;
            // TODO: Send email
        }
        // Delete the shift
        await db.shift.delete({ where: { id } });
    }, {
    allowedRoles: [UserRole.ADMIN],
    requireAll: false
})