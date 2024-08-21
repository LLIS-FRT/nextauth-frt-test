"use client";

import { UserButton } from "@/components/auth/userButton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { NavbarButton } from "./navbarButton";
import { UserRole } from "@prisma/client";
import { RoleGate } from "@/components/auth/roleGate";
import { LoginButton } from "@/components/auth/loginButton";
import { Button } from "@/components/ui/button";

type PublicAccess = {
    href: string;
    label: string;
};

type LoggedInAccess = {
    href: string;
    label: string;
    requireAll?: boolean;
    roles?: UserRole[];
};

const publicAccess: PublicAccess[] = [
    {
        href: "/",
        label: "Home"
    },
];

const loggedInAccess: LoggedInAccess[] = [
    {
        href: "/admin",
        label: "Admin",
        roles: [
            UserRole.ADMIN
        ],
    },
    {
        href: "/calendar",
        label: "Calendar",
        roles: [
            UserRole.ADMIN,
            UserRole.USER,
            UserRole.MEMBER,
        ],
    },
];

export const Navbar = () => {
    const user = useCurrentUser();
    const roles = user?.roles || [];

    // TODO: Mobile responsive
    return (
        <nav className="bg-secondary flex justify-between items-center p-4 w-full shadow-sm">
            <div className="flex gap-x-2">
                {publicAccess.map((item) => (
                    <NavbarButton
                        key={item.href}
                        href={item.href}
                        label={item.label}
                    />
                ))}

                {loggedInAccess.map((item, index) => (
                    <RoleGate
                        key={index}
                        allowedRoles={item?.roles || []}
                        requireAll={item.requireAll}
                        showMessage={false}
                    >
                        <NavbarButton
                            href={item.href}
                            label={item.label}
                        />
                    </RoleGate>
                ))}
            </div>
            {user ? (
                <UserButton />
            ) : (
                <div>
                    <LoginButton mode="modal" asChild>
                        <Button variant={"secondary"} size={"lg"}>
                            Sign in
                        </Button>
                    </LoginButton>
                </div>
            )}
        </nav>
    )
}
