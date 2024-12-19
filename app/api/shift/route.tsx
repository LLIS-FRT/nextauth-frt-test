import { currentUser, permissionsChecker, protectedRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { PermissionName, UserRole_ } from "@prisma/client";
import { NextResponse } from "next/server";

// GET all Shifts
export const GET = protectedRoute(
    async function GET(req) {
        const user = await currentUser();

        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const canViewAny = await permissionsChecker([PermissionName.VIEW_ANY_SHIFT]);

        if (canViewAny) {
            const shifts = await db.shift.findMany();
            return new NextResponse(JSON.stringify(shifts), { status: 200 });
        } else {
            const shifts = await db.shift.findMany({
                where: {
                    userIds: {
                        has: user.id
                    }
                }
            });
            return new NextResponse(JSON.stringify(shifts), { status: 200 });
        }
    }, {
    requiredPermissions: [PermissionName.VIEW_OWN_SHIFT],
});

// POST new Shift
export const POST = protectedRoute(
    async function POST(req) {
        const user = await currentUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const userRoles = user.roles;
        if (!userRoles) return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        if (!body) return new NextResponse("Invalid body", { status: 400 });

        const { endDate, startDate, createdByuserId, teamId, shiftUsers } = body;

        if (!endDate || !startDate || !createdByuserId || !teamId || !shiftUsers || !createdByuserId) {
            const missing = [];
            if (!endDate) missing.push("endDate");
            if (!startDate) missing.push("startDate");
            if (!createdByuserId) missing.push("createdByuserId");
            if (!teamId) missing.push("teamId");
            if (!shiftUsers) missing.push("shiftUsers");
            return new NextResponse(JSON.stringify(`Missing ${missing.join(", ")}`), { status: 400 });
        }

        const canCreateAny = await permissionsChecker([PermissionName.CREATE_ANY_SHIFT]);

        // Check if the user creating the shift is the same as the logged in user
        if (createdByuserId !== user.id && !canCreateAny) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Check if the team exists
        const team = await db.team.findUnique({ where: { id: teamId } });
        if (!team) return new NextResponse("Invalid team ID", { status: 400 });

        // Ensure that there are not more users than the team max and not less than the team min
        if (shiftUsers.length > team.maxUsers) return new NextResponse("Too many users for team", { status: 400 });
        // TODO: I think we will allow users to be less than the min
        if (shiftUsers.length < team.minUsers) return new NextResponse("Not enough users for team", { status: 400 });

        const userIds = shiftUsers.map((user: any) => user.userId);

        // Check if all the users exist
        const users = await db.user.findMany({ where: { id: { in: userIds } } });
        if (users.length !== userIds.length) return new NextResponse("Invalid user ID", { status: 400 });

        // Check if the user positions are valid
        shiftUsers.forEach((user: any) => {
            if (!user.position) return new NextResponse("Invalid user position", { status: 400 });
            const possiblePositions = team.possiblePositions?.toString().split(",");
            if (!possiblePositions) return new NextResponse("Invalid user position", { status: 400 });
            if (!possiblePositions.includes(user.position)) return new NextResponse("Invalid user position", { status: 400 });
        })

        // Create the shift
        const shift = await db.shift.create({
            data: {
                endDate: new Date(endDate),
                startDate: new Date(startDate),
                createdByuserId: user.id,
                teamId: teamId,
                userIds: userIds,
                userPositions: shiftUsers.map((user: any) => user.position),
                users: {
                    connect: userIds.map((userId: string) => ({ id: userId })),
                },
                createdAt: new Date(),
            }
        });

        return new NextResponse(JSON.stringify(shift), { status: 200 });
    }, {
    requiredPermissions: [PermissionName.CREATE_OWN_SHIFT]
});

// DELETE shift by ID
export const DELETE = protectedRoute(
    async function DELETE(req) {
        const body = await req.json();
        if (!body) return new NextResponse("Invalid body", { status: 400 });

        const { id } = body;
        if (!id) return new NextResponse("Invalid ID", { status: 400 });

        const shift = await db.shift.findUnique({ where: { id } });
        if (!shift) return new NextResponse("No shift found", { status: 404 });

        const deletedShift = await db.shift.delete({ where: { id } });

        return new NextResponse(JSON.stringify({ deletedShift }), { status: 200 });
    }, {
    requiredPermissions: [PermissionName.DELETE_ANY_SHIFT]
});