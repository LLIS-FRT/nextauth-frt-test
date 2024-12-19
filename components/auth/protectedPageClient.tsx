"use client";
import React from 'react';
import { OldUserRole } from '@prisma/client';
import { useCurrentRoles } from '@/hooks/useCurrentRoles';

interface ProtectedPageClientProps {
    allowedRoles: OldUserRole[];
    requireAll?: boolean;
    Fallback?: React.ComponentType<any>; // Allow Fallback to receive any props
    fallbackProps?: Record<string, any>; // Props to pass to Fallback
}

// Default Fallback placeholder if none is provided
const FallbackPlaceholder = () => <div>403 - Forbidden</div>;

const ProtectedPageClient = <P extends object>(
    WrappedComponent: React.ComponentType<P>, // Accept generic props for WrappedComponent
    { allowedRoles, requireAll = false, Fallback = FallbackPlaceholder, fallbackProps = {} }: ProtectedPageClientProps
): React.FC<P> => {
    const ComponentWithProtection: React.FC<P> = (props) => {
        const roles = useCurrentRoles();

        if (!roles) return <Fallback {...fallbackProps} />; // No roles, render Fallback with props

        const isAuthorized = requireAll
            ? allowedRoles.every((role) => roles.includes(role)) // User must have all required roles
            : allowedRoles.some((role) => roles.includes(role)); // User must have at least one required role

        if (isAuthorized) {
            return <WrappedComponent {...props} />; // Pass props to WrappedComponent if authorized
        }

        return <Fallback {...fallbackProps} />; // Render Fallback with props if unauthorized
    };

    // Add a display name for better debugging and error reporting
    ComponentWithProtection.displayName = `ProtectedPageClient(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return ComponentWithProtection;
};

export default ProtectedPageClient;
