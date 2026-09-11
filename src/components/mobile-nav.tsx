"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PortalNavList } from "@/components/portal-nav";
import { Menu } from "lucide-react";

export function MobileNav({
  username,
  userId,
}: {
  username: string;
  userId: string | number;
}) {
  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="md:hidden" />}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Mở menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 gap-0 p-0">
        <SheetHeader className="border-b border-[var(--bd)] px-4 py-3">
          <SheetTitle className="flex items-center gap-2 text-[14.5px] font-bold">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mezon-logo-icon.svg"
              alt="Mezon LLM"
              className="h-[22px] w-[22px]"
            />
            Mezon LLM
          </SheetTitle>
        </SheetHeader>
        <PortalNavList />
        <div className="mt-auto border-t border-[var(--bd)] p-3">
          <div className="flex items-center gap-2 px-1.5 py-0.5">
            <div className="bg-brand-gradient flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
              {username.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-semibold">{username}</p>
              <p className="truncate font-mono text-[11px] text-[var(--mut)]">
                ID: {userId}
              </p>
            </div>
          </div>
          <a
            href="/api/auth/logout"
            className="mt-2 flex items-center gap-2 rounded-[var(--rs)] px-2.5 py-2 text-[12.5px] font-semibold text-[var(--mut)] transition-colors hover:bg-[var(--surf2)] hover:text-[var(--tx)]"
          >
            Đăng xuất
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
