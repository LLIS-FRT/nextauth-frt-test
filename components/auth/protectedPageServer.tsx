"use server";
import React from 'react';
import { UserRole_ } from '@prisma/client';
import { useCurrentRoles } from '@/hooks/useCurrentRoles';
import { currentRoles } from '@/lib/auth';

interface ProtectedPageServerProps {
    allowedRoles: UserRole_[];
    requireAll?: boolean;
    Fallback?: React.ComponentType<any>; // Allow Fallback to receive any props
    fallbackProps?: Record<string, any>; // Props to pass to Fallback
}

// Default Fallback placeholder if none is provided
const FallbackPlaceholder = () => <div>403 - Forbidden</div>;

const ProtectedPageServer = <P extends object>(
    WrappedComponent: React.ComponentType<P>, // Accept generic props for WrappedComponent
    { allowedRoles, requireAll = false, Fallback = FallbackPlaceholder, fallbackProps = {} }: ProtectedPageServerProps
): React.FC<P> => {
    const ComponentWithProtection: React.FC<P> = async (props) => {
        const roles = await currentRoles();

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
    ComponentWithProtection.displayName = `ProtectedPageServer(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return ComponentWithProtection;
};

export default ProtectedPageServer;
