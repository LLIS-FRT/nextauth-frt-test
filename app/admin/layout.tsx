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

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
    const navHeight = 72;

    return (
        <div className="h-screen w-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800">
            {/* Navbar */}
            <div className="navbar">
                <Navbar routes={routes} height={navHeight} />
            </div>

            {/* Main content */}
            <div className={`flex flex-col items-center justify-center w-full h-[calc(100vh-${navHeight}px)]`}>
                {children}
            </div>
        </div>
    );
};

export default ProtectedPageServer(ProtectedLayout, { allowedRoles: [UserRole.ADMIN], requireAll: false })