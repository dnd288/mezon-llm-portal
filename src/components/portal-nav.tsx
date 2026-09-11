"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KeyRound,
  Tags,
  ScrollText,
  Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tokens", label: "API Keys", icon: KeyRound },
  { href: "/models", label: "Bảng giá Model", icon: Tags },
  { href: "/logs", label: "Lịch sử sử dụng", icon: ScrollText },
  { href: "/vouchers", label: "Lịch sử Voucher", icon: Ticket },
];

/**
 * Portal navigation with the design-system active treatment (brand
 * gradient on the current item). `usePathname` is client state, so the
 * desktop sidebar and the mobile sheet both render this leaf.
 */
export function PortalNavList({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-1 flex-col gap-0.5 p-2.5", className)}>
      {navItems.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-[var(--rs)] px-3 py-2 text-[13px] transition-colors",
              active
                ? "bg-brand-gradient font-semibold text-white shadow-[0_4px_14px_rgba(124,58,237,0.3)]"
                : "font-medium text-[var(--mut)] hover:bg-[var(--surf2)] hover:text-[var(--tx)]",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
