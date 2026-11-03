-- ============================================================
-- TripAI - Supabase Database Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─── Trips ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trips (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  destination   TEXT NOT NULL,
  start_date    TEXT,
  end_date      TEXT,
  created_by    TEXT,
  budget        JSONB,
  preferences   JSONB,
  itinerary     JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Expenses ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id            TEXT PRIMARY KEY,
  trip_id       TEXT REFERENCES trips(id) ON DELETE CASCADE,
  amount        NUMERIC(10, 2) NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('transportation','accommodation','food','activities','miscellaneous')),
  description   TEXT NOT NULL,
  date          TEXT NOT NULL,
  location      TEXT,
  receipt_url   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Collaboration Sessions ───────────────────────────────────
CREATE TABLE IF NOT EXISTS collaboration_sessions (
  id            TEXT PRIMARY KEY,
  trip_id       TEXT REFERENCES trips(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  created_by    TEXT NOT NULL,
  participants  JSONB DEFAULT '[]',
  votes         JSONB DEFAULT '[]',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Preferences ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS preferences (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL UNIQUE,
  travel_style  TEXT,
  dietary       JSONB DEFAULT '[]',
  interests     JSONB DEFAULT '[]',
  pace          TEXT,
  budget_range  TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_collab_trip_id   ON collaboration_sessions(trip_id);
CREATE INDEX IF NOT EXISTS idx_preferences_user ON preferences(user_id);

-- ─── Row Level Security (optional but recommended) ────────────
-- Enable RLS (uncomment when you add Auth):
-- ALTER TABLE trips                  ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE expenses               ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE preferences            ENABLE ROW LEVEL SECURITY;

-- ─── Realtime (for collaborative planning) ────────────────────
-- Enable Realtime for collaboration_sessions in the Supabase dashboard:
-- Database → Replication → select "collaboration_sessions"
