"use client";

import { useCurrentRoles } from "@/hooks/useCurrentRoles";
import { PermissionName, UserRole_ } from "@prisma/client";
import { FormError } from "@/components/formError";
import { useCurrentPermissions } from "@/hooks/useCurrentPermissions";

interface PermissionGateProps {
    children: React.ReactNode;
    allowedPermissions: PermissionName[];
    showMessage?: boolean;
    message?: string;
    requireAll?: boolean; // A param that is true if the user needs all of the allowed permissions to view the content
}

export const PermissionGate = ({
    children,
    allowedPermissions,
    showMessage = true,
    message = "You do not have permission to view this content!",
    requireAll = false,
}: PermissionGateProps) => {
    const permissions = useCurrentPermissions();

    const hasOneOfAllowedPermissions = permissions?.some(permission => allowedPermissions.includes(permission.name));
    const hasAllOfAllowedPermissions = permissions?.every(permission => allowedPermissions.includes(permission.name));

    const hasAccess = requireAll ? hasAllOfAllowedPermissions : hasOneOfAllowedPermissions

    if (hasAccess) return <>{children}</>;
    if (showMessage) return <FormError message={message} />;
    return null;
}