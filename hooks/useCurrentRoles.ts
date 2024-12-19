import { useSession } from "next-auth/react";

export const useCurrentRoles = () => {
    const { data: session } = useSession();

    return session?.user?.oldRoles;
}