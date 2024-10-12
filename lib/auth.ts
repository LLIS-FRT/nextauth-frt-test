import { auth } from "@/auth";
import { INACTIVE_EXPIRATION_MS } from "@/constants";
import { Session, User, UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { db } from "./db";

export const currentUser = async () => {
    const session = await auth();

    return session?.user;
}

export const currentDbSession = async () => {
    const user = await currentUser();

    const sessionid = user?.sessionId;

    if (!sessionid) return null;

    const session = await db.session.findUnique({
        where: { id: sessionid },
        include: { User: true }
    })

    return session;
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

interface GetTimeUntilExpiryProps {
    session?: Session | null | undefined
    lastActiveAt?: Date | null | undefined
}

export async function getTimeUntilExpiry({ lastActiveAt }: GetTimeUntilExpiryProps): Promise<number> {
    if (!lastActiveAt) return 0;

    // Set token expiration times based on activity
    const now = Math.floor(Date.now() / 1000); // Current time in seconds

    const lastActiveAt_ = lastActiveAt;

    if (!lastActiveAt_) return 0;

    // Calculate token expiration based on activity
    const tokenAge = now - Math.floor(new Date(lastActiveAt_).getTime() / 1000);
    const timeUntilExpiration = INACTIVE_EXPIRATION_MS / 1000 - tokenAge;

    return timeUntilExpiration;
}

// Define the protectedServerAction wrapper
export const protectedServerAction = <T extends (...args: any[]) => Promise<any>>(
    action: T,
    options: {
        allowedRoles?: UserRole[];
        requireAll?: boolean;
    }
) => {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        const user = await currentUser();

        if (!user) throw new Error("User not found");
        const { id } = user;

        // Fetch user data
        const validUser = await db.user.findUnique({
            where: { id },    // Query using id otherwise
            select: {
                roles: true
            }
        });

        if (!validUser) throw new Error("User not found");

        const { allowedRoles = [], requireAll = false } = options;

        // Check if allowed roles are defined
        if (allowedRoles.length > 0) {
            const hasRequiredRoles = requireAll
                ? allowedRoles.every(role => validUser.roles.includes(role)) // User must have all roles
                : allowedRoles.some(role => validUser.roles.includes(role)); // User can have any role

            if (!hasRequiredRoles) {
                throw new Error("Unauthorized: You do not have the required roles");
            }
        }

        // Call the original action
        return action(...args);
    };
};