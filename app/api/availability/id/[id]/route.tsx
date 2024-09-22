import { currentRoles, currentUser, protectedRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const getID = (req: NextRequest) => {
    const pathname = req.nextUrl.pathname;
    const id = pathname.split("/").pop();
    if (!id) return null

    return id;
}

// Done
// GET availability by ID
export const GET = protectedRoute(
    async function GET(req) {
        const user = await currentUser();

        const id = getID(req);
        if (!id) return new NextResponse("Invalid ID", { status: 400 });

        const availability = await db.availability.findUnique({
            where: { id },
            include: {
                user: true
            }
        })

        if (!availability) return new NextResponse("No availability found", { status: 404 });
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        // Check if the availability belongs to the user
        if (availability.userId !== user.id) {
            const roles = user.roles;

            if (!roles) return new NextResponse("Unauthorized", { status: 401 });
            if (!roles.includes(UserRole.ADMIN)) return new NextResponse("Unauthorized", { status: 401 });
        }

        return new NextResponse(JSON.stringify({ availability }), { status: 200 });
    }, {
    allowedRoles: [UserRole.ADMIN, UserRole.MEMBER],
    requireAll: false // Set to true if you need all roles to be present
});

// Create availabilities for user
export const DELETE = protectedRoute(
    async function DELETE(req) {
        const user = await currentUser();
        const id = getID(req);

        if (!id) return new NextResponse("Invalid ID", { status: 400 });
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const availability = await db.availability.findUnique({
            where: { id },
            include: {
                user: true
            }
        })

        // Check if the availability belongs to the user
        if (user.id !== availability?.userId) {
            const roles = user.roles;
            if (!roles) return new NextResponse("Unauthorized", { status: 401 });
            if (!roles.includes(UserRole.ADMIN)) return new NextResponse("Unauthorized", { status: 401 });
        }

        const deletedAvailability = await db.availability.delete({
            where: { id }
        })

        return new NextResponse(JSON.stringify({ deletedAvailability }), { status: 200 });
    }, {
    allowedRoles: [UserRole.ADMIN, UserRole.MEMBER],
    requireAll: false // Set to true if you need all roles to be present
}
)