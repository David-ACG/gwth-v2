-- ============================================================================
-- GWTH Lesson Tables — Database Migration
-- Creates tables for courses, sections, lessons, quiz questions, and resources.
-- Supports the Pipeline-to-Site lesson bridge (GWTH-7jf).
-- Run in Supabase SQL Editor after migrations 001 and 002.
-- ============================================================================

-- ─── 1. COURSES TABLE ──────────────────────────────────────────────────────

CREATE TABLE courses (
  id              TEXT PRIMARY KEY,
  slug            TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  thumbnail       TEXT,
  blur_data_url   TEXT,
  price           INTEGER NOT NULL DEFAULT 0,
  category        TEXT NOT NULL DEFAULT 'Applied AI',
  difficulty      TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Seed the single course
INSERT INTO courses (id, slug, title, description, category, difficulty, estimated_duration) VALUES
(
  'course_gwth',
  'applied-ai-skills',
  'GWTH — Applied AI Skills',
  'Master AI in plain English. Build real apps, automate workflows, and transform your career — no coding required. A 3-month journey from AI beginner to enterprise-ready practitioner.',
  'Applied AI',
  'beginner',
  5880
);

-- ─── 2. SECTIONS TABLE ─────────────────────────────────────────────────────

CREATE TABLE sections (
  id              TEXT PRIMARY KEY,
  course_id       TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  "order"         INTEGER NOT NULL DEFAULT 0,
  month           INTEGER NOT NULL CHECK (month IN (1, 2, 3)),
  is_optional     BOOLEAN NOT NULL DEFAULT FALSE,
  optional_track  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sections_course ON sections(course_id);
CREATE INDEX idx_sections_month ON sections(month);
CREATE INDEX idx_sections_order ON sections("order");

-- ─── 3. LESSONS TABLE ──────────────────────────────────────────────────────

CREATE TABLE lessons (
  id              TEXT PRIMARY KEY,
  slug            TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  "order"         INTEGER NOT NULL DEFAULT 0,
  duration        INTEGER NOT NULL DEFAULT 45,
  difficulty      TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  category        TEXT NOT NULL DEFAULT '',
  section_id      TEXT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  course_id       TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  course_slug     TEXT NOT NULL DEFAULT 'applied-ai-skills',
  month           INTEGER NOT NULL CHECK (month IN (1, 2, 3)),
  is_optional     BOOLEAN NOT NULL DEFAULT FALSE,
  optional_track  TEXT,

  -- Learn tab content
  intro_video_url TEXT,
  learn_content   TEXT NOT NULL DEFAULT '',
  audio_file_url  TEXT,
  audio_duration  REAL,

  -- Build tab content
  build_video_url TEXT,
  build_instructions TEXT,

  -- Default publish status (per-user status is in lesson_progress)
  status          TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('locked', 'available', 'in-progress', 'completed')),

  -- Extended metadata from pipeline
  objectives      TEXT[] DEFAULT '{}',
  tags            TEXT[] DEFAULT '{}',
  prerequisites   TEXT[] DEFAULT '{}',
  pipeline_id     UUID,
  pipeline_status TEXT CHECK (pipeline_status IN ('draft', 'in_progress', 'review', 'published', 'exported')),
  exported_at     TIMESTAMPTZ,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lessons_slug ON lessons(slug);
CREATE INDEX idx_lessons_section ON lessons(section_id);
CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_lessons_month ON lessons(month);
CREATE INDEX idx_lessons_order ON lessons("order");
CREATE INDEX idx_lessons_tags ON lessons USING GIN(tags);

-- ─── 4. QUIZ QUESTIONS TABLE ───────────────────────────────────────────────

CREATE TABLE quiz_questions (
  id                    TEXT PRIMARY KEY,
  lesson_id             TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question              TEXT NOT NULL,
  options               TEXT[] NOT NULL DEFAULT '{}',
  correct_option_index  INTEGER NOT NULL DEFAULT 0,
  explanation           TEXT NOT NULL DEFAULT '',
  "order"               INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quiz_questions_lesson ON quiz_questions(lesson_id);

-- ─── 5. RESOURCES TABLE ────────────────────────────────────────────────────

CREATE TABLE lesson_resources (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id       TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  url             TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT 'link' CHECK (type IN ('link', 'download', 'video', 'article')),
  "order"         INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lesson_resources_lesson ON lesson_resources(lesson_id);

-- ─── 6. LESSON PROGRESS TABLE ──────────────────────────────────────────────
-- Per-user progress tracking (separate from lesson publish status)

CREATE TABLE lesson_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id       TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  is_completed    BOOLEAN NOT NULL DEFAULT FALSE,
  progress        REAL NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 1),
  quiz_score      REAL,
  best_quiz_score REAL,
  quiz_attempts   INTEGER NOT NULL DEFAULT 0,
  time_spent      INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);

-- ─── 7. ROW LEVEL SECURITY ─────────────────────────────────────────────────

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- Public read for all content tables (lessons are public content)
CREATE POLICY "Public can read courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Public can read sections" ON sections FOR SELECT USING (true);
CREATE POLICY "Public can read lessons" ON lessons FOR SELECT USING (true);
CREATE POLICY "Public can read quiz questions" ON quiz_questions FOR SELECT USING (true);
CREATE POLICY "Public can read resources" ON lesson_resources FOR SELECT USING (true);

-- Service role can manage content (pipeline imports use service role key)
CREATE POLICY "Service role manages courses" ON courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages sections" ON sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages lessons" ON lessons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages quiz questions" ON quiz_questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages resources" ON lesson_resources FOR ALL USING (true) WITH CHECK (true);

-- Progress: users can read/write their own progress only
CREATE POLICY "Users read own progress" ON lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress" ON lesson_progress FOR UPDATE USING (auth.uid() = user_id);

-- ─── 8. UPDATED_AT TRIGGERS ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_lesson_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_lesson_updated_at();

CREATE TRIGGER sections_updated_at
  BEFORE UPDATE ON sections
  FOR EACH ROW EXECUTE FUNCTION update_lesson_updated_at();

CREATE TRIGGER lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_lesson_updated_at();

-- ─── 9. UPSERT FUNCTION FOR PIPELINE IMPORTS ───────────────────────────────
-- Called by the admin import API to upsert a lesson and its related data.

CREATE OR REPLACE FUNCTION upsert_lesson_from_pipeline(
  p_lesson JSONB,
  p_questions JSONB DEFAULT '[]'::JSONB,
  p_resources JSONB DEFAULT '[]'::JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_lesson_id TEXT;
  v_section_id TEXT;
  v_q JSONB;
  v_r JSONB;
  v_q_order INTEGER := 0;
  v_r_order INTEGER := 0;
BEGIN
  v_lesson_id := p_lesson->>'id';
  v_section_id := p_lesson->>'sectionId';

  -- Upsert section if it doesn't exist
  INSERT INTO sections (id, course_id, title, "order", month, is_optional, optional_track)
  VALUES (
    v_section_id,
    COALESCE(p_lesson->>'courseId', 'course_gwth'),
    COALESCE(p_lesson->>'sectionTitle', 'Week ' || (p_lesson->>'month')::TEXT),
    COALESCE((p_lesson->>'sectionOrder')::INTEGER, 0),
    (p_lesson->>'month')::INTEGER,
    COALESCE((p_lesson->>'isOptional')::BOOLEAN, FALSE),
    p_lesson->>'optionalTrack'
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    "order" = EXCLUDED."order",
    updated_at = NOW();

  -- Upsert lesson
  INSERT INTO lessons (
    id, slug, title, description, "order", duration, difficulty, category,
    section_id, course_id, course_slug, month, is_optional, optional_track,
    intro_video_url, learn_content, audio_file_url, audio_duration,
    build_video_url, build_instructions, status,
    objectives, tags, prerequisites,
    pipeline_id, pipeline_status, exported_at
  ) VALUES (
    v_lesson_id,
    p_lesson->>'slug',
    p_lesson->>'title',
    COALESCE(p_lesson->>'description', ''),
    COALESCE((p_lesson->>'order')::INTEGER, 0),
    COALESCE((p_lesson->>'duration')::INTEGER, 45),
    COALESCE(p_lesson->>'difficulty', 'beginner'),
    COALESCE(p_lesson->>'category', ''),
    v_section_id,
    COALESCE(p_lesson->>'courseId', 'course_gwth'),
    COALESCE(p_lesson->>'courseSlug', 'applied-ai-skills'),
    (p_lesson->>'month')::INTEGER,
    COALESCE((p_lesson->>'isOptional')::BOOLEAN, FALSE),
    p_lesson->>'optionalTrack',
    p_lesson->>'introVideoUrl',
    COALESCE(p_lesson->>'learnContent', ''),
    p_lesson->>'audioFileUrl',
    (p_lesson->>'audioDuration')::REAL,
    p_lesson->>'buildVideoUrl',
    p_lesson->>'buildInstructions',
    COALESCE(p_lesson->>'status', 'available'),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_lesson->'objectives')), '{}'),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_lesson->'tags')), '{}'),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_lesson->'prerequisites')), '{}'),
    (p_lesson->>'pipelineId')::UUID,
    p_lesson->>'pipelineStatus',
    (p_lesson->>'exportedAt')::TIMESTAMPTZ
  )
  ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    "order" = EXCLUDED."order",
    duration = EXCLUDED.duration,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    section_id = EXCLUDED.section_id,
    month = EXCLUDED.month,
    is_optional = EXCLUDED.is_optional,
    optional_track = EXCLUDED.optional_track,
    intro_video_url = EXCLUDED.intro_video_url,
    learn_content = EXCLUDED.learn_content,
    audio_file_url = EXCLUDED.audio_file_url,
    audio_duration = EXCLUDED.audio_duration,
    build_video_url = EXCLUDED.build_video_url,
    build_instructions = EXCLUDED.build_instructions,
    status = EXCLUDED.status,
    objectives = EXCLUDED.objectives,
    tags = EXCLUDED.tags,
    prerequisites = EXCLUDED.prerequisites,
    pipeline_id = EXCLUDED.pipeline_id,
    pipeline_status = EXCLUDED.pipeline_status,
    exported_at = EXCLUDED.exported_at,
    updated_at = NOW();

  -- Replace quiz questions (delete old, insert new)
  DELETE FROM quiz_questions WHERE lesson_id = v_lesson_id;
  FOR v_q IN SELECT * FROM jsonb_array_elements(p_questions) LOOP
    INSERT INTO quiz_questions (id, lesson_id, question, options, correct_option_index, explanation, "order")
    VALUES (
      v_q->>'id',
      v_lesson_id,
      v_q->>'question',
      ARRAY(SELECT jsonb_array_elements_text(v_q->'options')),
      COALESCE((v_q->>'correctOptionIndex')::INTEGER, 0),
      COALESCE(v_q->>'explanation', ''),
      v_q_order
    );
    v_q_order := v_q_order + 1;
  END LOOP;

  -- Replace resources (delete old, insert new)
  DELETE FROM lesson_resources WHERE lesson_id = v_lesson_id;
  FOR v_r IN SELECT * FROM jsonb_array_elements(p_resources) LOOP
    INSERT INTO lesson_resources (lesson_id, title, url, type, "order")
    VALUES (
      v_lesson_id,
      v_r->>'title',
      v_r->>'url',
      COALESCE(v_r->>'type', 'link'),
      v_r_order
    );
    v_r_order := v_r_order + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'lesson_id', v_lesson_id,
    'questions_count', jsonb_array_length(p_questions),
    'resources_count', jsonb_array_length(p_resources),
    'status', 'upserted'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
