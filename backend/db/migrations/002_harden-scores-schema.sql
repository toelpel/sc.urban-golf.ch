-- Add NOT NULL constraints, check constraints, index and timestamptz to scores and timestamps

-- scores.game_id: NOT NULL
ALTER TABLE public.scores ALTER COLUMN game_id SET NOT NULL;

-- scores.player_id: NOT NULL
ALTER TABLE public.scores ALTER COLUMN player_id SET NOT NULL;

-- Check constraints on scores (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_hole') THEN
    ALTER TABLE public.scores ADD CONSTRAINT chk_hole CHECK (hole >= 1 AND hole <= 18);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_strokes') THEN
    ALTER TABLE public.scores ADD CONSTRAINT chk_strokes CHECK (strokes >= -3 AND strokes <= 20);
  END IF;
END $$;

-- Index on scores(game_id) for faster JOINs in /summary
CREATE INDEX IF NOT EXISTS idx_scores_game_id ON public.scores USING btree (game_id);

-- Use timestamptz instead of timestamp for timezone-aware timestamps
ALTER TABLE public.games ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC';
ALTER TABLE public.feedback ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC';
