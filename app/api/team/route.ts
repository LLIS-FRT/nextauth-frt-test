import { currentUser, protectedRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

// GET all Teams
export const GET = protectedRoute(async function GET(req) {
    const user = await currentUser();

    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const userRoles = user.roles;
    if (!userRoles) return new NextResponse("Unauthorized", { status: 401 });

    const teams = await db.team.findMany({ include: { shifts: true } });

    if (userRoles.includes(UserRole.ADMIN)) return new NextResponse(JSON.stringify(teams), { status: 200 });
    else {
        const userShifts = teams.map((t) => t.shifts)
            .filter((tS) => tS.some((s) => s.userIds.includes(user.id)));

        // If the user is not in any of the teams, return an empty array
        if (userShifts.length === 0) return new NextResponse("Unauthorized", { status: 401 });
        else return new NextResponse(JSON.stringify(teams), { status: 200 });
    }
}, {
    allowedRoles: [UserRole.ADMIN, UserRole.MEMBER],
    requireAll: false // Set to true if you need all roles to be present
});

// POST new team
export const POST = protectedRoute(async function POST(req) {
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const userRoles = user.roles;
    if (!userRoles) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    if (!body) return new NextResponse("Invalid body", { status: 400 });

    const { name, maxUsers, minUsers, possiblePositions, status = 6 } = body;

    if (!name || !maxUsers || !minUsers || !possiblePositions || !status) {
        const missing = [];
        if (!name) missing.push("name");
        if (!maxUsers) missing.push("maxUsers");
        if (!minUsers) missing.push("minUsers");
        if (!possiblePositions) missing.push("possiblePositions");
        if (!status) missing.push("status");
        return new NextResponse(`Missing ${missing.join(", ")}`, { status: 400 });
    }

    // Check if the team exists
    const existingTeam = await db.team.findUnique({ where: { name } });
    if (existingTeam) return new NextResponse("Team already exists", { status: 400 });

    // Ensure that there are not more users than the team max and not less than the team min
    if (maxUsers < minUsers) return new NextResponse("Max users cannot be less than min users", { status: 400 });

    // Ensure status is either, 1, 2, 3, 4, 5, 6
    if (![1, 2, 3, 4, 5, 6].includes(status)) return new NextResponse("Invalid status", { status: 400 });

    // Check if the possible positions are valid
    possiblePositions.forEach((position: any) => {
        if (typeof position !== "string") return new NextResponse("Invalid position - Not a string", { status: 400 });
        if (!position.includes(" ")) return new NextResponse("Invalid position - No spaces allowed", { status: 400 });
        if (possiblePositions.includes(position)) return new NextResponse("Invalid position - Duplicate", { status: 400 });
    });

    // We ensure there are exactly the correct number of positions
    if (possiblePositions.length !== maxUsers) return new NextResponse("Invalid positions - Incorrect number of positions", { status: 400 });

    // Create the shift
    const team = await db.team.create({
        data: {
            name,
            maxUsers,
            minUsers,
            possiblePositions,
            createdAt: new Date(),
            updatedAt: new Date(),
            status,
        }
    });

    return new NextResponse(JSON.stringify(team), { status: 200 });
}, {
    allowedRoles: [UserRole.ADMIN, UserRole.MEMBER],
    requireAll: false // Set to true if you need all roles to be present
});

// DELETE team by ID
export const DELETE = protectedRoute(
    async function DELETE(req) {
        const body = await req.json();
        if (!body) return new NextResponse("Invalid body", { status: 400 });

        const { id } = body;
        if (!id) return new NextResponse("Invalid ID", { status: 400 });

        const team = await db.team.findUnique({ where: { id } });
        if (!team) return new NextResponse("No team found", { status: 404 });

        const deletedTeam = await db.team.delete({ where: { id } });

        return new NextResponse(JSON.stringify({ deletedTeam }), { status: 200 });
    }, {
    allowedRoles: [UserRole.ADMIN],
    requireAll: false // Set to true if you need all roles to be present
});