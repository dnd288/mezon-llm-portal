import { redirect } from "next/navigation";
import { Key } from "lucide-react";

import { getSession, isBackendTokenExpiring } from "@/lib/auth";
import { getSelf, getTokens } from "@/lib/api";
import { formatQuota, formatDate } from "@/lib/quota";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
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
  if (isBackendTokenExpiring(session)) {
    redirect("/api/auth/refresh?next=/tokens");
  }

  let tokens: Awaited<ReturnType<typeof getTokens>> = [];
  let error: string | null = null;
  let userGroup: string | undefined;

  try {
    const [tokensResult, selfResult] = await Promise.allSettled([
      getTokens({ accessToken: session.backendAccessToken }),
      getSelf({ accessToken: session.backendAccessToken }),
    ]);

    if (tokensResult.status === "fulfilled") {
      tokens = tokensResult.value;
    } else {
      error = tokensResult.reason instanceof Error ? tokensResult.reason.message : "Không thể tải danh sách key";
    }

    if (selfResult.status === "fulfilled") {
      userGroup = selfResult.value.group;
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Không thể tải danh sách key";
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="API Keys"
        subtitle="Quản lý các API key để truy cập Mezon LLM."
      >
        <CreateTokenDialog availableGroups={userGroup ? [userGroup] : undefined} />
      </PageHeader>

      {error ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--rs)] border border-[var(--bd)] py-12">
          <p className="text-destructive">{error}</p>
        </div>
      ) : tokens.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--rs)] border border-[var(--bd)] py-12">
          <Key className="mb-4 h-12 w-12 text-[var(--mut)]" />
          <p className="text-[var(--mut)]">
            Bạn chưa có API key nào. Tạo key đầu tiên để bắt đầu.
          </p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
