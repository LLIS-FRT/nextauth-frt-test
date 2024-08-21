"use server";

import { signOut } from "@/auth";

export const logout = async () => {
    // Do some other server stuff here
    await signOut();
}