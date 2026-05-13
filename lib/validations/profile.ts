import { z } from "zod";

export const nicknameSchema = z.object({
  nickname: z
    .string()
    .min(2, "닉네임은 2자 이상이어야 합니다")
    .max(20, "닉네임은 20자 이하여야 합니다")
    .regex(/^[가-힣a-zA-Z0-9_]+$/, "특수문자는 사용할 수 없습니다"),
});

export type NicknameInput = z.infer<typeof nicknameSchema>;
