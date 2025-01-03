"use client";

import Image from "next/image";
import Link from "next/link";
import { Montserrat } from "next/font/google";

import { cn } from "@/lib/utils";
import {
  Brain,
  Code,
  CoinsIcon,
  FileQuestion,
  ImageIcon,
  IndianRupee,
  LayoutDashboard,
  MessageSquare,
  PiggyBank,
  PiggyBankIcon,
  Save,
  User,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { FreeCounter } from "@/components/free-counter";

const montserrat = Montserrat({
  weight: "600",
  subsets: ["latin"],
});

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Budget Planning",
    icon: Save,
    href: "/budget",
    color: "text-violet-500",
  },
  {
    label: "Investment Strategies",
    icon: IndianRupee,
    href: "/investment",
    color: "text-red-500",
  },  
  {
    label: "Financial Doubts Solving",
    icon: MessageSquare,
    href: "/doubt",
    color: "text-green-700",
  },
  {
    label: "My Financial Habits",
    icon: User,
    href: "/habits",
    color: "text-yellow-500",
  }
];

interface SidebarProps {
  apiLimitCount: number;
}

const Sidebar = ({ apiLimitCount  = 0 }: SidebarProps) => {
  const pathname = usePathname();
  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1 items-center">
        <Link href="/dashboard" className="flex items-center pl-3 mb-6">
          <div className="relative w-8 h-8 mr-4">
            {/* <Image fill alt="logo" src="/logo.png" /> */}
            <Brain className="h-8 w-8 text-purple-600"/>
          </div>
          <h1 className={cn("text-2xl font-bold", montserrat.className)}>
            FinanceGPT
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              href={route.href}
              key={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href
                  ? "text-white bg-white/10"
                  : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <FreeCounter apiLimitCount={apiLimitCount} />
    </div>
  );
};

export default Sidebar;
