import { protectedRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
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
// GET shift by user ID
export const GET = protectedRoute(
    async function GET(req) {
        const { IAM, id, valid } = getID(req);
        if (!valid) return new NextResponse("Invalid ID", { status: 400 });

        if (!id) return new NextResponse("Invalid ID", { status: 400 });

        const user = await db.user.findUnique({
            where: IAM !== null
                ? { IAM: id }   // If IAM is true, query using IAM
                : { id },   // If IAM is false, query using id
            include: {
                availabilities: true,
                Shifts: true
            }
        });

        if (!user) return new NextResponse("User not found", { status: 404 });

        const shifts = user.Shifts;

        if (!shifts) return new NextResponse("No shifts found", { status: 404 });

        const obj = {
            // Set allExams to true if we are not filtering by class ID
            shifts,
            user: user
        }

        return new NextResponse(JSON.stringify(obj), { status: 200 });
    }, {
    allowedRoles: [UserRole.ADMIN, UserRole.MEMBER],
    requireAll: false // Set to true if you need all roles to be present
});