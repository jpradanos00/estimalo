-- Allow participants to delete their own vote (deselect)
CREATE POLICY "Participants can delete own vote"
  ON votes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.id = participant_id
    )
  );

-- Allow admin to delete any vote in their session (re-vote)
CREATE POLICY "Admin can delete votes"
  ON votes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN sessions s ON s.id = t.session_id
      JOIN participants p ON p.id = s.admin_participant_id
      WHERE t.id = votes.task_id
        AND p.is_admin = true
    )
  );
