"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ChannelAppLoginProps {
  hashData?: string;
}

export function ChannelAppLogin({ hashData }: ChannelAppLoginProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hashData) return;

    const controller = new AbortController();

    async function authenticate() {
      try {
        const response = await fetch("/api/auth/channel-app", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hashData: btoa(decodeURIComponent(hashData ?? "")) }),
          signal: controller.signal,
        });
        const result = (await response.json()) as {
          success?: boolean;
          redirectTo?: string;
          error?: string;
        };

        if (!response.ok || !result.success) {
          setError(result.error ?? "channel_app_auth_failed");
          return;
        }

        router.replace(result.redirectTo ?? "/dashboard");
        router.refresh();
      } catch (authError) {
        if (!controller.signal.aborted) {
          setError(authError instanceof Error ? authError.message : "channel_app_auth_failed");
        }
      }
    }

    void authenticate();

    return () => controller.abort();
  }, [hashData, router]);

  if (!hashData) return null;

  return (
    <div className="relative mt-4 rounded-[var(--r)] border border-[var(--bd)] bg-[var(--surf)] px-3 py-2 text-[12px] text-[var(--mut)]">
      {error ? `Đăng nhập Channel App thất bại: ${error}` : "Đang đăng nhập từ Mezon Channel App..."}
    </div>
  );
}
