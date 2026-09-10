import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
      <Card className="w-full max-w-md bg-[var(--surfS)] border-[var(--bd)] rounded-[var(--r)]" style={{ boxShadow: "var(--shadow)" }}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Image
              src="/mezon-logo-icon.svg"
              alt="Mezon"
              width={64}
              height={64}
              className="h-16 w-16"
            />
          </div>
          <CardTitle className="text-2xl text-[var(--tx)]">Đăng nhập</CardTitle>
          <CardDescription className="text-[var(--mut)]">
            Đăng nhập vào Mezon LLM để quản lý API key và theo dõi sử dụng
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Link
            href="/api/auth/login"
            className={cn(buttonVariants({ size: "lg" }), "w-full gap-2")}
          >
            <Image
              src="/mezon-logo-icon.svg"
              alt=""
              width={20}
              height={20}
              className="h-5 w-5"
            />
            Đăng nhập bằng Mezon
          </Link>
          <p className="text-center text-xs text-[var(--mut)]">
            Bạn sẽ được chuyển hướng đến trang đăng nhập của Mezon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
