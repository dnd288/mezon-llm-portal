import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-[var(--r)] border border-[var(--bd)] bg-[var(--surfS)] px-7 py-11 text-center" style={{ boxShadow: "var(--shadow)" }}>
        {/* Radial violet glow behind */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(124,58,237,.3), transparent 70%)",
            filter: "blur(6px)",
          }}
        />

        {/* Logo */}
        <div className="relative mx-auto mb-5">
          <Image
            src="/mezon-logo-icon.svg"
            alt="Mezon"
            width={84}
            height={84}
            className="mx-auto h-[84px] w-[84px]"
          />
        </div>

        {/* Brand name */}
        <div className="relative flex flex-col items-center gap-1">
          <span className="text-[20px] font-extrabold tracking-tight leading-none">
            MEZON LLM
          </span>
          <span className="text-[10px] font-semibold tracking-[0.38em] text-[var(--acc)] leading-none">
            API GATEWAY
          </span>
        </div>

        {/* Heading */}
        <h1 className="relative mt-[22px] text-[22px] font-bold tracking-[-0.015em]">
          Đăng nhập
        </h1>

        {/* Description */}
        <p className="relative mt-2 mx-auto max-w-[280px] text-[13.5px] leading-[1.6] text-[var(--mut)]">
          Dùng tài khoản Mezon để quản lý API key và theo dõi sử dụng.
        </p>

        {/* Login button */}
        <div className="relative mt-6">
          <Link
            href="/api/auth/login"
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-full gap-2.5 text-[14px] font-semibold"
            )}
            style={{ boxShadow: "0 6px 20px rgba(124,58,237,.35)" }}
          >
            Đăng nhập bằng
            <Image
              src="/mezon-brand.svg"
              alt="Mezon"
              width={80}
              height={28}
              className="h-[28px] w-auto brightness-0 invert"
            />
          </Link>
        </div>

        {/* Helper text */}
        <p className="relative mt-4 text-[11.5px] text-[var(--mut)]">
          Bạn sẽ được chuyển đến trang đăng nhập của Mezon.
        </p>
      </div>
    </div>
  );
}
