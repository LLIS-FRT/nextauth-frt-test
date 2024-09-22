"use client";

import { useCurrentRoles } from "@/hooks/useCurrentRoles";
import { UserRole } from "@prisma/client";
import { FormError } from "@/components/formError";

interface RoleGateProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
    showMessage?: boolean;
    message?: string;
    requireAll?: boolean; // A param that is true if the user needs all of the allowed roles to view the content
}

export const RoleGate = ({
    children,
    allowedRoles,
    showMessage = true,
    message = "You do not have permission to view this content!",
    requireAll = false,
}: RoleGateProps) => {
    const roles = useCurrentRoles();

    const hasOneOfAllowedRoles = roles?.some(role => allowedRoles.includes(role));
    const hasAllOfAllowedRoles = roles?.every(role => allowedRoles.includes(role));

    const hasAccess = requireAll ? hasAllOfAllowedRoles : hasOneOfAllowedRoles

    if (hasAccess) return <>{children}</>;
    if (showMessage) return <FormError message={message} />;
    return null;
}