import ProtectedPageServer from "@/components/auth/protectedPageServer";
import { Navbar } from "@/components/navbar";
import { UserRole } from "@prisma/client";

interface ProtectedLayoutProps {
    children: React.ReactNode;
}

const routes = [
    { href: "/", label: "Home", isAuthenticated: false },
    {
        href: "/admin",
        label: "Admin",
        roles: [UserRole.ADMIN],
        isAuthenticated: true,
    },
    {
        href: "/admin/shift-manager",
        label: "Shift Manager",
        roles: [UserRole.ADMIN],
        isAuthenticated: true,
    }
];

export const metadata = {
    title: "FRT - Admin Portal",
};

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
    return (
        <div className="h-screen w-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800">
            {/* Navbar */}
            <div className="navbar">
                <Navbar routes={routes} height={72} />
            </div>

            {/* Main content */}
            <div className={`flex flex-col items-center justify-center w-full h-[calc(100vh-72px)]`}>
                {children}
            </div>
        </div>
    );
};

export default ProtectedPageServer(ProtectedLayout, { allowedRoles: [UserRole.ADMIN], requireAll: false })