import { currentUser, permissionsChecker, protectedRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { PermissionName,  } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const getID = (req: NextRequest) => {
    const pathname = req.nextUrl.pathname;
    const id = pathname.split("/").pop();
    if (!id) return {
        IAM: false,
        valid: false,
        id: null
    }

    return {
        IAM: id.match(/^[a-zA-Z]{5}[0-9]{3}$/),
        valid: true,
        id
    };
}

// Done
// GET availability by user ID
export const GET = protectedRoute(
    async function GET(req) {
        const currentUser_ = await currentUser();
        if (!currentUser_) return new NextResponse("Unauthorized", { status: 401 });

        const { IAM, id, valid } = getID(req);
        if (!valid) return new NextResponse("Invalid ID", { status: 400 });
        if (!id) return new NextResponse("Invalid ID", { status: 400 });

        const canViewAny = await permissionsChecker([PermissionName.VIEW_ANY_AVAILABILITY]);

        if (currentUser_.id !== id && !canViewAny) return new NextResponse("Unauthorized", { status: 401 });

        const user = await db.user.findUnique({
            where: IAM !== null
                ? { IAM: id }   // If IAM is true, query using IAM
                : { id },   // If IAM is false, query using id
            include: {
                availabilities: true,
            }
        });

        if (!user) return new NextResponse("User not found", { status: 404 });

        const availabilities = user.availabilities;
        if (!availabilities) return new NextResponse("No availabilities found", { status: 404 });

        const obj = {
            // Set allExams to true if we are not filtering by class ID
            availabilities,
            user
        }

        return new NextResponse(JSON.stringify(obj), { status: 200 });
    }, {
    requiredPermissions: [PermissionName.VIEW_OWN_AVAILABILITY],
});

// Create availabilities for user
export const POST = protectedRoute(
    async function POST(req, res) {
        const user = await currentUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const { id, valid } = getID(req);
        if (!valid) return new NextResponse("Invalid ID", { status: 400 });
        if (!id) return new NextResponse("Invalid ID", { status: 400 });

        const canCreateAny = await permissionsChecker([PermissionName.CREATE_ANY_AVAILABILITY]);
        if (user.id !== id && !canCreateAny) return new NextResponse("Unauthorized", { status: 401 });

        const availabilities = await req.json();
        const finishedAvailabilities = [];

        for (const availability of availabilities) {
            if (!availability.startDate || !availability.endDate) {
                return new NextResponse("Invalid availability", { status: 400 });
            }

            finishedAvailabilities.push({
                startDate: new Date(availability.startDate),
                endDate: new Date(availability.endDate),
                confirmed: availability.confirmed,
                userId: id
            });
        }
        
        await db.availability.createMany({
            data: finishedAvailabilities
        })

        return new NextResponse("Availabilities created", { status: 200 });
    }, {
    requiredPermissions: [PermissionName.CREATE_OWN_AVAILABILITY],
});