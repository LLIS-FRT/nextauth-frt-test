"use server";

import { currentUser, protectedServerAction } from "@/lib/auth";
import { db } from "@/lib/db";
import { Team, UserRole } from "@prisma/client";

export type LimitedTeam = Pick<Team, "id" | "name" | "possiblePositions">

export interface GetTeamsResponse {
    allTeams: boolean;
    teams: LimitedTeam[];
}

/**
 * @description Get teams based on team id
 * 
 * @param {string | undefined} id - The team id to get
 * 
 * @returns {Promise<GetTeamsResponse>}
 */
export const getTeams = protectedServerAction(
    async (id: string | undefined): Promise<GetTeamsResponse> => {
        const user = await currentUser();
        if (!user) throw new Error("User not found");
        const userId = user.id;

        const validUser = await db.user.findUnique({ where: { id: userId }, select: { roles: true } });

        if (!validUser) throw new Error("User not found");

        const isAdmin = validUser.roles.includes(UserRole.ADMIN);
        if (!isAdmin) throw new Error("Unauthorized");

        const select = {
            id: true,
            name: true,
            possiblePositions: true,
        };

        if (!id) {
            const teams = await db.team.findMany({ select });
            return { allTeams: isAdmin, teams };
        } else if (id) {
            const team = await db.team.findUnique({ where: { id }, select });
            if (!team) throw new Error("Team not found");
            return { allTeams: isAdmin, teams: [team] };
        } else {
            throw new Error("Invalid id");
        }
    }, {
    allowedRoles: [UserRole.ADMIN],
    requireAll: false,
})