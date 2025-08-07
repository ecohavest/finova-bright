"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  LayoutDashboard,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/card",
    label: "Cards",
    icon: CreditCard,
  },
  {
    href: "/dashboard/withdraw",
    label: "Withdraw",
    icon: ArrowDownLeft,
  },
  {
    href: "/dashboard/send",
    label: "Transfer",
    icon: ArrowUpRight,
  },
];

export function DashboardNav() {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? "bg-blue-800 dark:bg-blue-900 text-white"
                : "text-blue-100 hover:bg-blue-800/50 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
