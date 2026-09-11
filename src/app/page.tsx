import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { ArrowRight, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";


const ecosystem = [
  {
    name: "Mezon",
    url: "https://mezon.ai",
    domain: "mezon.ai",
    logo: "/mezon-brand.svg",
    logoAlt: "Mezon Logo",
    logoWidth: 84,
    logoHeight: 25,
    showName: false,
    logoClass: "h-6 w-auto object-contain",
    desc: "Nền tảng gốc — đăng nhập OAuth và tài khoản dùng chung cho toàn hệ sinh thái.",
  },
  {
    name: "Mezon Đồng",
    url: "https://dong.mezon.ai",
    domain: "dong.mezon.ai",
    logo: "/mezon-dong-logo.webp",
    logoAlt: "Mezon Đồng Logo",
    logoWidth: 26,
    logoHeight: 26,
    showName: true,
    logoClass: "h-6.5 w-6.5 rounded-md object-contain",
    desc: "Đơn vị mzđ dùng chung — xem các dịch vụ khác cùng chấp nhận Mezon Đồng.",
  },
  {
    name: "CoBar",
    url: "https://cobar.vn",
    domain: "cobar.vn",
    logo: "/cobar-logo.png",
    logoAlt: "CoBar Logo",
    logoWidth: 64,
    logoHeight: 27,
    showName: false,
    logoWrapperClass: "bg-white rounded-md px-2 py-0.5 flex items-center shadow-xs",
    logoClass: "h-5 w-auto object-contain",
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
                  className="group flex flex-col gap-2 border border-[var(--bd)] rounded-[var(--r)] p-[18px] bg-[var(--surf2)] text-inherit hover:border-[var(--g2)] hover:bg-[color-mix(in_oklab,var(--surf2)_88%,var(--g2))] transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-2.5 h-8">
                    <div className="flex items-center gap-2.5">
                      {item.logoWrapperClass ? (
                        <div className={item.logoWrapperClass}>
                          <Image
                            src={item.logo}
                            alt={item.logoAlt}
                            width={item.logoWidth}
                            height={item.logoHeight}
                            className={item.logoClass}
                          />
                        </div>
                      ) : (
                        <Image
                          src={item.logo}
                          alt={item.logoAlt}
                          width={item.logoWidth}
                          height={item.logoHeight}
                          className={item.logoClass}
                        />
                      )}
                      {item.showName && (
                        <span className="text-[14.5px] font-bold text-[var(--tx)]">
                          {item.name}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11.5px] font-medium text-[var(--acc)] group-hover:text-[var(--g1)] transition-colors shrink-0">
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
