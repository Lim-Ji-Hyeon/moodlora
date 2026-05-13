import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { nicknameSchema } from "@/lib/validations/profile";

// ─── GET /api/profile ─────────────────────────────────────────────────────────

export async function GET() {
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

  const { data: profile, error } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return NextResponse.json(
      { error: { message: "프로필을 불러오는 데 실패했습니다" } },
      { status: 500 },
    );
  }

  return NextResponse.json({ profile });
}

// ─── PATCH /api/profile ───────────────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
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

  const parsed = nicknameSchema.safeParse(body);
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

  const { nickname } = parsed.data;

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({ nickname, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select()
    .single();

  if (error || !profile) {
    return NextResponse.json(
      { error: { message: "닉네임 수정에 실패했습니다" } },
      { status: 500 },
    );
  }

  return NextResponse.json({ profile });
}
