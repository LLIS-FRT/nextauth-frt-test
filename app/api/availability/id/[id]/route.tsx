import { currentRoles, currentUser, permissionsChecker, protectedRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { PermissionName, OldUserRole } from "@prisma/client";
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
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const id = getID(req);
        if (!id) return new NextResponse("Invalid ID", { status: 400 });

        const availability = await db.availability.findUnique({
            where: { id },
            include: {
                user: true
            }
        })

        if (!availability) return new NextResponse("No availability found", { status: 404 });

        // Check if the availability belongs to the user
        if (availability.userId !== user.id) {
            const canViewAny = await permissionsChecker([PermissionName.VIEW_ANY_AVAILABILITY]);

            if (!canViewAny) return new NextResponse("Unauthorized", { status: 401 });
        }

        return new NextResponse(JSON.stringify({ availability }), { status: 200 });
    }, {
    requiredPermissions: [PermissionName.VIEW_OWN_AVAILABILITY]
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
            const canDeleteAny = await permissionsChecker([PermissionName.DELETE_ANY_AVAILABILITY]);

            if (!canDeleteAny) return new NextResponse("Unauthorized", { status: 401 });
        }

        const deletedAvailability = await db.availability.delete({ where: { id } })

        return new NextResponse(JSON.stringify({ deletedAvailability }), { status: 200 });
    }, {
    requiredPermissions: [PermissionName.DELETE_OWN_AVAILABILITY]
}
)