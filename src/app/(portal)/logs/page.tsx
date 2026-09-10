import { getSession } from "@/lib/auth";
import { getUserLogs } from "@/lib/api";
import { formatDate, formatQuota, formatTokens } from "@/lib/quota";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { redirect } from "next/navigation";

const PAGE_SIZE = 20;

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const apiPage = currentPage - 1; // API is 0-indexed

  let logsData;
  try {
    logsData = await getUserLogs({
      accessToken: session.backendAccessToken,
      page: apiPage,
      size: PAGE_SIZE,
    });
  } catch {
    logsData = { data: [], total: 0 };
  }

  const { data: logs, total } = logsData;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Nhật ký sử dụng
        </h1>
        <p className="text-muted-foreground mt-1">
          Xem lịch sử sử dụng API và quota đã tiêu thụ.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử gọi API</CardTitle>
          <CardDescription>
            Tổng cộng {total.toLocaleString()} bản ghi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Chưa có dữ liệu sử dụng.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-right">Token Input</TableHead>
                    <TableHead className="text-right">Token Output</TableHead>
                    <TableHead className="text-right">Quota</TableHead>
                    <TableHead>Token Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {log.model_name || "—"}
                        </code>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatTokens(log.prompt_tokens)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatTokens(log.completion_tokens)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatQuota(log.quota)}
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate">
                        {log.token_name || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Trang {currentPage} / {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={hasPrev ? `/logs?page=${currentPage - 1}` : "#"}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      !hasPrev && "pointer-events-none opacity-50",
                    )}
                    aria-disabled={!hasPrev}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                  </Link>
                  <Link
                    href={hasNext ? `/logs?page=${currentPage + 1}` : "#"}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      !hasNext && "pointer-events-none opacity-50",
                    )}
                    aria-disabled={!hasNext}
                  >
                    Sau
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
