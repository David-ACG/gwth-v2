-- ============================================================================
-- Benchmark Results DDL — Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zdhnwxknovzdnxgvwykt/sql/new
-- ============================================================================

-- ─── 1. BENCHMARK RUNS ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS benchmark_runs (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    run_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    articles_sampled INTEGER NOT NULL DEFAULT 0,
    providers_tested INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_benchmark_runs_date ON benchmark_runs(run_at DESC);

ALTER TABLE benchmark_runs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Service role manages benchmark runs"
        ON benchmark_runs FOR ALL
        USING (true)
        WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 2. BENCHMARK RESULTS (per article per provider) ───────────────────────

CREATE TABLE IF NOT EXISTS benchmark_results (
    id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    run_id                  UUID NOT NULL REFERENCES benchmark_runs(id) ON DELETE CASCADE,
    article_title           TEXT NOT NULL,
    article_url             TEXT NOT NULL,
    provider_id             TEXT NOT NULL,
    provider_name           TEXT NOT NULL,
    model                   TEXT NOT NULL,
    latency_ms              REAL NOT NULL DEFAULT 0,
    success                 BOOLEAN NOT NULL DEFAULT FALSE,
    error                   TEXT DEFAULT '',
    json_valid              BOOLEAN DEFAULT FALSE,
    fields_complete         BOOLEAN DEFAULT FALSE,
    importance_score        INTEGER,
    category                TEXT DEFAULT '',
    title_rewritten         TEXT DEFAULT '',
    excerpt                 TEXT DEFAULT '',
    content_length          INTEGER DEFAULT 0,
    estimated_input_tokens  INTEGER DEFAULT 0,
    estimated_output_tokens INTEGER DEFAULT 0,
    estimated_cost_usd      REAL DEFAULT 0,
    created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_benchmark_results_run ON benchmark_results(run_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_results_provider ON benchmark_results(provider_id);

ALTER TABLE benchmark_results ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Service role manages benchmark results"
        ON benchmark_results FOR ALL
        USING (true)
        WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 3. PUBLIC READ ACCESS (for apicompare.net) ────────────────────────────

DO $$ BEGIN
    CREATE POLICY "Public can read benchmark runs"
        ON benchmark_runs FOR SELECT
        USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Public can read benchmark results"
        ON benchmark_results FOR SELECT
        USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
