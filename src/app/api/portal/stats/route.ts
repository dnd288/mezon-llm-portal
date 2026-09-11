import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserLogsStat, getUserLogs } from "@/lib/api";

/** LogTypeConsume = 2 in the backend */
const LOG_TYPE_CONSUME = 2;

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const sp = request.nextUrl.searchParams;
  const startTimestamp = sp.get("start") ? Number(sp.get("start")) : undefined;
  const endTimestamp = sp.get("end") ? Number(sp.get("end")) : undefined;

  try {
    const [stat, logs] = await Promise.all([
      getUserLogsStat({
        accessToken: session.backendAccessToken,
        type: LOG_TYPE_CONSUME,
        startTimestamp,
        endTimestamp,
      }),
      getUserLogs({
        accessToken: session.backendAccessToken,
        type: LOG_TYPE_CONSUME,
        size: 1,
        startTimestamp,
        endTimestamp,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        usedQuota: stat.quota,
        requestCount: logs.total,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Không thể tải thống kê";
    return NextResponse.json(
      { success: false, error: message },
      { status: 502 },
    );
  }
}
