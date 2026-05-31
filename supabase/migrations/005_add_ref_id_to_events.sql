-- Add ref_id to support soft updates on events.
-- When an event is soft-updated:
--   old row: id = old_id, is_verified = true, is_active = true, ref_id = null
--   new row: id = new_id, is_verified = false, is_active = true, ref_id = old_id
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS ref_id UUID NULL REFERENCES events(id);
