import ProtectedPageServer from "@/components/auth/protectedPageServer";
import { Navbar } from "./_components/navbar";
import { UserRole } from "@prisma/client";

interface ProtectedLayoutProps {
    children: React.ReactNode;
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
    const navHeight = 72;

    return (
        <div className="min-h-screen w-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800">
            {/* Navbar */}
            <div className="navbar">
                <Navbar height={navHeight} />
            </div>

            {/* Main content */}
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-72px)] mt-5">
                {children}
            </div>
        </div>
    );
};

export default ProtectedPageServer(ProtectedLayout, { allowedRoles: [UserRole.ADMIN], requireAll: false })