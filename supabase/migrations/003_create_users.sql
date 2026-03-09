-- Users table: synced from Firebase on login.
-- id = Firebase UID (text)
-- organizer: "admin" => can edit all events; "welb" => only welb events; "" => no event admin
-- role: "admin" => access admin spot/shop/digital; "" => no access
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  gmail TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  organizer TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
