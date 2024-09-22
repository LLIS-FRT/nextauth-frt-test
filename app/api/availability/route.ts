import { protectedRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

// GET all availabilities
export const GET = protectedRoute(
    async function GET(req) {
        const availabilities = await db.availability.findMany();
        if (!availabilities) return new NextResponse("No availabilities found", { status: 404 });

        return new NextResponse(JSON.stringify({ availabilities }), { status: 200 });
    }, {
    allowedRoles: [UserRole.ADMIN],
    requireAll: false // Set to true if you need all roles to be present
});