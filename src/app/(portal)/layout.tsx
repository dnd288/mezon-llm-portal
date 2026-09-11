import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LogOut } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { MobileNav } from "@/components/mobile-nav";
import { PortalNavList } from "@/components/portal-nav";
import Image from "next/image";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal",
};


export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--bd)] bg-[var(--surf)]/30 md:flex">
        <div className="flex h-14 items-center gap-2 border-b border-[var(--bd)] px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Image
              src="/mezon-logo-icon.svg"
              alt="Mezon LLM"
              width={22}
              height={22}
              className="h-[22px] w-[22px]"
            />
            <span className="text-[14.5px] font-bold">Mezon LLM</span>
          </Link>
        </div>
        <PortalNavList />
        <Separator />
        <div className="p-3">
          <p className="truncate px-2 text-sm font-medium">
            {session.username}
          </p>
          <p className="truncate px-2 text-xs text-[var(--mut)]">
            ID: {session.userId}
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-[var(--bd)] bg-[var(--bg)]/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg)]/60">
          <div className="flex items-center gap-2">
            {/* Mobile hamburger */}
            <MobileNav />
            <Link
              href="/dashboard"
              className="flex items-center gap-2 md:hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/mezon-logo-icon.svg"
                alt="Mezon LLM"
                className="h-6 w-6"
              />
              <span className="font-semibold">Mezon LLM</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[var(--mut)] sm:inline">
              {session.username}
            </span>
            <a
              href="/api/auth/logout"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </a>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
