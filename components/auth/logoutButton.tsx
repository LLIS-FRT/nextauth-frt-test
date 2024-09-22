"use client";

import { logout } from "@/actions/logout";

interface LogoutButtonProps {
    children?: React.ReactNode
}

export const LogoutButton = ({ children }: LogoutButtonProps) => {
    const onClick = () => {
        // Redirect to the login page
        logout().then(() => {
            window.location.href = "/";
        });
    };

    return (
        <span onClick={onClick} className="cursor-pointer w-full">
            {children}
        </span>
    )
}
