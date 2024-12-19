import { protectedRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { PermissionName,  } from "@prisma/client";
import { NextResponse } from "next/server";

// GET all availabilities
export const GET = protectedRoute(
    async function GET(req) {
        const availabilities = await db.availability.findMany();
        if (!availabilities) return new NextResponse("No availabilities found", { status: 404 });

        return new NextResponse(JSON.stringify({ availabilities }), { status: 200 });
    }, {
    requiredPermissions: [PermissionName.VIEW_ANY_AVAILABILITY]
});