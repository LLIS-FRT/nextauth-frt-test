import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

// Get the current user
export async function GET(req: NextRequest) {
    const session = await auth();

    const user = session?.user;

    return new NextResponse(JSON.stringify(user), { status: 200 });
}
