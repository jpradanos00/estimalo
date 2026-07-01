-- Allow admin/code-holders to delete participants
create policy "Anyone can delete participants"
  on participants for delete
  using (true);
