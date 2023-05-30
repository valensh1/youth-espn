CREATE TABLE games.wins (
    full_team_long TEXT,
    team_id_fk uuid
);

DELETE  FROM games.wins ;
DROP TABLE games.wins;


-- Trigger to look up team_id every time a team name is entered
INSERT INTO games.wins (full_team_long)
VALUES('Jr. Gulls'),
('California Heat');

CREATE OR REPLACE FUNCTION fn_insert_test()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update the team_id_fk in the same row of games.wins based on the provided full_team_long
   UPDATE games.wins AS w
SET team_id_fk = t.id
FROM teams.teams AS t
WHERE w.full_team_long = t.team_name_full AND t.team_level = 'A';


    RETURN NEW;
END;
$$;

-- Create the trigger that updates the team_id_fk in games.wins
CREATE OR REPLACE TRIGGER trigger_insert_testing
AFTER INSERT ON games.wins
FOR EACH ROW
EXECUTE FUNCTION fn_insert_test();






DROP TRIGGER IF EXISTS trigger_insert_team_records ON games.games;

ALTER games.team_records 
SET losing_team_points = 1
WHERE game_id_fk = '55c95a68-6c11-4baa-bdee-b51d4cbd982f';

CREATE TABLE games.team_records (
game_id_fk uuid REFERENCES games.games(id),
sport TEXT NOT NULL,
season TEXT NOT NULL,
game_date DATE NOT NULL,
division TEXT NOT NULL,
team_level TEXT NOT NULL,
winning_team_long TEXT NOT NULL,
winning_team_short TEXT NOT NULL,
winning_team_id_fk uuid NOT NULL,
overtime BOOLEAN NOT NULL DEFAULT FALSE,
winning_team_points INTEGER DEFAULT 2,
losing_team_long TEXT NOT NULL,
losing_team_short TEXT NOT NULL,
losing_team_id_fk uuid NOT NULL,
losing_team_points INTEGER NOT NULL GENERATED ALWAYS AS (
(CASE
	WHEN regulation_win = FALSE THEN 1
	ELSE 0
END),
tie BOOLEAN NOT NULL
) STORED
);


-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION fn_insert_team_records()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

    -- 2. Insert a new record into games.team_records
    INSERT INTO games.team_records  (game_id_fk, sport, season, game_date, division, team_level, winning_team_long, winning_team_short, winning_team_id_fk, overtime, losing_team_long, losing_team_short, losing_team_id_fk, losing_team_points)
    VALUES (NEW.id, NEW.sport, NEW.season, NEW.game_date, NEW.division, NEW.team_level, 
   -- winning_team_long
    CASE
	   WHEN NEW.home_team_score > NEW.visitor_team_score THEN NEW.home_team_long
	   WHEN NEW.visitor_team_score > NEW.home_team_score THEN NEW.visitor_team_long
	    ELSE NULL
	END,
	--winning_team_short
	  CASE
	   WHEN NEW.home_team_score > NEW.visitor_team_score THEN NEW.home_team_short
	   WHEN NEW.visitor_team_score > NEW.home_team_score THEN NEW.visitor_team_short
	    ELSE NULL
	END,
	--winning_team_id_fk
	  CASE
	   WHEN NEW.home_team_score > NEW.visitor_team_score THEN NEW.home_team_id_fk
	   WHEN NEW.visitor_team_score > NEW.home_team_score THEN NEW.visitor_team_id_fk
	   ELSE NULL
	END,
	   CASE
	   WHEN NEW.overtime = FALSE THEN FALSE
	END,
	-- losing_team_long
    CASE
	   WHEN NEW.home_team_score > NEW.visitor_team_score THEN NEW.visitor_team_long
	   WHEN NEW.visitor_team_score > NEW.home_team_score THEN NEW.home_team_long
	   ELSE NULL
	END,
	--winning_team_short
	  CASE
	   WHEN NEW.home_team_score > NEW.visitor_team_score THEN NEW.visitor_team_short
	   WHEN NEW.visitor_team_score > NEW.home_team_score THEN NEW.home_team_short
	   ELSE NULL
	   
	END,
	--winning_team_id_fk
	  CASE
	   WHEN NEW.home_team_score > NEW.visitor_team_score THEN NEW.visitor_team_id_fk
	   WHEN NEW.visitor_team_score > NEW.home_team_score THEN NEW.home_team_id_fk
	   ELSE NULL
	   
	END,
	--losing_team_points
	  CASE
	  WHEN NEW.overtime = FALSE THEN 0
	  ELSE 1
	END ,
	  CASE
	  WHEN NEW.tie = TRUE THEN 0
	  ELSE 2
	END ,
	--tie
	NEW.tie
    );

    RETURN NEW;
