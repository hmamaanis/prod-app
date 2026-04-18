-- ─────────────────────────────────────────────
-- PROD — Full schema
-- Run this in your Supabase SQL editor
-- ─────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- Projects
create table if not exists projects (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  kind        text not null default 'feature',
  status      text not null default 'pre-production',
  day_current int  not null default 1,
  day_total   int  not null default 1,
  cover_color text not null default '#C26B4A',
  accent      text not null default '#E89B4C',
  director    text,
  dp          text,
  ad          text,
  location    text,
  call_time   text,
  wrap_time   text,
  created_at  timestamptz default now()
);

-- Cast members
create table if not exists cast_members (
  id         uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  name       text not null,
  role       text not null,
  status     text not null default 'not-called',
  eta        text,
  scenes     text[] default '{}',
  created_at timestamptz default now()
);

-- Crew members
create table if not exists crew_members (
  id         uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  name       text not null,
  role       text not null,
  status     text not null default 'on-set',
  created_at timestamptz default now()
);

-- Lighting setups
create table if not exists lighting_setups (
  id         uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  label_id   text not null,
  label      text not null,
  units      text[] default '{}',
  temp       text,
  setup_time text,
  created_at timestamptz default now()
);

-- Shots
create table if not exists shots (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid references projects(id) on delete cascade,
  shot_id     text not null,
  scene       text not null,
  setup       text not null,
  lens        text,
  status      text not null default 'planned',
  scheduled_time text,
  lighting    text,
  sort_order  int  default 0,
  created_at  timestamptz default now()
);

-- Activity feed
create table if not exists activity (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid references projects(id) on delete cascade,
  user_name   text not null,
  user_role   text,
  action      text not null,
  object      text not null,
  detail      text,
  kind        text not null default 'schedule',
  created_at  timestamptz default now()
);

-- AI insights
create table if not exists ai_insights (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid references projects(id) on delete cascade,
  severity    text not null default 'info',
  title       text not null,
  why         text,
  saves       text,
  actions     jsonb default '[]',
  kind        text not null default 'schedule',
  dismissed   bool default false,
  created_at  timestamptz default now()
);

-- Enable realtime on key tables
alter publication supabase_realtime add table shots;
alter publication supabase_realtime add table activity;
alter publication supabase_realtime add table cast_members;
