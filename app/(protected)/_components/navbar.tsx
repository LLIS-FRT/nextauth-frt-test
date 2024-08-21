"use client";

import { UserButton } from "@/components/auth/userButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Navbar = () => {
    const pathname = usePathname();
    // TODO: Mobile responsive
    return (
        <nav className="bg-secondary flex justify-between items-center p-4 w-full shadow-sm">
            <div className="flex gap-x-2">
                <Button
                    asChild
                    variant={pathname === "/server" ? "default" : "outline"}
                >
                    <Link href="/server">
                        Server
                    </Link>
                </Button>
                <Button
                    asChild
                    variant={pathname === "/client" ? "default" : "outline"}
                >
                    <Link href="/client">
                        Client
                    </Link>
                </Button>
                <Button
                    asChild
                    variant={pathname === "/admin" ? "default" : "outline"}
                >
                    <Link href="/admin">
                        Admin
                    </Link>
                </Button>
            </div>
            <UserButton />
        </nav>
    )
}
