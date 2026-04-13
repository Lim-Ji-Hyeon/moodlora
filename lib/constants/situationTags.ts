export const SITUATION_TAGS = [
  '직장', '연애', '가족', '건강', '학업', '친구', '자기계발', '기타',
] as const

export type SituationTag = (typeof SITUATION_TAGS)[number]
