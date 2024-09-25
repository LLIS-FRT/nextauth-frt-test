import React from 'react';
import { UserRole } from '@prisma/client';
import { useCurrentRoles } from '@/hooks/useCurrentRoles';

interface ProtectedPageProps {
    allowedRoles: UserRole[];
    requireAll?: boolean;
    Fallback?: React.ComponentType<any>; // Allow Fallback to receive any props
    fallbackProps?: Record<string, any>; // Props to pass to Fallback
}

const FallbackPlaceholder = () => <div>403 - Forbidden</div>;

const ProtectedPage = (
    WrappedComponent: React.ComponentType,
    { allowedRoles, requireAll = false, Fallback = FallbackPlaceholder, fallbackProps = {} }: ProtectedPageProps
): React.FC => {
    const ComponentWithProtection = () => {
        const roles = useCurrentRoles();

        if (!roles) return <Fallback {...fallbackProps} />; // No roles, render Fallback with props

        const isAuthorized = requireAll
            ? allowedRoles.every((role) => roles.includes(role)) // User must have all required roles
            : allowedRoles.some((role) => roles.includes(role)); // User must have at least one required role

        if (isAuthorized) {
            return <WrappedComponent />; // Render the wrapped component if authorized
        }

        return <Fallback {...fallbackProps} />; // Render Fallback with props if unauthorized
    };

    // Add a display name for better debugging and error reporting
    ComponentWithProtection.displayName = `ProtectedPage(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return ComponentWithProtection;
};

export default ProtectedPage;
