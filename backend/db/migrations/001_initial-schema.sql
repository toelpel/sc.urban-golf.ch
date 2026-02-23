-- Initial baseline migration
-- This represents the schema as it existed before migrations were introduced.
-- It is safe to run on an empty database; existing tables will not be altered.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Tables
CREATE TABLE IF NOT EXISTS public.games (
    id text PRIMARY KEY,
    name text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.players (
    id text PRIMARY KEY,
    name text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.scores (
    id bigserial PRIMARY KEY,
    game_id text,
    player_id text,
    hole integer NOT NULL,
    strokes integer NOT NULL,
    CONSTRAINT scores_game_player_hole_key UNIQUE (game_id, player_id, hole)
);

CREATE TABLE IF NOT EXISTS public.game_players (
    id bigserial PRIMARY KEY,
    game_id text NOT NULL,
    player_id text NOT NULL,
    CONSTRAINT game_players_game_id_player_id_key UNIQUE (game_id, player_id)
);

CREATE TABLE IF NOT EXISTS public.feedback (
    id serial PRIMARY KEY,
    rating integer NOT NULL,
    message text NOT NULL,
    name character varying(100),
    email character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT feedback_rating_check CHECK (rating >= 1 AND rating <= 5)
);

-- Foreign keys (idempotent via DO blocks)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_game_players_game') THEN
    ALTER TABLE public.game_players ADD CONSTRAINT fk_game_players_game
      FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_game_players_player') THEN
    ALTER TABLE public.game_players ADD CONSTRAINT fk_game_players_player
      FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_scores_game') THEN
    ALTER TABLE public.scores ADD CONSTRAINT fk_scores_game
      FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_scores_player') THEN
    ALTER TABLE public.scores ADD CONSTRAINT fk_scores_player
      FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_games_name ON public.games USING btree (name);
CREATE INDEX IF NOT EXISTS idx_players_name ON public.players USING btree (name);
CREATE INDEX IF NOT EXISTS gin_games_name_trgm ON public.games USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS gin_players_name_trgm ON public.players USING gin (name gin_trgm_ops);
