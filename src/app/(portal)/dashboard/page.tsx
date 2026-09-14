import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, isBackendTokenExpiring } from "@/lib/auth";
import { getSelf } from "@/lib/api";
import { formatQuota } from "@/lib/quota";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buttonVariants } from "@/components/ui/button";
import { VoucherDialog } from "@/components/voucher-dialog";
import { UsageStats } from "@/components/usage-stats";
import { cn } from "@/lib/utils";
import {
  KeyRound,
  ArrowRight,
  TriangleAlert,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

const setupGuides: {
  tool: string;
  code: string;
}[] = [
  {
    tool: "Claude Code",
    code: `# Thêm vào ~/.claude/settings.json hoặc chạy:
claude config set --global apiProvider openai
claude config set --global openai.baseUrl "https://llm.mrdnd.dev/v1"
claude config set --global openai.apiKey "sk-your-key-here"

# Hoặc dùng biến môi trường:
export OPENAI_API_KEY="sk-your-key-here"
export OPENAI_BASE_URL="https://llm.mrdnd.dev/v1"
claude`,
  },
  {
    tool: "OpenCode",
    code: `# Thêm vào file cấu hình opencode:
export OPENAI_API_KEY="sk-your-key-here"
export OPENAI_BASE_URL="https://llm.mrdnd.dev/v1"
opencode`,
  },
  {
    tool: "OMP",
    code: `# Cấu hình OMP sử dụng Mezon LLM:
export OPENAI_API_KEY="sk-your-key-here"
export OPENAI_BASE_URL="https://llm.mrdnd.dev/v1"

# Chạy OMP với model bất kỳ
omp --model gpt-4o "Hello world"`,
  },
  {
    tool: "Cursor",
    code: `# Trong Cursor Settings > Models > OpenAI:
# API Key: sk-your-key-here
# Base URL: https://llm.mrdnd.dev/v1
#
# Chọn model: gpt-4o, claude-sonnet-4-20250514, ...`,
  },
  {
    tool: "Hermes",
    code: `# Cấu hình biến môi trường:
export OPENAI_API_KEY="sk-your-key-here"
export OPENAI_BASE_URL="https://llm.mrdnd.dev/v1"

# Hermes sẽ tự động sử dụng endpoint này`,
  },
];

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (isBackendTokenExpiring(session)) {
    redirect("/api/auth/refresh?next=/dashboard");
  }

  let user;

  try {
    user = await getSelf({ accessToken: session.backendAccessToken });
  } catch {
    user = null;
  }

  const quota = user?.quota;
  const usedQuota = user?.used_quota;
  const requestCount = user?.request_count;

  return (
    <div className="flex flex-col gap-6">
      {!user && (
        <div className="flex gap-2.5 rounded-[var(--rs)] border border-[color-mix(in_oklab,var(--warn)_32%,transparent)] bg-[color-mix(in_oklab,var(--warn)_12%,transparent)] p-3.5 text-[var(--warn)]">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-[12.5px] leading-5">
            Không tải được số liệu từ gateway. Trang vẫn dùng được — thử tải lại sau ít phút.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.015em]">
            Xin chào, {user?.display_name || session.username}!
          </h1>
          <p className="mt-1 text-[13px] text-[var(--mut)]">
            Tổng quan tài khoản và thống kê sử dụng.
          </p>
        </div>
        <VoucherDialog />
      </div>

      <div className="grid gap-3.5 lg:grid-cols-[1.4fr_1fr]">
        <section className="overflow-hidden rounded-[var(--r)] bg-brand-gradient p-5 text-white shadow-brand-glow">
          <p className="text-xs font-semibold tracking-[0.08em] uppercase opacity-85">Số dư khả dụng</p>
          <p className="mt-2 text-[38px] leading-none font-extrabold tracking-[-0.03em]">
            {quota === undefined ? "—" : formatQuota(quota)}
          </p>
          <p className="mt-1 font-mono text-[13px] opacity-90">mzđ · Mezon Đồng</p>
        </section>

        <UsageStats
          initialUsedQuota={usedQuota}
          initialRequestCount={requestCount}
          group={user?.group}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn cài đặt</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="Claude Code">
            <TabsList className="h-auto flex-wrap gap-1">
              {setupGuides.map((guide) => (
                <TabsTrigger key={guide.tool} value={guide.tool} className="text-xs">{guide.tool}</TabsTrigger>
              ))}
            </TabsList>
            {setupGuides.map((guide) => (
              <TabsContent key={guide.tool} value={guide.tool}>
                <div className="mt-3 rounded-[var(--rs)] border border-white/7 bg-[var(--code)] p-5 text-[var(--codeTx)]">
                  <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[12.5px] leading-[1.85]"><code>{guide.code}</code></pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Card className="shadow-none">
          <CardContent className="flex items-center justify-between p-[18px]">
            <div>
              <p className="font-semibold">Quản lý API Key</p>
              <p className="mt-1 text-[12.5px] text-[var(--mut)]">Tạo, xem và thu hồi API key</p>
            </div>
            <Link href="/tokens" className={cn(buttonVariants({ variant: "ghost", size: "icon" }))} aria-label="Mở API Keys"><KeyRound className="h-5 w-5 text-[var(--acc)]" /></Link>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="flex items-center justify-between p-[18px]">
            <div>
              <p className="font-semibold">Lịch sử sử dụng</p>
              <p className="mt-1 text-[12.5px] text-[var(--mut)]">Chi tiết request và token usage</p>
            </div>
            <Link href="/logs" className={cn(buttonVariants({ variant: "ghost", size: "icon" }))} aria-label="Mở lịch sử sử dụng"><ArrowRight className="h-5 w-5 text-[var(--acc)]" /></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
