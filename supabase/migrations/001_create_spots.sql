-- Create spots table
CREATE TABLE IF NOT EXISTS spots (
  id SERIAL PRIMARY KEY,

  -- Basic info
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'shop',
  category VARCHAR(255) NOT NULL,
  region VARCHAR(255) NOT NULL,

  -- Location
  province VARCHAR(100) NOT NULL,
  province_th VARCHAR(255),
  district VARCHAR(255),
  district_th VARCHAR(255),
  address TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  google_map_link TEXT NOT NULL,

  -- Contact
  phone VARCHAR(20),
  facebook_link TEXT,
  website_link TEXT,

  -- Metadata
  is_suggested BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_local_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optional: auto-update updated_at on row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS spots_updated_at ON spots;
CREATE TRIGGER spots_updated_at
  BEFORE UPDATE ON spots
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Optional: enable RLS (Row Level Security) if you use Supabase auth
-- ALTER TABLE spots ENABLE ROW LEVEL SECURITY;
-- Then add policies as needed, e.g. allow anon read for is_active = true, service_role full access.
