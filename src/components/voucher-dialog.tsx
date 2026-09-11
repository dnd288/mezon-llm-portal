"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { Ticket } from "lucide-react";

export function VoucherDialog() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/portal/voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: code.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Nạp voucher thành công!", {
          description: data.message || "Quota đã được cộng vào tài khoản.",
        });
        setOpen(false);
        setCode("");
        // Refresh the page to update balance
        window.location.reload();
      } else {
        toast.error("Lỗi", {
          description: data.error || "Mã voucher không hợp lệ hoặc đã sử dụng.",
        });
      }
    } catch {
      toast.error("Lỗi kết nối", {
        description: "Không thể kết nối đến server. Vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex items-center justify-center gap-2 rounded-[var(--rs)] border border-[var(--bd)] bg-[var(--bg)] px-2.5 h-8 text-sm font-medium hover:bg-[var(--surf2)] transition-colors"
      >
        <Ticket className="h-4 w-4" />
        Nhập Voucher
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nhập mã Voucher</DialogTitle>
            <DialogDescription>
              Nhập mã voucher để nạp thêm quota vào tài khoản của bạn.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="voucher-code">Mã Voucher</Label>
            <Input
              id="voucher-code"
              placeholder="Nhập mã voucher..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-2"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading || !code.trim()}>
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
