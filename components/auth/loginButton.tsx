"use client";

import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogTrigger
} from "@/components/ui/dialog";
import { LoginForm } from "@/components/auth/loginForm";
import { useState } from "react";

interface LoginButtonProps {
    children?: React.ReactNode;
    mode?: "modal" | "redirect";
    asChild?: boolean;
}

export const LoginButton = ({
    children,
    mode = "redirect",
    asChild
}: LoginButtonProps) => {
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);

    const onClick = () => {
        router.push("/auth/login");
    };

    if (mode === "modal") {
        const closeModal = () => setModalOpen(false);

        return (
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogTrigger asChild={asChild}>
                    {children}
                </DialogTrigger>
                <DialogContent className="p-0 w-auto bg-transparent border-none">
                    <LoginForm closeModal={closeModal} />
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <span onClick={onClick} className="cursor-pointer">
            {children}
        </span>
    )
}