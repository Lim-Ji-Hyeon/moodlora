-- reaction_type ENUM을 ROADMAP 기준으로 수정
-- 변경: UNDERSTOOD, EMPATHY → SAD, ANGRY

ALTER TYPE reaction_type RENAME TO reaction_type_old;

CREATE TYPE reaction_type AS ENUM ('ME_TOO', 'SAD', 'ANGRY', 'CHEER_UP');

ALTER TABLE reactions
  ALTER COLUMN type TYPE reaction_type USING type::text::reaction_type;

DROP TYPE reaction_type_old;
