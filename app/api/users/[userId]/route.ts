import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ─── GET /api/users/[userId] ──────────────────────────────────────────────────

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;

  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, nickname, created_at")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return NextResponse.json(
      { error: { message: "존재하지 않는 사용자입니다" } },
      { status: 404 },
    );
  }

  return NextResponse.json({ profile });
}
