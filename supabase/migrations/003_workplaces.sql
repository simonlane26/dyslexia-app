-- Workplace licence management tables
-- Run in Supabase SQL editor (EU region)

create table if not exists workplaces (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  plan          text not null default 'workplace_starter', -- workplace_starter | workplace_business | workplace_enterprise
  max_users     int  not null default 5,
  admin_clerk_id text not null,
  invite_code   text unique not null default upper(substr(md5(random()::text), 1, 8)),
  created_at    timestamptz not null default now()
);

create table if not exists workplace_members (
  id              uuid primary key default gen_random_uuid(),
  workplace_id    uuid not null references workplaces(id) on delete cascade,
  clerk_user_id   text,                          -- null until user accepts invite
  email           text not null,
  display_name    text,
  role            text not null default 'member', -- 'admin' | 'member'
  is_active       boolean not null default true,
  invited_at      timestamptz not null default now(),
  joined_at       timestamptz,                   -- set when user first signs in and is linked
  simplifications_used int not null default 0,
  rewrites_used        int not null default 0,
  last_active          timestamptz,
  unique(workplace_id, email)
);

-- Row level security (service role bypasses automatically)
alter table workplaces        enable row level security;
alter table workplace_members enable row level security;

-- Indexes
create index if not exists workplace_members_workplace_id_idx on workplace_members(workplace_id);
create index if not exists workplace_members_clerk_user_id_idx on workplace_members(clerk_user_id);
create index if not exists workplace_members_email_idx on workplace_members(email);
