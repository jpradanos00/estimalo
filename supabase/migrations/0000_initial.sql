-- estímalo: Planning Poker Ponderado
-- Initial schema migration

create extension if not exists "pgcrypto";

-- Sessions (rooms)
create table sessions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  admin_participant_id uuid,
  name text,
  status text not null default 'lobby' check (status in ('lobby', 'voting', 'revealed', 'finished')),
  current_task_id uuid,
  created_at timestamptz not null default now()
);

-- Participants in a session
create table participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  name text not null,
  weight float not null default 1.0 check (weight >= 0.1 and weight <= 10.0),
  is_admin boolean not null default false,
  joined_at timestamptz not null default now()
);

-- Tasks to estimate
create table tasks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  title text not null,
  description text default '',
  status text not null default 'pending' check (status in ('pending', 'active', 'completed')),
  final_estimate float,
  created_at timestamptz not null default now()
);

-- Individual votes
create table votes (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  value float not null,
  created_at timestamptz not null default now(),
  unique(task_id, participant_id)
);

-- Indexes
create index idx_participants_session on participants(session_id);
create index idx_tasks_session on tasks(session_id);
create index idx_votes_task on votes(task_id);
create index idx_sessions_code on sessions(code);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table sessions enable row level security;
alter table participants enable row level security;
alter table tasks enable row level security;
alter table votes enable row level security;

-- Sessions: anyone who knows the code can read
create policy "Anyone can read sessions by code"
  on sessions for select
  using (true);

-- Sessions: creator can update (admin via participant check)
create policy "Admin can update session"
  on sessions for update
  using (
    exists (
      select 1 from participants
      where participants.id = admin_participant_id
        and participants.is_admin = true
    )
  );

-- Sessions: anyone can insert (create room)
create policy "Anyone can create sessions"
  on sessions for insert
  with check (true);

-- Participants: anyone can read
create policy "Anyone can read participants"
  on participants for select
  using (true);

-- Participants: anyone can insert (join)
create policy "Anyone can join session"
  on participants for insert
  with check (true);

-- Participants: admin can update (for weight changes)
create policy "Admin can update participants"
  on participants for update
  using (
    exists (
      select 1 from participants p2
      join sessions s on s.id = participants.session_id
      where p2.id = s.admin_participant_id
        and p2.is_admin = true
    )
  );

-- Tasks: anyone in session can read
create policy "Anyone can read tasks"
  on tasks for select
  using (true);

-- Tasks: admin can insert/update
create policy "Admin can manage tasks"
  on tasks for insert
  with check (
    exists (
      select 1 from participants p
      join sessions s on s.id = tasks.session_id
      where p.id = s.admin_participant_id
        and p.is_admin = true
    )
  );

create policy "Admin can update tasks"
  on tasks for update
  using (
    exists (
      select 1 from participants p
      join sessions s on s.id = tasks.session_id
      where p.id = s.admin_participant_id
        and p.is_admin = true
    )
  );

create policy "Admin can delete tasks"
  on tasks for delete
  using (
    exists (
      select 1 from participants p
      join sessions s on s.id = tasks.session_id
      where p.id = s.admin_participant_id
        and p.is_admin = true
    )
  );

-- Votes: anyone can read
create policy "Anyone can read votes"
  on votes for select
  using (true);

-- Votes: participant can insert/update their own vote
create policy "Participants can vote"
  on votes for insert
  with check (
    exists (
      select 1 from participants p
      where p.id = participant_id
    )
  );

create policy "Participants can update own vote"
  on votes for update
  using (
    exists (
      select 1 from participants p
      where p.id = participant_id
    )
  );

-- ============================================================
-- Realtime publication
-- ============================================================

begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

alter publication supabase_realtime add table sessions;
alter publication supabase_realtime add table participants;
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table votes;
