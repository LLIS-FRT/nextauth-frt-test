import { auth } from '@/auth';
import { protectedRoute } from '@/lib/auth';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

// Get the current user
export async function GET(req: NextRequest) {
    const session = await auth();

    const user = session?.user;

    return new NextResponse(JSON.stringify(user), { status: 200 });
}

export const POST = protectedRoute(async function POST(req) {
    const body = await req.json();
    const id = body?.sessionId;
    if (!body || !id) return new NextResponse("Invalid body", { status: 400 });

    const session = await db.session.findUnique({ where: { id } });

    if (!session) return new NextResponse("No session found", { status: 404 });

    return new NextResponse(JSON.stringify(session), { status: 200 });
}, {
    allowedRoles: [UserRole.USER],
    requireAll: false // Set to true if you need all roles to be present
});