-- Story reading profiles (one per user, stores their reading level)
create table if not exists story_reading_profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  reading_level int not null default 2 check (reading_level between 1 and 5),
  character_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Story series (a named continuing adventure)
create table if not exists story_series (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  title text not null,
  theme text not null,
  character_name text not null,
  setting text,
  reading_level int not null default 2,
  current_episode int not null default 1,
  is_complete boolean not null default false,
  created_at timestamptz default now(),
  last_read_at timestamptz default now()
);

create index if not exists idx_story_series_user
  on story_series(clerk_user_id, last_read_at desc);

-- Individual episodes within a series
create table if not exists story_episodes (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references story_series(id) on delete cascade,
  episode_number int not null,
  text text not null,
  recap text,
  next_teaser text,
  word_count int not null default 0,
  new_vocabulary text[] default '{}',
  last_word_index int,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique(series_id, episode_number)
);

create index if not exists idx_story_episodes_series
  on story_episodes(series_id, episode_number);
