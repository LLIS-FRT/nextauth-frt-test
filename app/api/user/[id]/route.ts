import { currentUser, protectedRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";

const getID = (req: NextRequest) => req.nextUrl.pathname.split("/").pop()

// GET user by ID
export const GET = protectedRoute(
    async function GET(req) {
        const id = getID(req);
        if (!id) return new NextResponse("Invalid ID", { status: 400 });

        const user_ = await currentUser();
        if (!user_) return new NextResponse("Unauthorized", { status: 401 });

        if (user_.id !== id) {
            const roles = user_.roles;
            if (!roles) return new NextResponse("Unauthorized", { status: 401 });

            if (!roles.includes(UserRole.ADMIN)) return new NextResponse("Unauthorized", { status: 401 });
        };

        const user = await db.user.findUnique({ where: { id } })
        
        if (!user) return new NextResponse("No user found", { status: 404 });

        return new NextResponse(JSON.stringify({ user }), { status: 200 });
    }, {
    allowedRoles: [UserRole.ADMIN, UserRole.MEMBER],
    requireAll: false // Set to true if you need all roles to be present
});