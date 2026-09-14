import { getSession, isBackendTokenExpiring } from "@/lib/auth";
import { getUserLogs } from "@/lib/api";
import { formatDate, formatQuota, formatTokens, formatDuration } from "@/lib/quota";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  if (isBackendTokenExpiring(session)) {
    const next = currentPage > 1 ? `/logs?page=${currentPage}` : "/logs";
    redirect(`/api/auth/refresh?next=${encodeURIComponent(next)}`);
  }
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
      <PageHeader
        title="Nhật ký sử dụng"
        subtitle="Xem lịch sử sử dụng API và quota đã tiêu thụ."
      />

      {logs.length === 0 ? (
        <div className="py-12 text-center text-[var(--mut)]">
          Chưa có dữ liệu sử dụng.
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Key</TableHead>
                <TableHead className="text-right">Token Input</TableHead>
                <TableHead className="text-right">Token Output</TableHead>
                <TableHead className="text-right">Fee</TableHead>
                <TableHead className="text-right">Total Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(log.created_at)}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-[var(--surf2)] px-1.5 py-0.5 rounded">
                      {log.model_name || "—"}
                    </code>
                  </TableCell>
                  <TableCell className="max-w-[120px] truncate">
                    {log.token_name || "—"}
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
                  <TableCell className="text-right font-mono">
                    {formatDuration(log.use_time)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-[var(--mut)]">
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
    </div>
  );
}
