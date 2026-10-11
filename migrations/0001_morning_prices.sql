-- Apply only to the explicitly selected morning-price D1 database after release/access approval.
CREATE TABLE IF NOT EXISTS morning_price_runs (
  source_id TEXT NOT NULL,
  local_date TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('running', 'succeeded', 'partial', 'failed')),
  lease_token TEXT NOT NULL,
  lease_until TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  attempts INTEGER NOT NULL DEFAULT 1 CHECK (attempts BETWEEN 1 AND 3),
  accepted_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  error_code TEXT,
  PRIMARY KEY (source_id, local_date)
);

CREATE TABLE IF NOT EXISTS morning_price_observations (
  observation_id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  local_date TEXT NOT NULL,
  product_id TEXT NOT NULL,
  retailer_sku TEXT NOT NULL,
  region TEXT NOT NULL CHECK (region IN ('CA', 'US')),
  currency TEXT NOT NULL CHECK (currency IN ('CAD', 'USD')),
  checked_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  retained_until TEXT NOT NULL,
  observation_json TEXT NOT NULL,
  CHECK ((region = 'CA' AND currency = 'CAD') OR (region = 'US' AND currency = 'USD')),
  CHECK (expires_at > checked_at AND retained_until >= expires_at)
);
CREATE INDEX IF NOT EXISTS morning_prices_latest
  ON morning_price_observations (region, product_id, source_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS morning_prices_retention
  ON morning_price_observations (retained_until);

CREATE TABLE IF NOT EXISTS morning_price_source_health (
  source_id TEXT PRIMARY KEY,
  state TEXT NOT NULL CHECK (state IN ('running', 'healthy', 'partial', 'failed')),
  last_attempt_at TEXT NOT NULL,
  last_successful_at TEXT,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  backoff_until TEXT,
  accepted_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  error_code TEXT
);
