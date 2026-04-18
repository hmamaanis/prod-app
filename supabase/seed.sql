-- ─────────────────────────────────────────────
-- PROD — Seed data (Dust Valley project)
-- Run AFTER schema.sql
-- ─────────────────────────────────────────────

-- Insert project
insert into projects (id, title, kind, status, day_current, day_total, cover_color, accent, director, dp, ad, location, call_time, wrap_time)
values (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Dust Valley', 'feature', 'in-production',
  12, 24, '#C26B4A', '#E89B4C',
  'M. Okafor', 'L. Ferrara', 'J. Nakamura',
  'Warehouse 4 — Brooklyn Navy Yard', '06:30', '19:00'
);

-- Cast
insert into cast_members (project_id, name, role, status, eta, scenes) values
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Elena Vasquez', 'NORA',     'on-set',    null,    array['24A','24B','25']),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Marcus Reid',   'DET. KANE','travel',    '07:40', array['25','27']),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Priya Shah',    'MAYA',     'holding',   null,    array['27']),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Tomás Bell',    'ROY',      'wrapped',   null,    array['24B']),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Aria Chen',     'CHILD',    'not-called',null,    array['31 (tmr)']);

-- Crew
insert into crew_members (project_id, name, role, status) values
  ('a1b2c3d4-0000-0000-0000-000000000001', 'L. Ferrara',  'DP',          'on-set'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'J. Nakamura', '1st AD',      'on-set'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'R. Okoye',    'Gaffer',      'on-set'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'S. Patel',    'Key Grip',    'on-set'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'D. Moreau',   'Sound Mix',   'travel'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'K. Reyes',    'Script Super','on-set'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'B. Lindgren', 'Hair/Makeup', 'on-set'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'H. Park',     '2nd AD',      'at-base');

-- Lighting
insert into lighting_setups (project_id, label_id, label, units, temp, setup_time) values
  ('a1b2c3d4-0000-0000-0000-000000000001', 'A', 'Warehouse interior — morning haze',
   array['2× 18K HMI (south window)','4× Astera tubes (practical)','1× 4ft Kino (fill)'], '5600K', '45m'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'B', 'Interrogation — hard top light',
   array['1× 1.2K tungsten (top)','2× black flag','Practical desk lamp'], '3200K', '1h 20m'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'C', 'Hallway — sodium practicals',
   array['6× Astera in practicals','1× 650W kicker'], '2700K', '35m');

-- Shots
insert into shots (project_id, shot_id, scene, setup, lens, status, scheduled_time, lighting, sort_order) values
  ('a1b2c3d4-0000-0000-0000-000000000001', '24A-1', '24A', 'WIDE · dolly in',       '35mm',  'done',    '07:12', 'A', 1),
  ('a1b2c3d4-0000-0000-0000-000000000001', '24A-2', '24A', 'MCU · Nora',            '50mm',  'done',    '08:05', 'A', 2),
  ('a1b2c3d4-0000-0000-0000-000000000001', '24A-3', '24A', 'OTS · Kane',            '50mm',  'current', '09:45', 'A', 3),
  ('a1b2c3d4-0000-0000-0000-000000000001', '24B-1', '24B', 'WIDE · crane up',       '24mm',  'next',    '10:30', 'A', 4),
  ('a1b2c3d4-0000-0000-0000-000000000001', '24B-2', '24B', 'INSERT · hands',        '100mm', 'planned', '11:15', 'A', 5),
  ('a1b2c3d4-0000-0000-0000-000000000001', '25-1',  '25',  'WIDE establishing',     '24mm',  'planned', '13:30', 'B', 6),
  ('a1b2c3d4-0000-0000-0000-000000000001', '25-2',  '25',  'MS · Nora+Kane',        '35mm',  'planned', '14:15', 'B', 7),
  ('a1b2c3d4-0000-0000-0000-000000000001', '27-1',  '27',  'CU · Maya',             '85mm',  'planned', '16:30', 'C', 8),
  ('a1b2c3d4-0000-0000-0000-000000000001', '27-2',  '27',  '2-shot',                '35mm',  'planned', '17:30', 'C', 9);

-- Activity
insert into activity (project_id, user_name, user_role, action, object, detail, kind, created_at) values
  ('a1b2c3d4-0000-0000-0000-000000000001', 'J. Nakamura', '1st AD',         'moved',      'Shot 24B-2',             'Time 11:45 → 11:15 (AI proposal accepted)', 'schedule', now() - interval '18 minutes'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'L. Ferrara',  'DP',             'changed lens on', '24A-3',             '35mm → 50mm',                               'creative', now() - interval '32 minutes'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'M. Reid',     'Cast · Det. Kane','updated ETA to','07:40',              'Traffic on Williamsburg Bridge',             'person',   now() - interval '45 minutes'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'AI',          'PROD Assistant', 'flagged',    'Tomorrow — Rooftop scene','Rain forecast 70% 14:00–18:00 · 2 plans drafted', 'ai', now() - interval '70 minutes'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'R. Okoye',    'Gaffer',         'marked ready','Lighting setup A',      'Pre-rigged 10 min ahead of call',            'lighting', now() - interval '86 minutes'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'K. Reyes',    'Script Super',   'locked',     'Pages 14–17',            'Version 6 · revisions highlighted',          'script',   now() - interval '108 minutes'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'AI',          'PROD Assistant', 'suggested',  'Scene grouping',         'Group 25 + 27 by light setup B → save ~40min','ai',      now() - interval '125 minutes'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'H. Park',     '2nd AD',         'checked in', '4 crew members',         'All departments report at base',             'person',   now() - interval '150 minutes');

-- AI Insights
insert into ai_insights (project_id, severity, title, why, saves, actions, kind) values
  ('a1b2c3d4-0000-0000-0000-000000000001', 'critical',
   'Rain tomorrow will block rooftop scene 31',
   '70% precip forecast 14:00–18:00. Scene 31 requires clear skies for continuity with 30.',
   'Avoid full day reshoot · ~$38K',
   '[{"label":"Swap to cover set (Nora''s apartment)"},{"label":"Rearrange to morning block"},{"label":"Hold as cover decision"}]',
   'plan'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'warn',
   'Schedule conflict: Marcus Reid double-booked Apr 19',
   'Scene 28 & voice session overlap 10:00–13:00.',
   'Prevent 3h stall',
   '[{"label":"Move voice session to Apr 20 AM"},{"label":"Flip scene order so 28 shoots after 14:00"}]',
   'cast'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'info',
   'Group scenes 25 + 27 by lighting setup B',
   'Both use hard top-light rig. Back-to-back saves one tear-down.',
   '~40 min · $2.1K',
   '[{"label":"Apply reorder"},{"label":"Notify Gaffer team"}]',
   'lighting'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'info',
   'Creative: try tighter lens on 24A-3',
   'Based on your visual references, 85mm compression would match scene 22''s framing.',
   'Creative continuity',
   '[{"label":"Generate reference frame"},{"label":"Add to DP notes"}]',
   'creative'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'info',
   'Mood board for scene 31 (rooftop) ready',
   '12 reference images assembled from project aesthetic — amber magic hour.',
   'Saves 1h prep',
   '[{"label":"Review board"},{"label":"Share with DP"}]',
   'creative'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'warn',
   'Overtime risk: day 14 projected 13.2 hrs',
   'Scene 30 is dense (5 pages, 4 cast). Current plan pushes wrap 20:40.',
   '~$6.5K OT + avoid meal penalty',
   '[{"label":"Split scene 30 across 2 days"},{"label":"Trim coverage"}]',
   'schedule');
