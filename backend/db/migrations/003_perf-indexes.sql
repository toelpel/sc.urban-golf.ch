-- Performance indexes for frequent JOIN/EXISTS queries
-- - game_players(player_id): used by /games search EXISTS subquery
-- - scores(player_id): used by /games/summary aggregation joins

CREATE INDEX IF NOT EXISTS idx_game_players_player_id
  ON public.game_players USING btree (player_id);

CREATE INDEX IF NOT EXISTS idx_scores_player_id
  ON public.scores USING btree (player_id);
