"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarButtonProps {
    href: string
    label: string
}

export const NavbarButton = ({ href, label }: NavbarButtonProps) => {
    const pathname = usePathname();

    return (
        <Button
            asChild
            variant={pathname === href ? "default" : "outline"}
        >
            <Link href={href}>
                {label}
            </Link>
        </Button>
    )
}
