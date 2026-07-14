alter table participants add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists idx_participants_user_id on participants(user_id);
