ALTER TABLE votes ADD COLUMN weight DOUBLE PRECISION NOT NULL DEFAULT 1.0;

UPDATE votes v
SET weight = COALESCE(
  (SELECT p.weight FROM participants p WHERE p.id = v.participant_id),
  1.0
);

CREATE POLICY "Admin can update vote weight"
  ON votes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN sessions s ON s.id = t.session_id
      JOIN participants p ON p.id = s.admin_participant_id
      WHERE t.id = votes.task_id
        AND p.is_admin = true
    )
  );
