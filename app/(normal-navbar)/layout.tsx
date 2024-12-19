import { Navbar } from "@/components/navbar";
import { PermissionName } from "@prisma/client";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const routes = [
  { href: "/", label: "Home", isAuthenticated: false },
  {
    href: "/admin",
    label: "Admin",
    permissions: [
      PermissionName.ADMINISTRATOR
    ],
    isAuthenticated: true,
  },
  {
    href: "/calendar",
    label: "Calendar",
    permissions: [
      PermissionName.CREATE_ANY_AVAILABILITY,
      PermissionName.CREATE_OWN_AVAILABILITY,
      PermissionName.DELETE_OWN_AVAILABILITY,
      PermissionName.DELETE_ANY_AVAILABILITY,
      PermissionName.VIEW_ANY_AVAILABILITY,
      PermissionName.VIEW_OWN_AVAILABILITY
    ],
    isAuthenticated: true,
  },
  {
    href: "/reports",
    label: "Reports",
    permissions: [
      PermissionName.CREATE_ANY_REPORT,
      PermissionName.CREATE_OWN_REPORT,
      PermissionName.DELETE_ANY_REPORT,
      PermissionName.VIEW_ANY_REPORT,
      PermissionName.VIEW_OWN_REPORT
    ],
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
      <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-72px)]">
        {children}
      </div>
    </div>
  );
};

export default NormalLayout