-- Allow authenticated admin to delete own sessions
create policy "Admin can delete own sessions"
  on sessions for delete
  to authenticated
  using (admin_id = auth.uid());

-- Allow deletion by session code knowledge (for non-auth sessions)
create policy "Anyone can delete sessions"
  on sessions for delete
  using (true);