END;
$$;

-- Create the trigger that adds data to games.team_records based on each INSERT into the games.games table
CREATE OR REPLACE TRIGGER trigger_insert_team_records
AFTER INSERT ON games.games
FOR EACH ROW
EXECUTE FUNCTION fn_insert_team_records();








-- Insert into games.games table
INSERT INTO games.games (
    id, sport, season, game_date, game_time, venue, venue_id_fk, division, team_level,
    home_team_long, home_team_short, home_team_id_fk, home_team_score,
    visitor_team_long, visitor_team_short, visitor_team_id_fk, visitor_team_score
)
VALUES (
    uuid_generate_v4(), 'Hockey'::text, '2021-2022', '3-06-2022', '6:40pm', 'The Rinks - Lakewood Ice',
    '42af78e0-dff4-4d52-896a-95e2dfd64674', 'Peewee', 'A', 'Jr. Kings(2)', 'Kings',
    '57842479-9f7d-44d0-8249-4f284ab0a116', 1, 'California Goldrush Hockey Club', 'Goldrush',
    '9464ba71-4f0d-4438-a9a6-f656a1278089', 3
),
(
    uuid_generate_v4(), 'Hockey'::text, '2021-2022', '2-27-2022', '9:40am', 'Great Park Ice & Fivepoint Arena',
    '8733c8ff-8a71-4c0b-80ee-9237cbbd9e5e', 'Peewee', 'A', 'Jr. Ducks(3)', 'Ducks',
    '2c37ea5a-e77a-4cc8-8db1-b70540189901', 0, 'California Goldrush Hockey Club', 'Goldrush',
    '9464ba71-4f0d-4438-a9a6-f656a1278089', 5
),
(
    uuid_generate_v4(), 'Hockey'::text, '2021-2022', '3-06-2022', '9:50am', 'The Rinks - KHS Ice',
    '4ce3bf3b-752d-42d0-a1fa-870579ac4673', 'Peewee', 'A', 'Jr. Ice Dogs', 'Ice Dogs',
    '3e0aa7c8-f09f-4acd-ba35-948803f4da3f', 9, 'California Goldrush Hockey Club', 'Goldrush',
    '9464ba71-4f0d-4438-a9a6-f656a1278089', 1
);

SELECT *
FROM games.games;



--Standings Query
SELECT winning_team_long, winning_team_points, sum(winning_team_points) AS total_points
FROM games.team_records
GROUP BY winning_team_long, winning_team_points
ORDER BY winning_team_points;

-- Query only Ducks Schedule
FROM games.games 
WHERE home_team_long = 'Jr. Ducks(2)'
OR visitor_team_long = 'Jr. Ducks(2)'
GROUP BY games.id
ORDER BY game_date;


ALTER TABLE games.games 
ADD COLUMN winning_team_points INTEGER GENERATED ALWAYS AS (
CASE 
	WHEN home_team_score = visitor_team_score THEN 1
	ELSE 2
END
) STORED,
ADD COLUMN losing_team_long TEXT GENERATED ALWAYS AS (
CASE 
	WHEN home_team_score > visitor_team_score THEN visitor_team_long
	WHEN home_team_score < visitor_team_score THEN home_team_long
	ELSE NULL
END
) STORED,
ADD COLUMN losing_team_short TEXT GENERATED ALWAYS AS (
CASE 
	WHEN home_team_score > visitor_team_score THEN visitor_team_short
	WHEN home_team_score < visitor_team_score THEN home_team_short
	ELSE NULL
END
) STORED,
ADD COLUMN losing_team_id_fk TEXT GENERATED ALWAYS AS (
CASE 
	WHEN home_team_score > visitor_team_score THEN visitor_team_id_fk
	WHEN home_team_score < visitor_team_score THEN home_team_id_fk
	ELSE NULL
END
) STORED,
ADD COLUMN losing_team_points INTEGER GENERATED ALWAYS AS (
CASE 
	WHEN home_team_score = visitor_team_score THEN 1
	ELSE 0
END
) STORED;

SELECT *
FROM games.games;




-- Standings Query (Total Points)
SELECT team_long, SUM(points) AS total_points
FROM (
    SELECT winning_team_long AS team_long, SUM(winning_team_points) AS points
    FROM games.games
    GROUP BY winning_team_long

    UNION ALL
    
    SELECT losing_team_long AS team_long, sum(losing_team_points) AS points
    FROM games.games 
    GROUP BY losing_team_long
    
    UNION ALL

    SELECT home_team_long AS team_long, 1 AS points
    FROM games.games
    WHERE tie = TRUE

    UNION ALL

    SELECT visitor_team_long AS team_long, 1 AS points
    FROM games.games
    WHERE tie = TRUE
) subquery
WHERE team_long IS NOT NULL
GROUP BY team_long
ORDER BY total_points DESC;





