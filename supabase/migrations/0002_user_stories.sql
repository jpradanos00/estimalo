-- estímalo v1: User Stories
-- Group tasks under user stories for better organization

create table user_stories (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  title text not null,
  description text default '',
  created_at timestamptz not null default now()
);

-- Add user_story_id to tasks
alter table tasks add column user_story_id uuid references user_stories(id) on delete set null;

-- Index
create index idx_user_stories_session on user_stories(session_id);

-- GRANT
grant select, insert, update, delete on user_stories to anon, authenticated;
grant usage on all sequences in schema public to anon, authenticated;

-- RLS
alter table user_stories enable row level security;

create policy "Anyone can read user_stories"
  on user_stories for select
  using (true);

create policy "Anyone can insert user_stories"
  on user_stories for insert
  with check (true);

create policy "Anyone can update user_stories"
  on user_stories for update
  using (true);

create policy "Anyone can delete user_stories"
  on user_stories for delete
  using (true);

-- Realtime
alter publication supabase_realtime add table user_stories;
