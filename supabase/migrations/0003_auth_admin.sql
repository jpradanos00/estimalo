-- estímalo v1: Admin Auth
-- Link sessions to authenticated users for cross-device history

alter table sessions add column admin_id uuid references auth.users(id) on delete set null;

grant select, insert, update, delete on sessions to authenticated;
grant select, insert, update, delete on participants to authenticated;
grant select, insert, update, delete on tasks to authenticated;
grant select, insert, update, delete on user_stories to authenticated;
grant select, insert, update, delete on votes to authenticated;

-- Drop old permissive RLS policies (they're wide open for anon)
-- We keep anon policies permissive (code-based access)
-- And add new policies for authenticated admin operations

-- Sessions: authenticated admin can read own sessions
create policy "Admin can read own sessions"
  on sessions for select
  to authenticated
  using (admin_id = auth.uid());

-- Sessions: authenticated admin can create sessions linked to themselves
create policy "Admin can create own sessions"
  on sessions for insert
  to authenticated
  with check (admin_id = auth.uid());

-- Sessions: authenticated admin can update own sessions
create policy "Admin can update own sessions"
  on sessions for update
  to authenticated
  using (admin_id = auth.uid());

-- Tasks: authenticated admin can manage tasks in own sessions
create policy "Auth admin can read own tasks"
  on tasks for select
  to authenticated
  using (
    exists (
      select 1 from sessions s
      where s.id = tasks.session_id and s.admin_id = auth.uid()
    )
  );

-- User stories: authenticated admin can manage stories in own sessions
create policy "Auth admin can read own stories"
  on user_stories for select
  to authenticated
  using (
    exists (
      select 1 from sessions s
      where s.id = user_stories.session_id and s.admin_id = auth.uid()
    )
  );
