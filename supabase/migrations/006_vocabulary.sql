-- User vocabulary & spaced repetition (SM-2 algorithm)
-- Run in Supabase SQL editor (EU region)

create table if not exists user_vocabulary (
  id                uuid primary key default gen_random_uuid(),
  user_id           text not null,
  word              text not null,          -- stored lowercase
  phonetic          text,
  syllables         text[],
  definition        text,
  example_sentence  text,
  source_context    text,                   -- sentence where word was first tapped
  source_type       text not null default 'story', -- 'story' | 'editor'
  school_id         text,                   -- from Clerk metadata at save time

  -- SM-2 spaced repetition fields
  review_count      int not null default 0,
  ease_factor       float not null default 2.5,
  interval_days     int not null default 1,
  next_review_at    timestamptz not null default now(),
  last_reviewed_at  timestamptz,

  -- Engagement
  times_seen        int not null default 1,
  times_correct     int not null default 0,

  created_at        timestamptz not null default now(),

  constraint user_vocabulary_unique unique (user_id, word)
);

create index if not exists user_vocabulary_user_idx   on user_vocabulary(user_id);
create index if not exists user_vocabulary_due_idx    on user_vocabulary(user_id, next_review_at);
create index if not exists user_vocabulary_school_idx on user_vocabulary(school_id) where school_id is not null;

-- Service role bypasses RLS automatically
alter table user_vocabulary enable row level security;
