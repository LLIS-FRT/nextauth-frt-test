"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarButtonProps {
    href: string;
    label: string;
    className?: string;
    onClick?: () => void; // Add onClick prop
}

export const NavbarButton = ({ href, label, className, onClick }: NavbarButtonProps) => {
    const pathname = usePathname();

    return (
        <Button
            asChild
            variant={pathname === href ? "default" : "outline"}
            className={className}
            onClick={onClick} // Use the onClick prop
        >
            <Link href={href} className="block p-2 w-full">
                {label}
            </Link>
        </Button>
    );
};
