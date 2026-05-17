"use client";

import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Kanban,
  Users,
  BarChart3,
  CalendarCheck,
  MapPin,
  Building2,
  Sun,
  Moon,
  HamburgerIcon,
  MenuIcon,
  LogOutIcon,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { syncPendingActions } from "@/actions/offline.action";
import { logoutUser } from "@/helpers/authHelper";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/pipeline", label: "Pipeline", icon: Kanban },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/properties", label: "Properties", icon: Building2 },
  { to: "/visits", label: "Visits", icon: MapPin },
  { to: "/active-clients", label: "Active Clients", icon: MapPin },
  { to: "/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const isOnline = useOnlineStatus();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (isOnline) {
      syncPendingActions();
    }
  }, [isOnline]);

  const handleMenuClick = () => {
    if (showMenu) {
      setShowMenu(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      {showMenu && (
        <div className="absolute z-50">
          <MenuIcon className="" onClick={() => setShowMenu(true)} />
        </div>
      )}
      <aside
        className={`${showMenu ? "flex" : "hidden"} transition-all duration-300 lg:flex fixed inset-y-0 left-0 w-[220px] flex-col bg-card card-shadow z-30`}
      >
        <div className="p-4">
          <h1 className="text-sm font-bold text-primary tracking-tight">
            EstateFlow
          </h1>
          <p className="text-[10px] text-muted-foreground">Real Estate CRM</p>
        </div>
        <nav className="px-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to}
                href={item.to}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
                onClick={handleMenuClick}
              >
                <item.icon size={16} strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <nav className="px-2 space-y-0.5">
          <div
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground`}
            onClick={handleLogout}
          >
            <LogOutIcon size={16} strokeWidth={1.5} />
            {"Logout"}
          </div>
        </nav>
        <div className="mt-auto p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
              <span className="text-xs">
                {theme === "dark" ? "Dark" : "Light"}
              </span>
            </div>
            <Switch
              checked={theme === "light"}
              color="black"
              className="border dark:bg-primary bg-gray-900 border-black dark:border-white dark:text-white dark:fill-white "
              onCheckedChange={toggleTheme}
            />
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden w-full overflow-x-scroll fixed bottom-0 inset-x-0 bg-card card-shadow z-30 flex  items-center py-2 px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.to;
          return (
            <Link
              key={item.to}
              href={item.to}
              className={`flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg text-[10px] transition-colors justify-between w-full ${
                isActive ? "text-primary font-medium" : "text-muted-foreground"
              } ${item.label === "Pipeline" && "hidden"}`}
            >
              <item.icon size={18} strokeWidth={1.5} />
              {item.label === "Active Clients" ? "Active" : item.label}
            </Link>
          );
        })}
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] text-muted-foreground"
        >
          {theme === "dark" ? (
            <Sun size={18} strokeWidth={1.5} />
          ) : (
            <Moon size={18} strokeWidth={1.5} />
          )}
          Theme
        </button>
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] text-muted-foreground"
        >
          <LogOutIcon size={18} />
          Logout
        </button>
      </nav>

      {/* Main content */}
      <main className="lg:ml-[220px] p-3 sm:p-4 lg:p-6 pb-20 lg:pb-6">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
