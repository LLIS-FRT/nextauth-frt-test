"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "@/components/ui/avatar";
import { FaUser } from "react-icons/fa";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LogoutButton } from "@/components/auth/logoutButton";
import { ExitIcon } from "@radix-ui/react-icons";
import { HiOutlineCog6Tooth } from "react-icons/hi2";

export const UserButton = () => {
    const user = useCurrentUser();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar>
                    <AvatarImage src={user?.image || ""} />
                    <AvatarFallback className="bg-sky-500">
                        <FaUser className="text-white" />
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="end">
                <span onClick={() => { window.location.href = "/settings" }} className="cursor-pointer">
                    <DropdownMenuItem>
                        <HiOutlineCog6Tooth className="mr-2 h-4 w-4" />
                        Settings
                    </DropdownMenuItem>
                </span>
                <LogoutButton>
                    <DropdownMenuItem>
                        <ExitIcon className="mr-2 h-4 w-4" />
                        Logout
                    </DropdownMenuItem>
                </LogoutButton>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
