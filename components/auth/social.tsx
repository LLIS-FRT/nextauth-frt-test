"use client";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { GoPasskeyFill } from "react-icons/go";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export const Social = () => {
    const onClick = (provider: "google" | "github" | "passkey") => {
        signIn(provider, { callbackUrl: DEFAULT_LOGIN_REDIRECT });
    };

    return (
        <div className="w-full">
            <div className="flex items-center w-full gap-x-2">
                <Button
                    size={"lg"}
                    className="w-full"
                    variant={"outline"}
                    onClick={() => onClick("google")}
                >
                    <FcGoogle className="w-5 h-5" />
                </Button>
                <Button
                    size={"lg"}
                    className="w-full"
                    variant={"outline"}
                    onClick={() => onClick("github")}
                >
                    <FaGithub className="w-5 h-5" />
                </Button>
            </div>
            {/* <div className="gap-x-2 mt-4">
                <Button
                    size={"lg"}
                    className="w-full"
                    variant={"outline"}
                    onClick={() => onClick("passkey")}
                >
                    <div className="flex items-center space-x-2">
                        <GoPasskeyFill className="w-5 h-5" />
                        <span>Sign in with a passkey</span>
                    </div>
                </Button>
            </div> */}
        </div>
    )
}
