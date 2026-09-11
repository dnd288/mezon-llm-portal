import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { ArrowRight, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const tools = ["Claude Code", "OpenCode", "OMP", "Cursor", "Hermes"];

const ecosystem = [
  {
    name: "Mezon",
    url: "https://mezon.ai",
    domain: "mezon.ai",
    desc: "Nền tảng gốc — đăng nhập OAuth và tài khoản dùng chung cho toàn hệ sinh thái.",
  },
  {
    name: "Mezon Đồng",
    url: "https://dong.mezon.ai",
    domain: "dong.mezon.ai",
    desc: "Đơn vị mzđ dùng chung — xem các dịch vụ khác cùng chấp nhận Mezon Đồng.",
  },
  {
    name: "CoBar",
    url: "https://cobar.vn",
    domain: "cobar.vn",
    desc: "Mua voucher nạp mzđ, nhập mã ngay trong Dashboard để cộng quota.",
  },
];

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[var(--bd)] bg-[var(--bg)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg)]/60">
        <div className="container flex h-16 items-center justify-between mx-auto px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/mezon-logo-icon.svg"
              alt="Mezon LLM"
              width={30}
              height={30}
              className="h-[30px] w-[30px]"
            />
            <div className="flex flex-col gap-0.5">
              <span className="font-extrabold text-[15px] tracking-tight leading-none">
                MEZON LLM
              </span>
              <span className="text-[8.5px] font-semibold tracking-[0.3em] text-[var(--acc)] leading-none">
                API GATEWAY
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-[18px]">
            <Link
              href="/models"
              className="text-[13px] text-[var(--mut)] hover:text-[var(--tx)] transition-colors"
            >
              Bảng giá
            </Link>
            {session ? (
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1">
        <div className="relative px-4 py-[72px] text-center overflow-hidden">
          {/* Radial glow behind hero */}
          <div
            className="absolute top-[-160px] left-1/2 -translate-x-1/2 w-[620px] h-[340px] pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(196,31,201,.28), transparent 68%)",
              filter: "blur(10px)",
            }}
          />

          {/* Advisory pill */}
          <div className="relative inline-flex items-center gap-2 text-[12.5px] font-semibold text-[var(--warn)] border border-[color-mix(in_oklab,var(--warn)_42%,transparent)] bg-[color-mix(in_oklab,var(--warn)_10%,transparent)] rounded-full px-3.5 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--warn)] animate-mz-pulse" />
            Gateway AI giá rẻ · Dùng có cân nhắc
          </div>

          {/* Heading */}
          <h1 className="relative mt-[22px] mx-auto max-w-[840px] text-[clamp(32px,7vw,56px)] leading-[1.04] tracking-[-0.035em] font-extrabold">
            Gateway AI chi phí thấp cho
            <br />
            <span className="text-brand-gradient">phát triển & thử nghiệm</span>
          </h1>

          {/* Subheading */}
          <p className="relative mt-5 mx-auto max-w-[600px] text-[16.5px] leading-[1.6] text-[var(--mut)]">
            Một API key, hàng trăm mô hình AI với giá mzđ dễ chịu — hợp cho dự
            án cá nhân, thử nghiệm và side project. Tương thích hoàn toàn OpenAI
            & Anthropic SDK.
          </p>

          {/* CTAs */}
          <div className="relative flex gap-3 justify-center mt-7 flex-wrap">
            <Link
              href={session ? "/dashboard" : "/login"}
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Bắt đầu ngay
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/models"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Xem bảng giá
            </Link>
          </div>

          {/* Usage Advisory */}
          <div className="relative max-w-[680px] mx-auto mt-[34px] text-left flex gap-3.5 border border-[color-mix(in_oklab,var(--warn)_40%,transparent)] bg-[color-mix(in_oklab,var(--warn)_9%,transparent)] rounded-[var(--r)] p-[18px_20px]">
            <TriangleAlert className="flex-none h-[17px] w-[17px] text-[var(--warn)] mt-0.5" />
            <div>
              <div className="text-[14px] font-bold text-[var(--warn)]">
                Lưu ý quan trọng khi sử dụng · Usage advisory
              </div>
              <p className="mt-1.5 text-[13.5px] leading-[1.65]">
                Đây là dịch vụ proxy định tuyến API giá rẻ. Với ứng dụng
                production, dự án khách hàng hoặc hệ thống yêu cầu cao về bảo
                mật và quyền riêng tư, chúng tôi khuyến nghị mua tài khoản
                chính thức trực tiếp từ nhà cung cấp gốc (OpenAI, Anthropic,
                Google…).
              </p>
            </div>
          </div>

          {/* Quick Start Code */}
          <div className="relative max-w-[660px] mx-auto mt-9 text-left bg-[var(--code)] border border-[rgba(255,255,255,0.08)] rounded-[var(--r)] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[rgba(255,255,255,0.07)]">
              <div className="flex gap-[6px]">
                <span className="w-[9px] h-[9px] rounded-full bg-[#FF5F57]" />
                <span className="w-[9px] h-[9px] rounded-full bg-[#FEBC2E]" />
                <span className="w-[9px] h-[9px] rounded-full bg-[#28C840]" />
              </div>
              <span className="font-mono text-[11px] font-medium text-[#8E86A8] ml-1.5">
                Quick start
              </span>
            </div>
            <pre className="m-0 px-5 py-[18px] font-mono text-[12.5px] leading-[1.85] text-[var(--codeTx)] overflow-x-auto">
              {`export OPENAI_API_KEY="sk-your-key-here"
export OPENAI_BASE_URL="https://llm.mrdnd.dev/v1"

curl $OPENAI_BASE_URL/chat/completions \\
  -H "Authorization: Bearer $OPENAI_API_KEY" \\
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"Hello!"}]}'`}
            </pre>
          </div>

          {/* Compatible tools */}
          <div className="relative flex flex-wrap gap-2.5 justify-center mt-8">
            {tools.map((tool) => (
              <span
                key={tool}
                className="font-mono text-[12.5px] font-medium text-[var(--mut)] border border-[var(--bd)] rounded-full px-4 py-[7px]"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* Ecosystem */}
        <div className="border-t border-[var(--bd)] px-4 py-[30px]">
          <div className="container mx-auto">
            <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[var(--mut)] text-center">
              Thuộc hệ sinh thái Mezon
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-[18px]">
              {ecosystem.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-1.5 border border-[var(--bd)] rounded-[var(--r)] p-[18px] bg-[var(--surf2)] text-inherit hover:border-[var(--g2)] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="text-[14.5px] font-bold">{item.name}</span>
                    <span className="font-mono text-[11.5px] font-medium text-[var(--acc)]">
                      {item.domain} ↗
                    </span>
                  </div>
                  <p className="m-0 text-[12.5px] leading-[1.55] text-[var(--mut)]">
                    {item.desc}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--bd)] py-[18px] px-4">
        <div className="container mx-auto flex flex-wrap gap-3.5 items-center justify-between text-[12.5px] text-[var(--mut)]">
          <span>© 2026 Mezon LLM — thành viên hệ sinh thái Mezon.</span>
          <div className="flex flex-wrap gap-[18px]">
            <a
              href="https://mezon.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--acc)] hover:text-[var(--g1)] transition-colors"
            >
              mezon.ai
            </a>
            <a
              href="https://dong.mezon.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--acc)] hover:text-[var(--g1)] transition-colors"
            >
              dong.mezon.ai
            </a>
            <a
              href="https://cobar.vn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--acc)] hover:text-[var(--g1)] transition-colors"
            >
              cobar.vn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
