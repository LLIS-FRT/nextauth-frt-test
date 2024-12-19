import { protectedRoute } from '@/lib/auth';
import { db } from '@/lib/db';
import { PermissionName } from '@prisma/client';
import { NextResponse } from 'next/server';

export const POST = protectedRoute(async function POST(req) {
    const body = await req.json();
    const ids = body?.ids;
    if (!body || !ids) return new NextResponse("Invalid body", { status: 400 });

    const users = await db.user.findMany({
        where: {
            id: {
                in: ids
            }
        }
    });

    return new NextResponse(JSON.stringify(users), { status: 200 });
}, {
    requiredPermissions: [PermissionName.VIEW_ANY_PROFILE]
});