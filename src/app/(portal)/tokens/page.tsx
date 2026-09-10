import { redirect } from "next/navigation";
import { Key } from "lucide-react";

import { getSession } from "@/lib/auth";
import { getTokens } from "@/lib/api";
import { formatQuota, formatDate } from "@/lib/quota";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateTokenDialog } from "@/components/create-token-dialog";
import { DeleteTokenButton } from "@/components/delete-token-button";

export const metadata = {
  title: "API Keys",
};

function getStatusBadge(token: {
  status: number;
  expired_time: number;
}) {
  if (token.status !== 1) {
    return <Badge variant="revoked">Revoked</Badge>;
  }
  if (
    token.expired_time > 0 &&
    token.expired_time < Math.floor(Date.now() / 1000)
  ) {
    return <Badge variant="expired">Hết hạn</Badge>;
  }
  return <Badge variant="active">Active</Badge>;
}

export default async function TokensPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  let tokens: Awaited<ReturnType<typeof getTokens>> = [];
  let error: string | null = null;

  try {
    tokens = await getTokens({ accessToken: session.backendAccessToken });
  } catch (err) {
    error = err instanceof Error ? err.message : "Không thể tải danh sách key";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
          <p className="text-[var(--mut)]">
            Quản lý các API key để truy cập Mezon LLM.
          </p>
        </div>
        <CreateTokenDialog />
      </div>

      {error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : tokens.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Key className="mb-4 h-12 w-12 text-[var(--mut)]" />
            <p className="text-[var(--mut)]">
              Bạn chưa có API key nào. Tạo key đầu tiên để bắt đầu.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Danh sách key</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên Key</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Hạn mức</TableHead>
                  <TableHead>Đã dùng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[70px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map((token) => (
                  <TableRow key={token.id}>
                    <TableCell className="font-medium">{token.name}</TableCell>
                    <TableCell>{formatDate(token.created_time)}</TableCell>
                    <TableCell>
                      {token.unlimited_quota
                        ? "Không giới hạn"
                        : formatQuota(token.remain_quota)}
                    </TableCell>
                    <TableCell>{formatQuota(token.used_quota)}</TableCell>
                    <TableCell>{getStatusBadge(token)}</TableCell>
                    <TableCell>
                      <DeleteTokenButton id={token.id} name={token.name} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
