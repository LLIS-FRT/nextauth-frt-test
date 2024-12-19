"use client";

import { useState, useRef, useEffect } from "react";
import { UserButton } from "@/components/auth/userButton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { NavbarButton } from "./navbarBtn";
import { PermissionName, OldUserRole } from "@prisma/client";
import { RoleGate } from "@/components/auth/roleGate";
import { LoginButton } from "@/components/auth/loginButton";
import { Button } from "@/components/ui/button";
import { FiMenu, FiX } from "react-icons/fi";
import gsap from "gsap"; // Import GSAP
import { LogoutButton } from "@/components/auth/logoutButton";
import Link from "next/link";
import { PermissionGate } from "./auth/permissionGate";

type Routes = {
    href: string;
    label: string;
    requireAll?: boolean;
    permissions?: PermissionName[];
    isAuthenticated?: boolean;
};

export const Navbar = ({ routes }: { routes: Routes[] }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const user = useCurrentUser();
    const menuRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const toggleMenu = () => {
        if (!isAnimating) {
            setIsMenuOpen((prev) => !prev);
        }
    };

    useEffect(() => {
        if (isMenuOpen && menuRef.current) {
            setIsAnimating(true);

            // Opening animations for both menu and overlay
            gsap.fromTo(
                menuRef.current,
                { x: "-100%", opacity: 0 },
                { x: "0%", opacity: 1, duration: 0.4, ease: "power2.out" }
            );
            gsap.fromTo(
                overlayRef.current,
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: 0.4,
                    ease: "power2.out",
                    onComplete: () => setIsAnimating(false), // Finish animation
                }
            );
        } else if (!isMenuOpen && menuRef.current) {
            setIsAnimating(true);

            // Closing animations for both menu and overlay
            gsap.to(menuRef.current, {
                x: "-100%",
                opacity: 0,
                duration: 0.4,
                ease: "power2.in",
            });
            gsap.to(overlayRef.current, {
                opacity: 0,
                duration: 0.4,
                ease: "power2.in",
                onComplete: () => {
                    setIsAnimating(false);
                    setIsMenuOpen(false); // Fully close after animation
                },
            });
        }
    }, [isMenuOpen]);

    return (
        <nav className="bg-secondary flex justify-between items-center p-4 shadow-md relative h-[72px]">
            <div className="flex items-center justify-between w-full">
                {/* Move the menu button to the right */}
                <button onClick={toggleMenu} className="md:hidden">
                    {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
                <div className="hidden md:flex gap-x-4">
                    {routes.map((item, index) => {
                        if (item.isAuthenticated) {
                            return (
                                <PermissionGate
                                    key={index}
                                    allowedPermissions={item.permissions || []}
                                    requireAll={item.requireAll}
                                    showMessage={false}
                                >
                                    <NavbarButton
                                        href={item.href}
                                        label={item.label}
                                    />
                                </PermissionGate>
                            );
                        } else {
                            return (
                                <NavbarButton
                                    key={item.href}
                                    href={item.href}
                                    label={item.label}
                                />
                            );
                        }
                    })}
                </div>
                <div className="hidden md:flex items-center gap-x-4">
                    {user ? (
                        <UserButton />
                    ) : (
                        <LoginButton mode="modal" asChild>
                            <Button variant="secondary" size="lg">
                                Sign in
                            </Button>
                        </LoginButton>
                    )}
                </div>
            </div>
            {isMenuOpen && (
                <>
                    {/* Overlay for background dimming */}
                    <div
                        ref={overlayRef}
                        className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
                        onClick={toggleMenu}
                    ></div>

                    {/* Sliding mobile menu */}
                    <div
                        ref={menuRef}
                        className="fixed top-0 left-0 z-20 w-3/4 h-full bg-white p-4 shadow-lg md:hidden flex flex-col"
                    >
                        {/* Menu Items */}
                        <div className="flex flex-col gap-y-6 flex-grow">
                            {routes.map((item, index) => {
                                if (item.isAuthenticated) {
                                    return (
                                        <PermissionGate
                                            key={index}
                                            allowedPermissions={item.permissions || []}
                                            requireAll={item.requireAll}
                                            showMessage={false}
                                        >
                                            <NavbarButton
                                                href={item.href}
                                                label={item.label}
                                                className="text-left w-full"
                                                onClick={toggleMenu} // Close menu on click
                                            />
                                        </PermissionGate>
                                    );
                                } else {
                                    return (
                                        <NavbarButton
                                            key={item.href}
                                            href={item.href}
                                            label={item.label}
                                            className="text-left w-full"
                                            onClick={toggleMenu} // Close menu on click
                                        />
                                    );
                                }
                            })}
                        </div>

                        {/* Sign In / Profile and close Button at Bottom */}
                        <div className="mt-auto flex justify-center">
                            {user ? (
                                <div className="flex flex-row w-full gap-2">
                                    <Button
                                        asChild
                                        variant="secondary"
                                        className="text-left w-full"
                                        onClick={toggleMenu}
                                    >
                                        <Link href={"/settings"} className="block p-2 w-full">
                                            Settings
                                        </Link>
                                    </Button>
                                    <LogoutButton>
                                        <Button
                                            variant="secondary"
                                            className="text-left w-full"
                                            onClick={toggleMenu}
                                        >
                                            Sign out
                                        </Button>
                                    </LogoutButton>
                                </div>
                            ) : (
                                <LoginButton
                                    mode="modal"
                                    asChild
                                >
                                    <Button variant="secondary" size="lg">
                                        Sign in
                                    </Button>
                                </LoginButton>
                            )}
                        </div>
                        <div className="mt-2 flex justify-center">
                            <Button
                                variant="default"
                                className="text-left w-full"
                                onClick={toggleMenu}
                            >
                                <FiX size={24} />
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </nav >
    );
};