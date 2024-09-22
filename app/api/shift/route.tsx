import { protectedRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

// GET all Reports
export const GET = protectedRoute(async function GET(req) {
    return new NextResponse('Not implemented yet', { status: 200 });
}, {
    allowedRoles: [UserRole.ADMIN, UserRole.MEMBER],
    requireAll: false // Set to true if you need all roles to be present
});

// POST new Report
export const POST = protectedRoute(async function POST(req) {
    return new NextResponse('Not implemented yet', { status: 200 });
}, {
    allowedRoles: [UserRole.ADMIN, UserRole.MEMBER],
    requireAll: false // Set to true if you need all roles to be present
});