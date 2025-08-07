import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";
import UserMenu from "@/components/user-menu";
import { DashboardNav } from "@/components/dashboard-nav";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-between h-16 shrink-0 items-center gap-2 px-4 sticky top-0 z-50 bg-blue-900 dark:bg-blue-950 border-b border-blue-800 dark:border-blue-900">
        <div className="flex items-center gap-2">
          <h1 className="text-md lg:text-2xl font-bold tracking-tight text-white">
            Finova Bright <span className="hidden lg:inline">Bank</span>
          </h1>
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4 bg-blue-700 dark:bg-blue-800 hidden lg:block"
          />
          <DashboardNav />
        </div>
        <div className="flex items-center gap-2">
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4 bg-blue-700 dark:bg-blue-800 hidden lg:block"
          />
          <UserMenu />
          <ModeToggle />
        </div>
      </header>

      <main className="flex-1 max-md:pb-20">{children}</main>
    </div>
  );
};

export default DashboardLayout;
