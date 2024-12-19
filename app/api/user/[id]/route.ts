import { currentUser, permissionsChecker, protectedRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { PermissionName } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const getID = (req: NextRequest) => req.nextUrl.pathname.split("/").pop()

// GET user by ID
export const GET = protectedRoute(
    async function GET(req) {
        const user_ = await currentUser();
        if (!user_) return new NextResponse("Unauthorized", { status: 401 });

        const id = getID(req);
        if (!id) return new NextResponse("Invalid ID", { status: 400 });

        const canViewAny = await permissionsChecker([PermissionName.VIEW_ANY_PROFILE]);

        if (user_.id !== id && !canViewAny) return new NextResponse("Unauthorized", { status: 401 });

        const user = await db.user.findUnique({ where: { id } })

        if (!user) return new NextResponse("No user found", { status: 404 });

        return new NextResponse(JSON.stringify({ user }), { status: 200 });
    }, {
    requiredPermissions: [PermissionName.VIEW_OWN_PROFILE]
});