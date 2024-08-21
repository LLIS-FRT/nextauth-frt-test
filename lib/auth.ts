import { auth } from "@/auth";

export const currentUser = async () => {
    const session = await auth();

    return session?.user;
}

export const currentRoles = async () => {
    const session = await auth();

    const roles = session?.user?.roles || [];

    return roles;
}