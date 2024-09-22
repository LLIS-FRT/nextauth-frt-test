import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const currentUser = async () => {
    const session = await auth();

    return session?.user;
}

export const currentRoles = async () => {
    const session = await auth();

    const roles = session?.user?.roles || [];

    return roles;
}

interface ProtectedRouteOptions {
    // All the roles that are allowed to access the route
    allowedRoles?: UserRole[],
    // Whether or not to require all roles from the allowed roles
    requireAll?: boolean
};

export function protectedRoute(handler: (req: NextRequest, params: any) => Promise<NextResponse> | NextResponse, options: ProtectedRouteOptions) {
    return async function (req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
        const {
            allowedRoles = [],
            requireAll = false
        } = options;

        const roles = await currentRoles();

        if (requireAll) {
            if (roles.length === 0) {
                return new NextResponse(null, { status: 403 });
            }

            for (const role of allowedRoles) {
                if (!roles.includes(role)) {
                    return new NextResponse(null, { status: 403 });
                }
            }
        } else {
            if (!roles.some(role => allowedRoles.includes(role))) {
                return new NextResponse(null, { status: 403 });
            }
        }

        return handler(req, params);
    };
}