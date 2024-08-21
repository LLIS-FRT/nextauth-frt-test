import { Navbar } from "./_components/navbar";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const NormalLayout = ({ children }: ProtectedLayoutProps) => {
  return (
    <div className="h-full w-full  gap-y-10 items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800">
      <Navbar />
      <div className="flex flex-col gap-y-10 items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default NormalLayout