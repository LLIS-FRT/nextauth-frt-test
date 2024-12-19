import { auth } from "@/auth";
import { INACTIVE_EXPIRATION_MS } from "@/constants";
import { PermissionName, UserRole_ } from "@prisma/client";
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

export const permissionsChecker = async (permissions: PermissionName[]) => {
    // This function checks if the user has the required permissions
    const userPerms = await currentPermissions();

    return permissions.every(permission => userPerms.some(userPerm => userPerm.name === permission));
}

export const currentPermissions = async () => {
    const session = await auth();

    const permissions = session?.user?.permissions || [];

    return permissions;
}

interface ProtectedRouteOptions {
    // All the roles that are allowed to access the route
    allowedRoles?: UserRole_[],
    requiredPermissions?: PermissionName[],
};

export function protectedRoute(handler: (req: NextRequest, params: any) => Promise<NextResponse> | NextResponse, options?: ProtectedRouteOptions) {
    return async function (req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
        const {
            allowedRoles = [],
            requiredPermissions = []
        } = options || {};

        const user = await currentUser();
        if (!user) return new NextResponse(null, { status: 403 });

        const permissions = await currentPermissions();
        const permissionNames = permissions.map(permission => permission.name);

        // Ensure the user has ALL the required permissions
        if (requiredPermissions.length > 0) {
            // Check if the user has ALL the required permissions
            const hasAdminPermission = permissionNames.includes(PermissionName.ADMINISTRATOR);
            const hasAllRequiredPermissions = await permissionsChecker(requiredPermissions);

            console.info("Checking permissions", { requiredPermissions });

            if (!hasAllRequiredPermissions && !hasAdminPermission) return new NextResponse(null, { status: 403 });
        } else {
            console.info("No permissions required");

        }

        // If the old role system is used throw an error
        if (allowedRoles.length !== 0) { return new NextResponse(null, { status: 403 }); }

        return handler(req, params);
    };
}

// Define the protectedServerAction wrapper
export const protectedServerAction = <T extends (...args: any[]) => Promise<any>>(
    action: T,
    options?: { requiredPermissions?: PermissionName[]; }
) => {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        const user = await currentUser();

        if (!user) throw new Error("User not found");

        const { requiredPermissions = [] } = options || {};

        const permissions = await currentPermissions();
        const permissionNames = permissions.map(permission => permission.name);

        // Ensure the user has ALL the required permissions
        if (requiredPermissions.length > 0) {
            // Check if the user has ALL the required permissions
            const hasAdminPermission = permissionNames.includes(PermissionName.ADMINISTRATOR);
            const hasAllRequiredPermissions = await permissionsChecker(requiredPermissions);

            if (!hasAllRequiredPermissions && !hasAdminPermission) throw new Error("Unauthorized: You do not have the required permissions");
        }

        // Call the original action
        return action(...args);
    };
};