"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, Check, TriangleAlert, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EXPIRY_OPTIONS = [
  { value: "30", label: "30 ngày" },
  { value: "90", label: "90 ngày" },
  { value: "180", label: "180 ngày" },
  { value: "unlimited", label: "Không giới hạn" },
] as const;

function uniqueGroups(groups: string[] = []) {
  const normalized = ["default", ...groups.map((candidate) => candidate.trim()).filter(Boolean)];
  return normalized.filter((candidate, index) => normalized.indexOf(candidate) === index);
}

export interface CreateTokenDialogProps {
  availableGroups?: string[];
}


export function CreateTokenDialog({ availableGroups }: CreateTokenDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState<string>("30");
  const [quota, setQuota] = useState("");
  const groups = uniqueGroups(availableGroups);
  const [group, setGroup] = useState(groups[0] ?? "default");
  const [loading, setLoading] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const resetForm = () => {
    setName("");
    setExpiry("30");
    setQuota("");
    setGroup(groups[0] ?? "default");
    setCreatedKey(null);
    setCopied(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset when closing
      setTimeout(resetForm, 200);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên key");
      return;
    }

    setLoading(true);
    try {
      const expiredTime =
        expiry === "unlimited"
          ? undefined
          : Math.floor(Date.now() / 1000) + Number(expiry) * 86400;

      const res = await fetch("/api/portal/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          expired_time: expiredTime,
          remain_quota: quota ? Number(quota) : undefined,
          unlimited_quota: !quota,
          group,
        }),
      });

      const json = (await res.json()) as {
        success: boolean;
        data?: { id: number; key?: string };
        error?: string;
      };

      if (!json.success || !json.data) {
        toast.error(json.error ?? "Tạo key thất bại");
        return;
      }

      // The create response does NOT contain the key; fetch it once via POST
      const keyRes = await fetch(`/api/portal/tokens/${json.data.id}`, {
        method: "POST",
      });
      const keyJson = (await keyRes.json()) as {
        success: boolean;
        data?: string;
        error?: string;
      };

      if (!keyJson.success || !keyJson.data) {
        toast.error(keyJson.error ?? "Không thể lấy key");
        return;
      }

      setCreatedKey(keyJson.data);
      toast.success("Tạo key thành công");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Đã xảy ra lỗi",
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!createdKey) return;
    try {
      await navigator.clipboard.writeText(createdKey);
      setCopied(true);
      toast.success("Đã sao chép");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không thể sao chép");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tạo Key Mới
          </Button>
        }
      />
      <DialogContent>
        {createdKey ? (
          <>
            <DialogHeader>
              <DialogTitle>Key đã được tạo</DialogTitle>
              <DialogDescription>
                Vui lòng lưu key này ở nơi an toàn. Bạn sẽ không thể xem lại
                sau khi đóng hộp thoại.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 rounded-lg border border-[var(--bd)] bg-[var(--surf2)] p-3">
                <code className="flex-1 break-all text-sm font-mono text-[var(--tx)]">
                  {createdKey}
                </code>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={copyToClipboard}
                  aria-label="Sao chép key"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-[var(--ok)]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-[var(--warn)]/20 bg-[var(--warn)]/10 p-3 text-sm text-[var(--warn)]">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Key này chỉ hiển thị một lần. Hãy sao chép và lưu trữ an
                  toàn.
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)}>Đóng</Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Tạo API Key Mới</DialogTitle>
              <DialogDescription>
                Tạo một API key mới để truy cập Mezon LLM.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="token-name">Tên key</Label>
                <Input
                  id="token-name"
                  placeholder="Ví dụ: Production, Development..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="token-expiry">Thời hạn</Label>
                <Select
                  value={expiry}
                  onValueChange={(val) => setExpiry(val as string)}
                  disabled={loading}
                >
                  <SelectTrigger id="token-expiry" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPIRY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="token-group">Group</Label>
                <Select
                  value={group}
                  onValueChange={(value) => {
                    if (value) setGroup(value);
                  }}
                  disabled={loading}
                >
                  <SelectTrigger id="token-group" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="token-quota">Hạn mức quota (tùy chọn)</Label>
                <Input
                  id="token-quota"
                  type="number"
                  min="0"
                  placeholder="Để trống nếu không giới hạn"
                  value={quota}
                  onChange={(e) => setQuota(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang tạo..." : "Tạo Key"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
