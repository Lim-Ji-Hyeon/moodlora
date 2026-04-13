-- ============================================================
-- Moodlora 초기 DB 스키마
-- ============================================================

-- -------------------------
-- ENUM 타입
-- -------------------------

CREATE TYPE emotion_type AS ENUM (
  'JOY',
  'EXCITEMENT',
  'CALM',
  'SADNESS',
  'ANGER',
  'LETHARGY',
  'ANXIETY'
);

CREATE TYPE reaction_type AS ENUM (
  'ME_TOO',
  'UNDERSTOOD',
  'CHEER_UP',
  'EMPATHY'
);

CREATE TYPE report_reason AS ENUM (
  'SPAM',
  'HARASSMENT',
  'INAPPROPRIATE_CONTENT',
  'FALSE_INFORMATION',
  'OTHER'
);

-- -------------------------
-- 테이블
-- -------------------------

-- 프로필 (auth.users 1:1 확장)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname    TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 상황 태그
CREATE TABLE tags (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);

-- 게시글
CREATE TABLE posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  emotion     emotion_type NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  view_count  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 게시글-태그 (M:N)
CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- 공감 반응
CREATE TABLE reactions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type       reaction_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (post_id, user_id, type)
);

-- 댓글 (대댓글: parent_id 자기 참조)
CREATE TABLE comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id   UUID REFERENCES comments(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 감정 기록
CREATE TABLE emotion_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  emotion    emotion_type NOT NULL,
  note       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 신고
CREATE TABLE reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id     UUID REFERENCES posts(id) ON DELETE SET NULL,
  comment_id  UUID REFERENCES comments(id) ON DELETE SET NULL,
  reason      report_reason NOT NULL,
  description TEXT,
  resolved    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 게시글 숨기기
CREATE TABLE hidden_posts (
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- 유저 차단
CREATE TABLE blocks (
  blocker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id)
);

-- -------------------------
-- 인덱스
-- -------------------------

CREATE INDEX idx_posts_emotion     ON posts(emotion);
CREATE INDEX idx_posts_created_at  ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id  ON comments(post_id);
CREATE INDEX idx_reactions_post_id ON reactions(post_id);
CREATE INDEX idx_emotion_logs_user ON emotion_logs(user_id, created_at DESC);

-- -------------------------
-- 태그 시드 데이터
-- -------------------------

INSERT INTO tags (name) VALUES
  ('직장'),
  ('연애'),
  ('가족'),
  ('건강'),
  ('학업'),
  ('친구'),
  ('자기계발'),
  ('기타');

-- -------------------------
-- auth.users 신규 등록 트리거
-- -------------------------

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nickname)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
