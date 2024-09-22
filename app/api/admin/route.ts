import { currentRoles } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
    const roles = await currentRoles();

    if (roles.includes(UserRole.ADMIN)) {
        return new NextResponse(null, { status: 200 });
    }

    return new NextResponse(null, { status: 403 });
}