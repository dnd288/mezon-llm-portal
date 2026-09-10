import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getSelf } from "@/lib/api";
import { formatQuota, quotaToDollars } from "@/lib/quota";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { VoucherDialog } from "@/components/voucher-dialog";
import { cn } from "@/lib/utils";
import {
  Wallet,
  Activity,
  BarChart3,
  Brain,
  KeyRound,
  ScrollText,
  ArrowRight,
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

  let user;

  try {
    user = await getSelf({ accessToken: session.backendAccessToken });
  } catch {
    user = null;
  }

  const quota = user?.quota ?? 0;
  const usedQuota = user?.used_quota ?? 0;
  const requestCount = user?.request_count ?? 0;

  return (
    <div className="space-y-8">
      {/* Welcome & Voucher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Xin chào, {user?.display_name || session.username}!
          </h1>
          <p className="text-muted-foreground">
            Tổng quan tài khoản và thống kê sử dụng.
          </p>
        </div>
        <VoucherDialog />
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Số dư
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatQuota(quota)}</div>
            <p className="text-xs text-muted-foreground">
              ≈ {quotaToDollars(quota)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đã sử dụng
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatQuota(usedQuota)}</div>
            <p className="text-xs text-muted-foreground">
              ≈ {quotaToDollars(usedQuota)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng request
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requestCount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">lượt gọi API</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nhóm
            </CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="secondary">{user?.group || "default"}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">user group</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <KeyRound className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Quản lý API Key</p>
                <p className="text-sm text-muted-foreground">
                  Tạo, xem và thu hồi API key
                </p>
              </div>
            </div>
            <Link
              href="/tokens"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
              )}
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <ScrollText className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Lịch sử sử dụng</p>
                <p className="text-sm text-muted-foreground">
                  Xem chi tiết request và token usage
                </p>
              </div>
            </div>
            <Link
              href="/logs"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
              )}
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn cài đặt</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="Claude Code">
            <TabsList className="flex-wrap h-auto gap-1">
              {setupGuides.map((g) => (
                <TabsTrigger key={g.tool} value={g.tool} className="text-xs">
                  {g.tool}
                </TabsTrigger>
              ))}
            </TabsList>
            {setupGuides.map((g) => (
              <TabsContent key={g.tool} value={g.tool}>
                <div className="rounded-lg bg-zinc-950 p-4 text-zinc-50">
                  <pre className="text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap">
                    <code>{g.code}</code>
                  </pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
