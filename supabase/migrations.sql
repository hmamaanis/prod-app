-- Run this in the Supabase SQL editor
-- Phase 2 migrations: crew access tokens, scenes, schedule days

-- ── Crew access tokens ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crew_access_tokens (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid REFERENCES projects(id) ON DELETE CASCADE,
  crew_member_id  uuid,
  crew_type       text,        -- 'cast' | 'crew'
  name            text,
  role            text,
  token           text UNIQUE DEFAULT substr(md5(random()::text || clock_timestamp()::text), 1, 12),
  visible_tabs    text[],
  created_at      timestamptz DEFAULT now()
);

-- ── Scenes ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scenes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid REFERENCES projects(id) ON DELETE CASCADE,
  scene_number  text NOT NULL,
  synopsis      text,
  location      text,
  int_ext       text,          -- 'INT' | 'EXT' | 'INT./EXT.'
  day_night     text,          -- 'DAY' | 'NIGHT' | 'CONTINUOUS'
  pages         numeric(5,3),
  cast_ids      uuid[],
  props         text[],
  wardrobe      text[],
  sfx           text[],
  notes         text,
  sort_order    int DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- ── Schedule days ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schedule_days (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid REFERENCES projects(id) ON DELETE CASCADE,
  shoot_date    date,
  day_number    int,
  scene_ids     uuid[],
  call_time     text DEFAULT '07:00',
  wrap_time     text DEFAULT '19:00',
  location      text,
  notes         text,
  created_at    timestamptz DEFAULT now()
);

-- Enable realtime for new tables (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE crew_access_tokens;
ALTER PUBLICATION supabase_realtime ADD TABLE scenes;
ALTER PUBLICATION supabase_realtime ADD TABLE schedule_days;
