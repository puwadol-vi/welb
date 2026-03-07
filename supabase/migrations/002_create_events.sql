-- Create events table (matches Event type)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title VARCHAR(500) NOT NULL,
  description TEXT NULL,
  spot_id INTEGER NULL REFERENCES spots(id),
  type VARCHAR(50) NOT NULL DEFAULT 'meetup',

  price NUMERIC(12, 2) NULL,
  currency VARCHAR(10) NULL,

  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NULL,

  location VARCHAR(500) NOT NULL DEFAULT '',
  organizer_name VARCHAR(255) NOT NULL DEFAULT '',
  image_url TEXT NULL,
  event_url TEXT NULL,
  registration_url TEXT NULL,
  participant_count INTEGER NULL,

  is_welb_project BOOLEAN NOT NULL DEFAULT false,
  is_market BOOLEAN NOT NULL DEFAULT false,

  -- Metadata
  is_suggested BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


DROP TRIGGER IF EXISTS events_updated_at ON events;
CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
