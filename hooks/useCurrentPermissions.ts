import { useSession } from "next-auth/react";

export const useCurrentPermissions = () => {
    const { data: session } = useSession();

    return session?.user?.permissions || [];
};