-- Team wins and losses
SELECT teams.team_name, teams.total_wins, COALESCE(losses.total_losses, 0) AS total_losses
FROM (
    SELECT winning_team_long AS team_name, COUNT(winning_team_points) AS total_wins
    FROM games.games
    GROUP BY winning_team_long
) teams
LEFT JOIN (
    SELECT losing_team_long AS team_name, COUNT(losing_team_points) AS total_losses
    FROM games.games
    GROUP BY losing_team_long
) losses ON teams.team_name = losses.team_name
ORDER BY teams.total_wins DESC;


--Total Ties Count
SELECT team, sum(total_ties)
FROM(
SELECT home_team_long AS team, count(*) AS total_ties
FROM games.games
WHERE tie = TRUE
GROUP BY team

UNION ALL 

SELECT visitor_team_long AS team, count(*) AS total_ties
FROM games.games 
WHERE tie = TRUE
GROUP BY team
) queryTable
GROUP BY team;


-- Teams wins losses and ties
SELECT teams.team_name, teams.total_wins, COALESCE(losses.total_losses, 0) AS total_losses, COALESCE(ties.total_ties, 0) AS total_ties
FROM (
    SELECT winning_team_long AS team_name, COUNT(winning_team_points) AS total_wins
    FROM games.games
    GROUP BY winning_team_long
) teams
LEFT JOIN (
    SELECT losing_team_long AS team_name, COUNT(losing_team_points) AS total_losses
    FROM games.games
    GROUP BY losing_team_long
) losses ON teams.team_name = losses.team_name
LEFT JOIN (
    SELECT team AS team_name, COUNT(total_ties) AS total_ties
    FROM (
        SELECT home_team_long AS team, COUNT(1) AS total_ties
        FROM games.games
        WHERE tie = TRUE
        GROUP BY home_team_long

        UNION ALL 

        SELECT visitor_team_long AS team, COUNT(1) AS total_ties
        FROM games.games 
        WHERE tie = TRUE
        GROUP BY visitor_team_long
    ) queryTable
    GROUP BY team
) ties ON teams.team_name = ties.team_name
WHERE teams.team_name IS NOT NULL 
ORDER BY teams.total_wins DESC;


-- Total number of games per team
SELECT team, sum(games_played) AS games_played 
FROM (
SELECT 
CASE 
	WHEN winning_team_long IS NOT NULL THEN winning_team_long
	ELSE home_team_long
END AS team ,
COUNT(*) AS games_played
FROM games.games
GROUP BY team



UNION ALL

SELECT 
CASE 
	WHEN losing_team_long IS NOT NULL THEN losing_team_long
	ELSE visitor_team_long
END AS team , 
COUNT (*) AS games_played
FROM games.games
GROUP BY team
) AS games_played

GROUP BY team
ORDER BY games_played DESC;


-- Teams games_played (GP), wins, losses, ties and points
SELECT teams.team_name, games_played, teams.total_wins, COALESCE(losses.total_losses, 0) AS total_losses, COALESCE(ties.total_ties, 0) AS total_ties, COALESCE (points.total_points, 0) AS total_points
FROM (
    SELECT winning_team_long AS team_name, COUNT(winning_team_points) AS total_wins
    FROM games.games
    GROUP BY winning_team_long
) teams
LEFT JOIN (
    SELECT losing_team_long AS team_name, COUNT(losing_team_points) AS total_losses
    FROM games.games
    GROUP BY losing_team_long
) losses ON teams.team_name = losses.team_name
LEFT JOIN (
    SELECT team AS team_name, sum(total_ties) AS total_ties
    FROM (
        SELECT home_team_long AS team, COUNT(*) AS total_ties
        FROM games.games
        WHERE tie = TRUE
        GROUP BY home_team_long

        UNION ALL 

        SELECT visitor_team_long AS team, COUNT(*) AS total_ties
        FROM games.games 
        WHERE tie = TRUE
        GROUP BY visitor_team_long
    ) queryTable
    GROUP BY team
) ties ON teams.team_name = ties.team_name
LEFT JOIN (
SELECT team_long, SUM(points) AS total_points
FROM (
    SELECT winning_team_long AS team_long, SUM(winning_team_points) AS points
    FROM games.games
    GROUP BY winning_team_long

    UNION ALL
    
    SELECT losing_team_long AS team_long, sum(losing_team_points) AS points
    FROM games.games 
    GROUP BY losing_team_long
    
    UNION ALL

    SELECT home_team_long AS team_long, 1 AS points
    FROM games.games
    WHERE tie = TRUE

    UNION ALL

    SELECT visitor_team_long AS team_long, 1 AS points
    FROM games.games
    WHERE tie = TRUE
) subquery
WHERE team_long IS NOT NULL
GROUP BY team_long
ORDER BY total_points DESC
) points
ON points.team_long = teams.team_name
LEFT JOIN (
SELECT team, sum(games_played) AS games_played 
FROM (
SELECT 
CASE 
	WHEN winning_team_long IS NOT NULL THEN winning_team_long
	ELSE home_team_long
END AS team ,
COUNT(*) AS games_played
FROM games.games
GROUP BY team

UNION ALL

SELECT 
CASE 
	WHEN losing_team_long IS NOT NULL THEN losing_team_long
	ELSE visitor_team_long
END AS team , 
COUNT (*) AS games_played
FROM games.games
GROUP BY team
) AS gp

GROUP BY team
ORDER BY games_played DESC
) games_played ON games_played.team = teams.team_name
WHERE teams.team_name IS NOT NULL 
ORDER BY total_points DESC;



