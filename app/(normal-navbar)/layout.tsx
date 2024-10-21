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
    href: "/calendar",
    label: "Calendar",
    roles: [UserRole.ADMIN, UserRole.MEMBER],
    isAuthenticated: true,
  },
  {
    href: "/reports",
    label: "Reports",
    roles: [UserRole.ADMIN, UserRole.MEMBER],
    isAuthenticated: true,
  },
];

const NormalLayout = ({ children }: ProtectedLayoutProps) => {
  return (
    <div className="h-screen w-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800">
      {/* Navbar */}
      <div>
        <Navbar routes={routes} />
      </div>

      {/* Main content */}
      <div className={`flex flex-col items-center justify-center w-full h-[calc(100vh-72px)]`}>
        {children}
      </div>
    </div>
  );
};

export default NormalLayout