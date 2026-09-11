import { getSession } from "@/lib/auth";
import { getUserTopUps, type TopUpRecord } from "@/lib/api";
import { formatDate, formatQuota } from "@/lib/quota";
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
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, CreditCard, Gift } from "lucide-react";
import { redirect } from "next/navigation";
import { VoucherDialog } from "@/components/voucher-dialog";

function getStatusVariant(status: string) {
  switch (status?.toLowerCase()) {
    case "success":
    case "completed":
    case "done":
      return "active" as const;
    case "pending":
      return "expired" as const;
    case "failed":
    case "cancelled":
      return "revoked" as const;
    default:
      return "outline" as const;
  }
}

function getStatusLabel(status: string) {
  switch (status?.toLowerCase()) {
    case "success":
    case "completed":
    case "done":
      return "Thành công";
    case "pending":
      return "Đang xử lý";
    case "failed":
    case "cancelled":
      return "Thất bại";
    default:
      return status || "—";
  }
}

export default async function VouchersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  let topUps: TopUpRecord[];
  try {
    topUps = await getUserTopUps({ accessToken: session.backendAccessToken });
  } catch {
    topUps = [];
  }

  // Sort by create_time descending (newest first)
  const sortedTopUps = [...topUps].sort(
    (a, b) => b.create_time - a.create_time,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Lịch sử nạp
          </h1>
          <p className="text-[var(--mut)] mt-1">
            Xem lịch sử các giao dịch nạp quota vào tài khoản.
          </p>
        </div>
        <VoucherDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Giao dịch nạp</CardTitle>
          <CardDescription>
            Tổng cộng {sortedTopUps.length} giao dịch
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedTopUps.length === 0 ? (
            <div className="py-12 text-center">
              <Gift className="h-12 w-12 mx-auto text-[var(--mut)] mb-4" />
              <p className="text-[var(--mut)]">
                Chưa có giao dịch nạp nào.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã giao dịch</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead className="text-right">Quota</TableHead>
                  <TableHead>Ngày nạp</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTopUps.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <code className="text-xs bg-[var(--surf2)] px-1.5 py-0.5 rounded">
                        {record.trade_no || `#${record.id}`}
                      </code>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {record.money?.toLocaleString() ?? "—"}đ
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatQuota(record.amount)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(record.create_time)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(record.status)}>
                        {getStatusLabel(record.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div>
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-1.5 text-[var(--mut)]",
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại Dashboard
        </Link>
      </div>
    </div>
  );
}
