import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PortalNavList } from "@/components/portal-nav";
import { MobileNav } from "@/components/mobile-nav";
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
        <div className="border-t border-[var(--bd)] p-3">
          <div className="flex items-center gap-2 px-1.5 py-0.5">
            <div className="bg-brand-gradient flex size-[30px] shrink-0 items-center justify-center rounded-full text-[12.5px] font-bold text-white">
              {session.username.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold">{session.username}</p>
              <p className="truncate font-mono text-[11px] text-[var(--mut)]">
                ID: {session.userId}
              </p>
            </div>
          </div>
          <a
            href="/api/auth/logout"
            className="mt-2 flex items-center gap-2 rounded-[var(--rs)] px-2.5 py-2 text-[12.5px] font-semibold text-[var(--mut)] transition-colors hover:bg-[var(--surf2)] hover:text-[var(--tx)]"
          >
            <LogOut className="size-[13px]" />
            Đăng xuất
          </a>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-[var(--bd)] bg-[var(--bg)]/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg)]/60">
          <div className="flex items-center gap-2">
            {/* Mobile hamburger */}
            <MobileNav username={session.username} userId={session.userId} />
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
          <nav className="flex items-center gap-4">
            <Link
              href="/models"
              className="text-[13px] font-medium text-[var(--mut)] transition-colors hover:text-[var(--tx)]"
            >
              Bảng giá
            </Link>
          </nav>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
