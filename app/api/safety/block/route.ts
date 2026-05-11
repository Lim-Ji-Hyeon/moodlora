import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { blockSchema } from "@/lib/validations/safety";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: { message: "로그인이 필요합니다" } },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { message: "잘못된 요청입니다" } },
      { status: 400 },
    );
  }

  const parsed = blockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          message: "입력값이 올바르지 않습니다",
          issues: parsed.error.issues,
        },
      },
      { status: 400 },
    );
  }

  const { blockedUserId } = parsed.data;

  if (blockedUserId === user.id) {
    return NextResponse.json(
      { error: { message: "자기 자신을 차단할 수 없습니다" } },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("blocks")
    .upsert(
      { blocker_id: user.id, blocked_id: blockedUserId },
      { onConflict: "blocker_id,blocked_id" },
    );

  if (error) {
    return NextResponse.json(
      { error: { message: "차단에 실패했습니다" } },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
