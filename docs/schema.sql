-- PostgreSQL schema; application lazy-initialization creates the same schema.
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  token TEXT NOT NULL,
  request_id TEXT NOT NULL UNIQUE,
  payload TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  expires BIGINT NOT NULL
);
-- Configure a retention/cleanup job before production use, according to your policy.
