-- estímalo v1: Grant table access to anon role
-- Without these GRANTs, PostgREST returns 501 for all operations

GRANT SELECT, INSERT, UPDATE, DELETE ON sessions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON participants TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON votes TO anon, authenticated;

-- Ensure sequence access for auto-generated IDs
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
