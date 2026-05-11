import { z } from "zod";

export const REPORT_REASONS = [
  "SPAM",
  "HARASSMENT",
  "INAPPROPRIATE_CONTENT",
  "FALSE_INFORMATION",
  "OTHER",
] as const;

export const REPORT_REASON_LABELS: Record<
  (typeof REPORT_REASONS)[number],
  string
> = {
  SPAM: "스팸",
  HARASSMENT: "괴롭힘 / 혐오 표현",
  INAPPROPRIATE_CONTENT: "부적절한 콘텐츠",
  FALSE_INFORMATION: "허위 정보",
  OTHER: "기타",
};

export const reportSchema = z.object({
  postId: z.string().uuid(),
  reason: z.enum(REPORT_REASONS),
});

export const hideSchema = z.object({
  postId: z.string().uuid(),
});

export const blockSchema = z.object({
  blockedUserId: z.string().uuid(),
});

export type ReportInput = z.infer<typeof reportSchema>;
export type HideInput = z.infer<typeof hideSchema>;
export type BlockInput = z.infer<typeof blockSchema>;
