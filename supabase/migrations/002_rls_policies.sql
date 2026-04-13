-- ============================================================
-- Moodlora RLS 정책
-- ============================================================

-- -------------------------
-- profiles
-- -------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- -------------------------
-- tags (공개 읽기 전용)
-- -------------------------
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tags_select_all"
  ON tags FOR SELECT
  USING (true);

-- -------------------------
-- posts
-- -------------------------
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_select_all"
  ON posts FOR SELECT
  USING (true);

CREATE POLICY "posts_insert_authenticated"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

CREATE POLICY "posts_delete_own"
  ON posts FOR DELETE
  USING (auth.uid() = author_id);

-- -------------------------
-- post_tags
-- -------------------------
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_tags_select_all"
  ON post_tags FOR SELECT
  USING (true);

CREATE POLICY "post_tags_insert_own"
  ON post_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts
      WHERE id = post_id AND author_id = auth.uid()
    )
  );

CREATE POLICY "post_tags_delete_own"
  ON post_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE id = post_id AND author_id = auth.uid()
    )
  );

-- -------------------------
-- reactions
-- -------------------------
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reactions_select_all"
  ON reactions FOR SELECT
  USING (true);

CREATE POLICY "reactions_insert_authenticated"
  ON reactions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "reactions_delete_own"
  ON reactions FOR DELETE
  USING (auth.uid() = user_id);

-- -------------------------
-- comments
-- -------------------------
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select_all"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "comments_insert_authenticated"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

CREATE POLICY "comments_delete_own"
  ON comments FOR DELETE
  USING (auth.uid() = author_id);

-- -------------------------
-- emotion_logs (본인만 접근)
-- -------------------------
ALTER TABLE emotion_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "emotion_logs_select_own"
  ON emotion_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "emotion_logs_insert_own"
  ON emotion_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "emotion_logs_delete_own"
  ON emotion_logs FOR DELETE
  USING (auth.uid() = user_id);

-- -------------------------
-- reports
-- -------------------------
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_insert_authenticated"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = reporter_id);

CREATE POLICY "reports_select_own"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- -------------------------
-- hidden_posts (본인만 접근)
-- -------------------------
ALTER TABLE hidden_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hidden_posts_select_own"
  ON hidden_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "hidden_posts_insert_own"
  ON hidden_posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "hidden_posts_delete_own"
  ON hidden_posts FOR DELETE
  USING (auth.uid() = user_id);

-- -------------------------
-- blocks (본인만 접근)
-- -------------------------
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blocks_select_own"
  ON blocks FOR SELECT
  USING (auth.uid() = blocker_id);

CREATE POLICY "blocks_insert_own"
  ON blocks FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = blocker_id);

CREATE POLICY "blocks_delete_own"
  ON blocks FOR DELETE
  USING (auth.uid() = blocker_id);
