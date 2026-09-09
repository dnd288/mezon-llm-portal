import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import {
  Zap,
  Shield,
  Key,
  BarChart3,
  ArrowRight,
  Code2,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Zap,
    title: "Truy cập 100+ mô hình AI",
    description:
      "GPT-4o, Claude Sonnet, Gemini, DeepSeek, Llama và nhiều hơn nữa — tất cả qua một API endpoint duy nhất.",
  },
  {
    icon: Shield,
    title: "Tương thích OpenAI API",
    description:
      "Drop-in replacement cho OpenAI SDK. Chỉ cần đổi base URL và API key — code hiện tại hoạt động ngay.",
  },
  {
    icon: Key,
    title: "Quản lý API Key linh hoạt",
    description:
      "Tạo nhiều key với hạn mức riêng, theo dõi usage, thu hồi bất cứ lúc nào.",
  },
  {
    icon: BarChart3,
    title: "Dashboard thống kê chi tiết",
    description:
      "Xem số dư, token đã dùng, model phổ biến, và lịch sử request theo thời gian thực.",
  },
  {
    icon: Code2,
    title: "Hỗ trợ mọi công cụ AI",
    description:
      "Claude Code, OpenCode, OMP, Pi.dev, Hermes, Cursor, Continue — tất cả đều hoạt động.",
  },
  {
    icon: Globe,
    title: "Giá cả minh bạch",
    description:
      "Thanh toán theo usage thực tế. Xem bảng giá chi tiết của từng model trước khi sử dụng.",
  },
];

const tools = [
  { name: "Claude Code", icon: "🤖" },
  { name: "OpenCode", icon: "💻" },
  { name: "OMP", icon: "⚡" },
  { name: "Cursor", icon: "🖱️" },
  { name: "Continue", icon: "🔄" },
];

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between mx-auto px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/mezon-logo-icon.svg"
              alt="Mezon LLM"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="font-bold text-xl">Mezon LLM</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              href="/models"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-muted-foreground">
              ✨ Powered by Mezon
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Unified AI API
              <br />
              <span className="text-primary">cho mọi công cụ</span>
            </h1>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground">
              Một API key, hàng trăm mô hình AI. Tương thích hoàn toàn với
              OpenAI SDK. Bắt đầu trong 30 giây.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href={session ? "/dashboard" : "/login"}
                className={cn(buttonVariants({ size: "lg" }))}
              >
                Bắt đầu miễn phí
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/models"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                )}
              >
                Xem bảng giá
              </Link>
            </div>
          </div>

          {/* Quick Start Code */}
          <div className="mx-auto mt-16 max-w-2xl">
            <Card className="text-left bg-zinc-950 text-zinc-50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  </div>
                  <span>Quick Start</span>
                </div>
                <pre className="text-sm leading-relaxed overflow-x-auto">
                  <code>{`export OPENAI_API_KEY="sk-your-key-here"
export OPENAI_BASE_URL="https://llm.mrdnd.dev/v1"

# Dùng với bất kỳ OpenAI-compatible tool
curl $OPENAI_BASE_URL/chat/completions \\
  -H "Authorization: Bearer $OPENAI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"Hello!"}]}'`}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features */}
        <div className="container mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">
              Mọi thứ bạn cần
            </h2>
            <p className="mt-4 text-muted-foreground">
              Từ API management đến usage tracking — tất cả trong một portal.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="border-0 shadow-none bg-muted/50">
                <CardContent className="p-6 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Compatible Tools */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold">Tương thích với</h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {tools.map((tool) => (
              <div
                key={tool.name}
                className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
              >
                <span>{tool.icon}</span>
                <span>{tool.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Image
              src="/mezon-logo-icon.svg"
              alt="Mezon"
              width={20}
              height={20}
            />
            <span>© 2025 Mezon LLM. All rights reserved.</span>
          </div>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/models" className="hover:text-foreground">
              Bảng giá
            </Link>
            <a
              href="https://mezon.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              Mezon
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