-- Goals Against Query
SELECT
	team,
	sum("GA") AS "GA"
FROM
	(
	SELECT
		home_team_long AS team,
		sum(visitor_team_score) AS "GA"
	FROM
		games.games
    GROUP BY 
    	team
UNION ALL
	SELECT
		visitor_team_long AS team,
		sum(home_team_score) AS "GA"
FROM
		games.games
GROUP BY
	team
	
) goals_against
GROUP BY team
ORDER BY "GA" DESC;


-- Goals For Query
SELECT
	team,
	sum("GF") AS "GF"
FROM
	(
	SELECT
		home_team_long AS team,
		sum(home_team_score) AS "GF"
	FROM
		games.games
	GROUP BY
		team
UNION ALL
	SELECT
		visitor_team_long AS team,
		sum(visitor_team_score) AS "GF"
	FROM
		games.games
	GROUP BY
		team	
) goals_for
GROUP BY
	team
ORDER BY
	"GF" DESC;



-- Goal Differential Query
SELECT gf.team, "GF", "GA", "GF" - "GA" AS "GD"
FROM (

-- Goals For Query
SELECT
	team,
	sum("GF") AS "GF"
FROM
	(
	SELECT
		home_team_long AS team,
		sum(home_team_score) AS "GF"
	FROM
		games.games
	GROUP BY
		team
UNION ALL
	SELECT
		visitor_team_long AS team,
		sum(visitor_team_score) AS "GF"
	FROM
		games.games
	GROUP BY
		team	
) goals_for
GROUP BY
	team
) gf

JOIN (

-- Goals Against Query
SELECT
	team,
	sum("GA") AS "GA"
FROM
	(
	SELECT
		home_team_long AS team,
		sum(visitor_team_score) AS "GA"
	FROM
		games.games
    GROUP BY 
    	team
UNION ALL
	SELECT
		visitor_team_long AS team,
		sum(home_team_score) AS "GA"
FROM
		games.games
GROUP BY
	team
	
) goals_against
GROUP BY team
) ga ON ga.team = gf.team
GROUP BY gf.team, "GF", "GA", "GD"
ORDER BY "GD";




-- Query to see all games for one particular team
WITH team_cte AS (
  SELECT 'San Diego Saints' AS team
)
SELECT *
FROM games.games
WHERE winning_team_long = (SELECT team FROM team_cte)
   OR losing_team_long = (SELECT team FROM team_cte)
   OR (tie = TRUE AND home_team_long = (SELECT team FROM team_cte))
   OR (tie = TRUE AND visitor_team_long = (SELECT team FROM team_cte));


  SELECT * FROM games.games;

ALTER TABLE games.games
ALTER COLUMN game_type SET NOT NULL;

CREATE SCHEMA leagues;
CREATE TABLE leagues.leagues (
id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
sport TEXT NOT NULL,
age_group TEXT NOT NULL,
age_starting INTEGER NOT NULL,
age_ending INTEGER NOT NULL,
league_level TEXT NOT NULL
);
INSERT INTO leagues.leagues(sport, age_group, age_starting, age_ending, league_level)
VALUES('Hockey', '6U', 5, 6, 'Mini Mite'),
('Hockey', '8U', 7, 8, 'Mite'),
('Hockey', '10U', 9, 10, 'Squirt'),
('Hockey', '12U', 11, 12, 'Peewee'),
('Hockey', '14U', 13, 14, 'Bantam'),
('Hockey', '16U', 15, 16, 'Minor Midget'),
('Hockey', '18U', 17, 18, 'Major Midget');

SELECT *
FROM leagues.leagues
WHERE sport ILIKE 'hockey';

