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
    WHERE sport ILIKE 'Hockey'
    AND season = '2021-2022'
    AND team_level = 'A'
    AND division = 'Peewee'
    GROUP BY winning_team_long
) teams
LEFT JOIN (
    SELECT losing_team_long AS team_name, COUNT(losing_team_points) AS total_losses
    FROM games.games
    WHERE sport ILIKE 'Hockey'
    AND season = '2021-2022'
    AND team_level = 'A'
    AND division = 'Peewee'
    GROUP BY losing_team_long
) losses ON teams.team_name = losses.team_name
LEFT JOIN (
    SELECT team AS team_name, sum(total_ties) AS total_ties
    FROM (
        SELECT home_team_long AS team, COUNT(*) AS total_ties
        FROM games.games
        WHERE sport ILIKE 'Hockey'
    	AND season = '2021-2022'
    	AND team_level = 'A'
    	AND division = 'Peewee'
        AND tie = TRUE
        GROUP BY home_team_long

        UNION ALL 

        SELECT visitor_team_long AS team, COUNT(*) AS total_ties
        FROM games.games 
         WHERE sport ILIKE 'Hockey'
    	AND season = '2021-2022'
    	AND team_level = 'A'
    	AND division = 'Peewee'
        AND tie = TRUE
        GROUP BY visitor_team_long
    ) queryTable
    GROUP BY team
) ties ON teams.team_name = ties.team_name
LEFT JOIN (
SELECT team_long, SUM(points) AS total_points
FROM (
    SELECT winning_team_long AS team_long, SUM(winning_team_points) AS points
    FROM games.games
       WHERE sport ILIKE 'Hockey'
    	AND season = '2021-2022'
    	AND team_level = 'A'
    	AND division = 'Peewee'
    GROUP BY winning_team_long

    UNION ALL
    
    SELECT losing_team_long AS team_long, sum(losing_team_points) AS points
    FROM games.games
       WHERE sport ILIKE 'Hockey'
    	AND season = '2021-2022'
    	AND team_level = 'A'
    	AND division = 'Peewee'
    GROUP BY losing_team_long
    
    UNION ALL

    SELECT home_team_long AS team_long, 1 AS points
    FROM games.games
       WHERE sport ILIKE 'Hockey'
    	AND season = '2021-2022'
    	AND team_level = 'A'
    	AND division = 'Peewee'
    AND tie = TRUE

    UNION ALL

    SELECT visitor_team_long AS team_long, 1 AS points
    FROM games.games
       WHERE sport ILIKE 'Hockey'
    	AND season = '2021-2022'
    	AND team_level = 'A'
    	AND division = 'Peewee'
    AND tie = TRUE
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


-- THIS QUERY IS GOOD but for some reason JavaScript not taking it. Use query above!!!!
 SELECT teams.team_name_long, teams.team_name_short, games_played, teams.total_wins, COALESCE(losses.total_losses, 0) AS total_losses, COALESCE(ties.total_ties, 0) AS total_ties, COALESCE (points.total_points, 0) AS total_points
FROM (
    SELECT winning_team_long AS team_name_long, winning_team_short AS team_name_short, COUNT(winning_team_points) AS total_wins
    FROM games.games
    WHERE sport ILIKE 'Hockey'
    AND season = '2021-2022'
    AND team_level = 'A'
    AND division = 'Peewee'
    GROUP BY winning_team_long, winning_team_short
) teams
LEFT JOIN (
    SELECT losing_team_long AS team_name_long, losing_team_short AS team_name_short, COUNT(losing_team_points) AS total_losses
    FROM games.games
    WHERE sport ILIKE 'Hockey'
    AND season = '2021-2022'
    AND team_level = 'A'
    AND division = 'Peewee'
    GROUP BY losing_team_long, losing_team_short
) losses ON teams.team_name_long = losses.team_name_long
LEFT JOIN (
    SELECT team_name_long AS team_name_long, team_name_short AS team_name_short, sum(total_ties) AS total_ties
    FROM (
        SELECT home_team_long AS team_name_long, home_team_short AS team_name_short, COUNT(*) AS total_ties
        FROM games.games
        WHERE sport ILIKE 'Hockey'
    	AND season = '2021-2022'
    	AND team_level = 'A'
    	AND division = 'Peewee'
        AND tie = TRUE
        GROUP BY home_team_long, home_team_short

        UNION ALL 

        SELECT visitor_team_long AS team_name_long, visitor_team_short AS team_name_short, COUNT(*) AS total_ties
        FROM games.games 
         WHERE sport ILIKE 'Hockey'
    	AND season = '2021-2022'
    	AND team_level = 'A'
    	AND division = 'Peewee'
        AND tie = TRUE
        GROUP BY visitor_team_long, visitor_team_short
    ) queryTable
    GROUP BY team_name_long, team_name_short
) ties ON teams.team_name_long = ties.team_name_long
LEFT JOIN (
SELECT team_long, team_short, SUM(points) AS total_points
FROM (
    SELECT winning_team_long AS team_long, winning_team_short AS team_short, SUM(winning_team_points) AS points
    FROM games.games
       WHERE sport ILIKE 'Hockey'
    	AND season = '2021-2022'
    	AND team_level = 'A'
    	AND division = 'Peewee'
    GROUP BY winning_team_long, winning_team_short

    UNION ALL
    
    SELECT losing_team_long AS team_long, losing_team_short AS team_short, sum(losing_team_points) AS points
    FROM games.games
       WHERE sport ILIKE 'Hockey'
    	AND season = '2021-2022'
    	AND team_level = 'A'
    	AND division = 'Peewee'
    GROUP BY losing_team_long, losing_team_short
    
    UNION ALL

    SELECT home_team_long AS team_long, home_team_short AS team_short, 1 AS points
    FROM games.games
       WHERE sport ILIKE 'Hockey'
    	AND season = '2021-2022'
    	AND team_level = 'A'
    	AND division = 'Peewee'
    AND tie = TRUE

    UNION ALL

    SELECT visitor_team_long AS team_long, visitor_team_short , 1 AS points
    FROM games.games
       WHERE sport ILIKE 'Hockey'
    	AND season = '2021-2022'
    	AND team_level = 'A'
    	AND division = 'Peewee'
    AND tie = TRUE
) subquery
WHERE team_long IS NOT NULL
GROUP BY team_long, team_short
ORDER BY total_points DESC
) points
ON points.team_long = teams.team_name_long
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
) games_played ON games_played.team = teams.team_name_long
WHERE teams.team_name_long IS NOT NULL 
ORDER BY total_points DESC;

SELECT *
FROM (
SELECT teams.team_name_long, teams.team_name_short, games_played, teams.total_wins, COALESCE(losses.total_losses, 0) AS total_losses, COALESCE(ties.total_ties, 0) AS total_ties, COALESCE (points.total_points, 0) AS total_points
FROM (
    SELECT winning_team_long AS team_name_long, winning_team_short AS team_name_short, COUNT(winning_team_points) AS total_wins
    FROM games.games
    WHERE sport ILIKE 'Hockey'
    AND season = '2021-2022'
    AND team_level = 'A'
    AND division = 'Peewee'
    GROUP BY winning_team_long, winning_team_short
) teams
LEFT JOIN (
    SELECT losing_team_long AS team_name_long, losing_team_short AS team_name_short, COUNT(losing_team_points) AS total_losses
    FROM games.games
    WHERE sport ILIKE 'Hockey'
    AND season = '2021-2022'
    AND team_level = 'A'
    AND division = 'Peewee'
    GROUP BY losing_team_long, losing_team_short
) losses ON teams.team_name_long = losses.team_name_long
LEFT JOIN (
    SELECT team_name_long AS team_name_long, team_name_short AS team_name_short, sum(total_ties) AS total_ties
    FROM (
        SELECT home_team_long AS team_name_long, home_team_short AS team_name_short, COUNT(*) AS total_ties
        FROM games.games
        WHERE sport ILIKE 'Hockey'
    	AND season = '2021-2022'
    	AND team_level = 'A'
    	AND division = 'Peewee'
        AND tie = TRUE
        GROUP BY home_team_long, home_team_short

        UNION ALL 

        SELECT visitor_team_long AS team_name_long, visitor_team_short AS team_name_short, COUNT(*) AS total_ties
        FROM games.games 
         WHERE sport ILIKE 'Hockey'
    	AND season = '2021-2022'
    	AND team_level = 'A'
    	AND division = 'Peewee'
        AND tie = TRUE
        GROUP BY visitor_team_long, visitor_team_short
    ) queryTable
    GROUP BY team_name_long, team_name_short
) ties ON teams.team_name_long = ties.team_name_long
LEFT JOIN (
SELECT team_long, team_short, SUM(points) AS total_points
FROM (
    SELECT winning_team_long AS team_long, winning_team_short AS team_short, SUM(winning_team_points) AS points
    FROM games.games
       WHERE sport ILIKE 'Hockey'
    	AND season = '2021-2022'
    	AND team_level = 'A'
    	AND division = 'Peewee'
    GROUP BY winning_team_long, winning_team_short

    UNION ALL
    
    SELECT losing_team_long AS team_long, losing_team_short AS team_short, sum(losing_team_points) AS points
    FROM games.games
       WHERE sport ILIKE 'Hockey'
    	AND season = '2021-2022'
    	AND team_level = 'A'
    	AND division = 'Peewee'
    GROUP BY losing_team_long, losing_team_short
    
    UNION ALL

    SELECT home_team_long AS team_long, home_team_short AS team_short, 1 AS points
    FROM games.games
       WHERE sport ILIKE 'Hockey'
    	AND season = '2021-2022'
    	AND team_level = 'A'
    	AND division = 'Peewee'
    AND tie = TRUE

    UNION ALL

    SELECT visitor_team_long AS team_long, visitor_team_short , 1 AS points
    FROM games.games
       WHERE sport ILIKE 'Hockey'
    	AND season = '2021-2022'
    	AND team_level = 'A'
    	AND division = 'Peewee'
    AND tie = TRUE
) subquery
WHERE team_long IS NOT NULL
GROUP BY team_long, team_short
ORDER BY total_points DESC
) points
ON points.team_long = teams.team_name_long
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
) games_played ON games_played.team = teams.team_name_long
WHERE teams.team_name_long IS NOT NULL 
ORDER BY total_points DESC
) records
LEFT JOIN teams.teams
ON teams.team_name_short = records.team_name_short
WHERE teams.team_level = 'A'
GROUP BY records.team_name_long, records.team_name_short, teams.teams.id, records.games_played,records.total_wins, records.total_losses, records.total_ties, records.total_points
ORDER BY records.total_points DESC;



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



// Winning teams per game through a specified date
SELECT winning_team_long, winning_team_short, count(*) 
FROM games.games
WHERE game_date <= '10-31-2021'
AND team_level = 'A'
AND division = 'Peewee'
GROUP BY winning_team_long, winning_team_short
ORDER BY winning_team_long;

// Losing teams per game through a specified date
SELECT losing_team_long, losing_team_short, count(*) 
FROM games.games 
WHERE game_date <= '10-31-2021'
AND team_level = 'A'
AND division = 'Peewee'
GROUP BY losing_team_long, losing_team_short
ORDER BY losing_team_long;

// Ties through a specified date
SELECT home_team_long, home_team_short, visitor_team_long, visitor_team_short, tie 
FROM games.games 
WHERE game_date <= '10-31-2021' 
AND tie = TRUE 
AND team_level = 'A'
AND division = 'Peewee'
GROUP BY home_team_long, home_team_short, visitor_team_long, visitor_team_short, tie
ORDER BY home_team_long;

 SELECT winning_team_long, winning_team_short, count(*) 
      FROM games.games
      WHERE season = '2021-2022'
      AND game_date <= '2021-10-31'
      AND team_level = 'A'
      AND division = 'Peewee'
      GROUP BY winning_team_long, winning_team_short
      ORDER BY winning_team_long;
     
      SELECT losing_team_long, losing_team_short, count(*) 
      FROM games.games
      WHERE season = '2021-2022'
      AND game_date <= '2021-10-31'
      AND team_level = 'A'
      AND division = 'Peewee'
      GROUP BY losing_team_long, losing_team_short
      ORDER BY losing_team_long;

 SELECT home_team_long, home_team_short, visitor_team_long, visitor_team_short, tie 
      FROM games.games 
      WHERE season = '2021-2022'
      AND game_date <= '2021-10-31'
      AND tie = TRUE 
      AND team_level = 'A'
      AND division = 'Peewee'
      GROUP BY home_team_long, home_team_short, visitor_team_long, visitor_team_short, tie
      ORDER BY home_team_long;


  SELECT
	team_long,
	team_short,
	sum(GF) AS "GF",
	sum(GA) AS "GA",
	sum(GF - GA) AS "DIFF"
FROM
	(
	SELECT
		home_team_long AS team_long,
		home_team_short AS team_short,
		sum(home_team_score) AS GF,
		sum(visitor_team_score) AS GA,
		sum(home_team_score - visitor_team_score)
	FROM
		games.games
	WHERE
		sport ILIKE 'Hockey'
		AND team_level = 'A'
		AND division = 'Peewee'
		AND season = '2021-2022'
	GROUP BY
		home_team_long,
		home_team_short
UNION ALL
	SELECT
		visitor_team_long AS team_long,
		visitor_team_short AS team_short,
		sum(visitor_team_score) AS GF,
		sum(home_team_score) AS GA,
		sum(visitor_team_score - home_team_score)
	FROM
		games.games
	WHERE
		sport ILIKE 'Hockey'
		AND team_level = 'A'
		AND division = 'Peewee'
		AND season = '2021-2022'
	GROUP BY
		visitor_team_long,
		visitor_team_short

) AS gf_ga_table
GROUP BY
	team_long,
	team_short
ORDER BY
	"DIFF" DESC ;

SELECT * 
FROM games.games ;

-- Home Team Win/Loss/Tie Records
SELECT id, home_team_short, home_team_long ,  winning_team_short, winning_team_long, tie
FROM games.games
WHERE sport ILIKE 'Hockey'
AND season = '2021-2022'
AND team_level = 'A'
AND division = 'Peewee'
ORDER BY home_team_short, home_team_long ;


 -- Visitor Team Win/Loss/Tie Records
SELECT id, visitor_team_short, visitor_team_long ,  winning_team_short, winning_team_long, tie
FROM games.games
WHERE sport ILIKE 'Hockey'
AND season = '2021-2022'
AND team_level = 'A'
AND division = 'Peewee'
ORDER BY visitor_team_short, visitor_team_long ;


SELECT game_date
from (
SELECT DISTINCT game_date
FROM games.games
ORDER BY game_date
LIMIT 15
) subquery
LIMIT 1;

SELECT * 
FROM games.games 
WHERE game_date >=
(SELECT game_date
from (
SELECT DISTINCT game_date
FROM games.games
WHERE sport = 'Hockey'
AND season = '2021-2022'
AND team_level = 'A'
AND division = 'Peewee'
ORDER BY game_date ASC
LIMIT 15
) subquery
LIMIT 1)
AND sport = 'Hockey'
AND season = '2021-2022'
AND team_level = 'A'
AND division = 'Peewee'
ORDER BY game_date DESC;

SELECT *
FROM teams.teams;

SELECT game_date
FROM games.games
GROUP BY game_date
ORDER BY game_date DESC;


SELECT DISTINCT team
FROM (
SELECT home_team_long AS team
FROM games.games 
WHERE season = '2021-2022'
AND team_level = 'A'
AND division = 'Peewee'

UNION ALL

SELECT visitor_team_long AS team
FROM games.games 
WHERE season = '2021-2022'
AND team_level = 'A'
AND division = 'Peewee'
) subquery
ORDER BY  team;



SELECT *
FROM games.games
WHERE sport ILIKE  'Hockey'
AND ((home_team_long = 'Jr. Ducks(2)' OR visitor_team_long = 'Jr. Ducks(2)') OR (home_team_short = 'Jr. Ducks(2)' OR visitor_team_short = 'Jr. Ducks(2)'))
AND team_level = 'A'
AND division = 'Peewee'
AND season = '2021-2022'
''
ORDER BY game_date DESC
LIMIT 10;


-- Wins, losses and points
SELECT teams.team_name_long, teams.team_name_short, games_played, teams.total_wins, COALESCE(losses.total_losses, 0) AS total_losses, COALESCE(ties.total_ties, 0) AS total_ties, COALESCE (points.total_points, 0) AS total_points
   FROM (
       SELECT winning_team_long AS team_name_long, winning_team_short AS team_name_short, COUNT(winning_team_points) AS total_wins
       FROM games.games
     WHERE sport ILIKE 'Hockey'
       AND season = '2022-2023'
       AND team_level = 'AA'
       AND division = 'Peewee'
       GROUP BY winning_team_long, winning_team_short
   ) teams
   LEFT JOIN (
       SELECT losing_team_long AS team_name_long, losing_team_short AS team_name_short, COUNT(losing_team_points) AS total_losses
       FROM games.games
    WHERE sport ILIKE 'Hockey'
       AND season = '2022-2023'
       AND team_level = 'AA'
       AND division = 'Peewee'
       GROUP BY losing_team_long, losing_team_short
   ) losses ON teams.team_name_long = losses.team_name_long
   LEFT JOIN (
       SELECT team_name_long AS team_name_long, team_name_short AS team_name_short, sum(total_ties) AS total_ties
       FROM (
           SELECT home_team_long AS team_name_long, home_team_short AS team_name_short, COUNT(*) AS total_ties
           FROM games.games
           WHERE sport ILIKE 'Hockey'
       AND season = '2022-2023'
       AND team_level = 'AA'
       AND division = 'Peewee'
           AND tie = TRUE
           GROUP BY home_team_long, home_team_short

           UNION ALL

           SELECT visitor_team_long AS team_name_long, visitor_team_short AS team_name_short, COUNT(*) AS total_ties
           FROM games.games
          WHERE sport ILIKE 'Hockey'
       AND season = '2022-2023'
       AND team_level = 'AA'
       AND division = 'Peewee'
           AND tie = TRUE
           GROUP BY visitor_team_long, visitor_team_short
       ) queryTable
       GROUP BY team_name_long, team_name_short
   ) ties ON teams.team_name_long = ties.team_name_long
   LEFT JOIN (
   SELECT team_long, team_short, SUM(points) AS total_points
   FROM (
       SELECT winning_team_long AS team_long, winning_team_short AS team_short, SUM(winning_team_points) AS points
       FROM games.games
      WHERE sport ILIKE 'Hockey'
       AND season = '2022-2023'
       AND team_level = 'AA'
       AND division = 'Peewee'
       GROUP BY winning_team_long, winning_team_short

       UNION ALL

       SELECT losing_team_long AS team_long, losing_team_short AS team_short, sum(losing_team_points) AS points
       FROM games.games
       WHERE sport ILIKE 'Hockey'
       AND season = '2022-2023'
       AND team_level = 'AA'
       AND division = 'Peewee'
       GROUP BY losing_team_long, losing_team_short

       UNION ALL

       SELECT home_team_long AS team_long, home_team_short AS team_short, 1 AS points
       FROM games.games
    WHERE sport ILIKE 'Hockey'
       AND season = '2022-2023'
       AND team_level = 'AA'
       AND division = 'Peewee'
       AND tie = TRUE

       UNION ALL

       SELECT visitor_team_long AS team_long, visitor_team_short , 1 AS points
       FROM games.games
      WHERE sport ILIKE 'Hockey'
       AND season = '2022-2023'
       AND team_level = 'AA'
       AND division = 'Peewee'
       AND tie = TRUE
   ) subquery
   WHERE team_long IS NOT NULL
   GROUP BY team_long, team_short
   ORDER BY total_points DESC
   ) points
   ON points.team_long = teams.team_name_long
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
  WHERE sport ILIKE 'Hockey'
       AND season = '2022-2023'
       AND team_level = 'AA'
       AND division = 'Peewee'
  		
   GROUP BY team

   UNION ALL

   SELECT
   CASE
     WHEN losing_team_long IS NOT NULL THEN losing_team_long
     ELSE visitor_team_long
   END AS team ,
   COUNT (*) AS games_played
   FROM games.games
  WHERE sport ILIKE 'Hockey'
       AND season = '2022-2023'
       AND team_level = 'AA'
       AND division = 'Peewee'
   GROUP BY team
   ) AS gp

   GROUP BY team
   ORDER BY games_played DESC
   ) games_played ON games_played.team = teams.team_name_long
   WHERE teams.team_name_long IS NOT NULL
   ORDER BY total_points DESC;
  
  
  
  
  
  SELECT *,
  CASE
  	WHEN home_team_long = 'Jr. Ducks(3)'
  	THEN sum(visitor_team_score)
  END AS GF,
    CASE
  	WHEN visitor_team_long = 'Jr. Ducks(3)'
  	THEN sum(home_team_score)
  END AS GF2
  
  
  
  
  FROM games.games 
  WHERE home_team_long = 'Jr. Ducks(3)' OR visitor_team_long = 'Jr. Ducks(3)'
  AND season = '2021-2022'
  AND team_level = 'A'
  AND division = 'Peewee'
   GROUP BY id;
  
  SELECT team_long, team_short, sum(GF) AS "GF", sum(GA) AS "GA", sum(GF - GA) AS "DIFF"
      FROM (
      SELECT home_team_long AS team_long, home_team_short AS team_short, sum(home_team_score ) AS GF, sum(visitor_team_score) AS GA, sum(home_team_score - visitor_team_score)
      FROM games.games
      WHERE sport ILIKE 'Hockey'
      AND team_level = 'AA' 
      AND division = 'Peewee' 
      AND season = '2022-2023'
      GROUP BY home_team_long, home_team_short
      
      UNION ALL 
      
      SELECT visitor_team_long AS team_long, visitor_team_short AS team_short, sum(visitor_team_score) AS GF, sum(home_team_score) AS GA, sum(visitor_team_score - home_team_score)
      FROM games.games
      WHERE sport ILIKE 'Hockey'
      AND team_level = 'AA' 
      AND division = 'Peewee' 
      AND season = '2022-2023'
      GROUP BY visitor_team_long, visitor_team_short
      
      ) AS gf_ga_table
      GROUP BY team_long, team_short
      ORDER BY "DIFF" DESC ;
     
         
       SELECT id, game_date, winning_team_long, winning_team_short, losing_team_long, losing_team_short, home_team_long, home_team_short, visitor_team_long, visitor_team_short
       FROM games.games
       WHERE season = '2022-2023'
       AND team_level = 'AA'
       AND division = 'Peewee'
       ORDER BY game_date DESC;
      
      


--? Win/Loss game fetching   
SELECT id, game_date, team_long, team_short, game_result 
FROM (
  SELECT id, game_date, winning_team_long AS team_long, winning_team_short AS team_short,
        CASE 
            WHEN winning_team_long = 'Jr. Gulls' OR winning_team_short = 'Gulls'
            THEN 'W'
        END AS game_result
  FROM games.games
  WHERE season = '2022-2023'
    AND team_level = 'AA'
    AND division = 'Peewee'
    AND (winning_team_long = 'Jr. Gulls' OR winning_team_short = 'Gulls')

  UNION ALL

  SELECT id, game_date, losing_team_long AS team_long, losing_team_short AS team_short, 
        CASE 
            WHEN losing_team_long = 'Jr. Gulls' OR losing_team_short = 'Gulls'
            THEN 'L'
        END AS game_result
  FROM games.games
  WHERE season = '2022-2023'
    AND team_level = 'AA'
    AND division = 'Peewee'
    AND (losing_team_long = 'Jr. Gulls' OR losing_team_short = 'Gulls') 
    
    UNION ALL
    
    SELECT id, game_date, team_long, team_short, game_result
FROM (
  SELECT id, game_date,
    CASE 
      WHEN (home_team_long = 'Jr. Gulls' OR home_team_short = 'Gulls')
        OR 
        (visitor_team_long = 'Jr. Gulls' OR visitor_team_short = 'Gulls')
        THEN 'Jr. Gulls'
    END AS team_long,
    CASE 
      WHEN (home_team_long = 'Jr. Gulls' OR home_team_short = 'Gulls')
        OR 
        (visitor_team_long = 'Jr. Gulls' OR visitor_team_short = 'Gulls')
        THEN 'Gulls'
    END AS team_short,
    'T' AS game_result
  FROM games.games
  WHERE season = '2022-2023'
    AND team_level = 'AA'
    AND division = 'Peewee'
    AND tie = TRUE
    ORDER BY game_date DESC
) AS TIES
WHERE team_short = 'Gulls'
    
) AS combined_results
ORDER BY game_date DESC;


 

ALTER TABLE games.games 
rename COLUMN game_type2 TO game_type_league;

SELECT *
FROM games.games

UPDATE games.games
SET game_type_league = 'CAHA'
WHERE game_type = 'Preseason';

ALTER TABLE games.games
ALTER COLUMN game_type_league SET NOT NULL;




-- Games_played, wins, losses, ties
SELECT gp.team_long, gp.team_short, SUM(games_played) AS games_played, sum(COALESCE(team_wins.wins, 0)) AS wins, sum(COALESCE(team_losses.losses, 0)) AS losses, sum(COALESCE(ties.ties, 0)) AS TIES, COALESCE (sum((wins * 2) + COALESCE(TIES, 0)), 0) AS points
FROM (
    SELECT 
    	CASE 
	        WHEN winning_team_long IS NOT NULL THEN winning_team_long
	        ELSE home_team_long
    END AS team_long,
    	CASE 
	        WHEN winning_team_short IS NOT NULL THEN winning_team_short
	        ELSE home_team_short
    END AS team_short,
    COUNT(*) AS games_played
    FROM games.games
    WHERE season = '2021-2022'
        AND team_level = 'A'
        AND division = 'Peewee'
        AND (winning_team_long IS NOT NULL OR losing_team_long IS NOT NULL)
    GROUP BY team_long, team_short

    UNION ALL

    SELECT 
        CASE 
            WHEN losing_team_long IS NOT NULL THEN losing_team_long
            ELSE home_team_long
        END AS team_long, 
      	CASE 
	        WHEN losing_team_short IS NOT NULL THEN losing_team_short
	        ELSE home_team_short
    END AS team_short,
        COUNT(*) AS games_played
    FROM games.games
    WHERE season = '2021-2022'
        AND team_level = 'A'
        AND division = 'Peewee'
        AND (winning_team_long IS NOT NULL OR losing_team_long IS NOT NULL)
    GROUP BY team_long, team_short
) AS gp

LEFT JOIN (
    SELECT winning_team_long AS team_long, winning_team_short AS team_short, COUNT(*) AS wins
    FROM games.games
    WHERE season = '2021-2022'
        AND team_level = 'A'
        AND division = 'Peewee'
        AND winning_team_long IS NOT NULL 
    GROUP BY team_long, team_short
) AS team_wins 
ON gp.team_long = team_wins.team_long

LEFT JOIN (
    SELECT losing_team_long AS team_long, losing_team_short AS team_short, COUNT(*) AS losses
    FROM games.games
    WHERE season = '2021-2022'
        AND team_level = 'A'
        AND division = 'Peewee'
        AND losing_team_long IS NOT NULL 
    GROUP BY team_long, team_short
) AS team_losses 
ON gp.team_long = team_losses.team_long

LEFT JOIN (
   SELECT team_long, team_short, ties
   FROM (
   SELECT home_team_long AS team_long, home_team_short AS team_short, count(*) AS TIES
   FROM games.games
   WHERE tie = TRUE 
   AND season = '2021-2022'
        AND team_level = 'A'
        AND division = 'Peewee'
    GROUP BY team_long, team_short
    
    UNION ALL 
    
       SELECT visitor_team_long AS team_long, visitor_team_short AS team_short, count(*) AS TIES
   FROM games.games
   WHERE tie = TRUE 
   AND season = '2021-2022'
        AND team_level = 'A'
        AND division = 'Peewee'
    GROUP BY team_long, team_short
    
   ) AS team_ties
) AS ties 
ON gp.team_long = ties.team_long

GROUP BY gp.team_long, gp.team_short
ORDER BY points DESC;




SELECT *
FROM games.games
WHERE home_team_long = 'California Heat' OR visitor_team_long = 'California Heat'


-- Wins
SELECT winning_team_long, winning_team_short, count(*) AS wins
FROM games.games 
WHERE season = '2021-2022'
AND team_level = 'A'
AND division = 'Peewee'
AND game_type = 'Regular Season'
AND winning_team_long IS NOT NULL 
GROUP BY winning_team_long , winning_team_short
ORDER BY wins DESC;


-- Losses
SELECT losing_team_long, losing_team_short, count(*) AS losses
FROM games.games 
WHERE season = '2021-2022'
AND team_level = 'A'
AND division = 'Peewee'
AND game_type = 'Regular Season'
AND losing_team_long IS NOT NULL 
GROUP BY losing_team_long , losing_team_short
ORDER BY losses;

-- Ties
SELECT team_long, team_short, ties 
FROM (
SELECT home_team_long AS team_long, home_team_short AS team_short, count(*) AS ties
FROM games.games 
WHERE tie = true 
AND season = '2021-2022'
AND team_level = 'A'
AND division = 'Peewee'
AND game_type = 'Regular Season'
GROUP BY team_long, team_short

UNION ALL

SELECT visitor_team_long AS team_long, visitor_team_short AS team_short, count(*) AS ties
FROM games.games 
WHERE tie = TRUE 
AND season = '2021-2022'
AND team_level = 'A'
AND division = 'Peewee'
AND game_type = 'Regular Season'
GROUP BY team_long, team_short
) subquery
GROUP BY team_long, team_short, ties
ORDER BY ties;

SELECT
  games.winning_team_long,
  games.winning_team_short,
  wins.count AS wins,
  wins.count * 2 AS points
FROM
  games.games
JOIN (
  SELECT
    winning_team_long,
    winning_team_short,
    COUNT(*) AS count
  FROM
    games.games
  WHERE
    season = '2021-2022'
    AND team_level = 'A'
    AND division = 'Peewee'
    AND game_type = 'Regular Season'
  GROUP BY
    winning_team_long,
    winning_team_short
) AS wins ON games.winning_team_long = wins.winning_team_long
  AND games.winning_team_short = wins.winning_team_short
WHERE
  season = '2021-2022'
  AND team_level = 'A'
  AND division = 'Peewee'
  AND game_type = 'Regular Season'
  GROUP BY games.winning_team_long , games.winning_team_short, wins.count
  ORDER BY points DESC;


SELECT team_long, team_short, logo_image, primary_team_color, secondary_team_color, third_team_color
FROM 
(
SELECT home_team_long AS team_long, home_team_short AS team_short
FROM games.games
WHERE sport ILIKE 'Hockey'
AND season = '2021-2022'
AND team_level = 'A'
AND division = 'Peewee'
GROUP BY team_long, team_short


UNION ALL 

SELECT visitor_team_long AS team_long, visitor_team_short AS team_short
FROM games.games
WHERE sport ILIKE 'Hockey'
AND season = '2021-2022'
AND team_level = 'A'
AND division = 'Peewee'
GROUP BY team_long, team_short
) AS games

LEFT JOIN (
SELECT team_name_full, team_name_short, logo_image, primary_team_color, secondary_team_color, third_team_color
FROM teams.teams
GROUP BY team_name_short, team_name_full, logo_image, primary_team_color, secondary_team_color, third_team_color
ORDER BY team_name_short, team_name_full
) AS teams
ON teams.team_name_short = games.team_short

GROUP BY team_long, team_short ,logo_image, primary_team_color, secondary_team_color, third_team_color
ORDER BY team_short, team_long;


SELECT team_long, team_short, sum(ties) AS ties
FROM 
(
SELECT home_team_long AS team_long, home_team_short AS team_short, count(*) AS ties
FROM games.games
WHERE sport ILIKE 'Hockey'
AND tie = TRUE 
AND season = '2021-2022'
AND team_level = 'A'
AND division = 'Peewee'
AND game_type = 'Regular Season'
GROUP BY team_long , team_short 

UNION ALL 

SELECT visitor_team_long AS team_long, visitor_team_short AS team_short, count(*) AS ties
FROM games.games
WHERE sport ILIKE 'Hockey'
AND tie = TRUE 
AND season = '2021-2022'
AND team_level = 'A'
AND division = 'Peewee'
AND game_type = 'Regular Season'
GROUP BY team_long , team_short 
) AS ties
GROUP BY team_long, team_short
ORDER BY ties ;


SELECT *
FROM games.games
WHERE home_team_short = 'Sharks'
OR 
visitor_team_short = 'Sharks'
AND season = '2022-2023'
AND team_level ='AA'
AND division = 'Peewee';


SELECT losing_team_long as team_long, losing_team_short as team_short, count(*) as losses
            FROM games.games 
            WHERE season = '2022-2023'
            AND team_level = 'AA'
            AND division = 'Peewee'
            AND game_type = 'Regular Season'
            GROUP BY team_long, team_short
            ORDER BY team_long;


           
           
   SELECT
	games.winning_team_long AS team_long,
	games.winning_team_short AS team_short,
	wins.count AS wins,
	tie_games.ties,
	sum(wins.count + tie_games.ties) AS points
FROM
	games.games
JOIN (
	SELECT
		winning_team_long,
		winning_team_short,
		COUNT(*) AS count
	FROM
		games.games
	WHERE
		sport ILIKE 'Hockey'
		AND season = '2021-2022'
		AND team_level = 'A'
		AND division = 'Peewee'
		AND game_type = 'Regular Season'
	GROUP BY
		winning_team_long,
		winning_team_short
    ) AS wins ON
	games.winning_team_long = wins.winning_team_long
	AND games.winning_team_short = wins.winning_team_short
JOIN 
    (
	SELECT
		team_long,
		team_short,
		sum(TIES) AS TIES
	FROM
		(
		SELECT
			home_team_long AS team_long,
			home_team_short AS team_short,
			count(*) AS TIES
		FROM
			games.games
		WHERE
			tie = TRUE
			AND sport ILIKE 'Hockey'
			AND season = '2021-2022'
			AND team_level = 'A'
			AND division = 'Peewee'
			AND game_type = 'Regular Season'
		GROUP BY
			team_long ,
			team_short
	UNION ALL
		SELECT
			visitor_team_long AS team_long,
			visitor_team_short AS team_short,
			count(*) AS TIES
		FROM
			games.games
		WHERE
			tie = TRUE
			AND sport ILIKE 'Hockey'
			AND season = '2021-2022'
			AND team_level = 'A'
			AND division = 'Peewee'
			AND game_type = 'Regular Season'
		GROUP BY
			team_long ,
			team_short 
            ) AS TIES
	GROUP BY
		team_long,
		team_short
	ORDER BY
		TIES 
    
    ) AS tie_games
    ON
	tie_games.team_long = games.winning_team_long
WHERE
	sport ILIKE 'Hockey'
	AND season = '2021-2022'
	AND team_level = 'A'
	AND division = 'Peewee'
	AND game_type = 'Regular Season'
GROUP BY
	games.winning_team_long ,
	games.winning_team_short
ORDER BY
	points DESC;
	




SELECT
    games.winning_team_long AS team_long,
    games.winning_team_short AS team_short,
    wins.count AS wins,
    tie_games.TIES AS ties,
    sum(wins.count + tie_games.TIES) AS points
FROM
    games.games
JOIN (
    SELECT
        winning_team_long,
        winning_team_short,
        COUNT(*) AS count
    FROM
        games.games
    WHERE
        sport ILIKE 'Hockey'
        AND season = '2021-2022'
        AND team_level = 'A'
        AND division = 'Peewee'
        AND game_type = 'Regular Season'
    GROUP BY
        winning_team_long,
        winning_team_short
) AS wins ON
    games.winning_team_long = wins.winning_team_long
    AND games.winning_team_short = wins.winning_team_short
JOIN (
    SELECT
        team_long,
        team_short,
        SUM(ties) AS ties
    FROM (
        SELECT
            home_team_long AS team_long,
            home_team_short AS team_short,
            COUNT(*) AS ties
        FROM
            games.games
        WHERE
            tie = TRUE
            AND sport ILIKE 'Hockey'
            AND season = '2021-2022'
            AND team_level = 'A'
            AND division = 'Peewee'
            AND game_type = 'Regular Season'
        GROUP BY
            team_long,
            team_short
        UNION ALL
        SELECT
            visitor_team_long AS team_long,
            visitor_team_short AS team_short,
            COUNT(*) AS ties
        FROM
            games.games
        WHERE
            tie = TRUE
            AND sport ILIKE 'Hockey'
            AND season = '2021-2022'
            AND team_level = 'A'
            AND division = 'Peewee'
            AND game_type = 'Regular Season'
        GROUP BY
            team_long,
            team_short
    ) AS TIES
    GROUP BY
        team_long,
        team_short
    ORDER BY
        ties
) AS tie_games ON
    tie_games.team_long = games.winning_team_long
WHERE
    sport ILIKE 'Hockey'
    AND season = '2021-2022'
    AND team_level = 'A'
    AND division = 'Peewee'
    AND game_type = 'Regular Season'
    GROUP BY games.winning_team_long, games.winning_team_short
ORDER BY
    points DESC;
   
   
   
   
   
   
   
   
   
   SELECT
    games.winning_team_long AS team_long,
    games.winning_team_short AS team_short,
    wins.count AS wins,
    tie_games.TIES AS ties,
    SUM(wins.count + tie_games.TIES) AS points
FROM
    games.games
JOIN (
    SELECT
        winning_team_long,
        winning_team_short,
        COUNT(*) AS count
    FROM
        games.games
    WHERE
        sport ILIKE 'Hockey'
        AND season = '2021-2022'
        AND team_level = 'A'
        AND division = 'Peewee'
        AND game_type = 'Regular Season'
    GROUP BY
        winning_team_long,
        winning_team_short
) AS wins ON
    games.winning_team_long = wins.winning_team_long
    AND games.winning_team_short = wins.winning_team_short
JOIN (
    SELECT
        team_long,
        team_short,
        SUM(ties) AS TIES
    FROM (
        SELECT
            home_team_long AS team_long,
            home_team_short AS team_short,
            COUNT(*) AS ties
        FROM
            games.games
        WHERE
            tie = TRUE
            AND sport ILIKE 'Hockey'
            AND season = '2021-2022'
            AND team_level = 'A'
            AND division = 'Peewee'
            AND game_type = 'Regular Season'
        GROUP BY
            home_team_long,
            home_team_short
        UNION ALL
        SELECT
            visitor_team_long AS team_long,
            visitor_team_short AS team_short,
            COUNT(*) AS ties
        FROM
            games.games
        WHERE
            tie = TRUE
            AND sport ILIKE 'Hockey'
            AND season = '2021-2022'
            AND team_level = 'A'
            AND division = 'Peewee'
            AND game_type = 'Regular Season'
        GROUP BY
            visitor_team_long,
            visitor_team_short
    ) AS TIES
    GROUP BY
        team_long,
        team_short
    ORDER BY
        ties
) AS tie_games ON
    tie_games.team_long = games.winning_team_long
WHERE
    sport ILIKE 'Hockey'
    AND season = '2021-2022'
    AND team_level = 'A'
    AND division = 'Peewee'
    AND game_type = 'Regular Season'
GROUP BY
    games.winning_team_long,
    games.winning_team_short,
    wins.count,
    tie_games.TIES
ORDER BY
    points DESC;


   
   SELECT
	games.winning_team_long AS team_long,
	games.winning_team_short AS team_short,
	COALESCE(wins.count,
	0) AS wins,
	COALESCE(tie_games.ties,
	0) AS TIES,
	COALESCE(wins.count,
	0) * 2 + COALESCE(tie_games.TIES,
	0) AS points
FROM
	games.games
JOIN (
	SELECT
		winning_team_long,
		winning_team_short,
		COUNT(*) AS count
	FROM
		games.games
	WHERE
		sport ILIKE 'Hockey'
		AND season = '2021-2022'
		AND team_level = 'A'
		AND division = 'Peewee'
		AND game_type = 'Regular Season'
	GROUP BY
		winning_team_long,
		winning_team_short
) AS wins ON
	games.winning_team_long = wins.winning_team_long
	AND games.winning_team_short = wins.winning_team_short
LEFT JOIN (
	SELECT
		team_long,
		team_short,
		SUM(TIES) AS TIES
	FROM
		(
		SELECT
			home_team_long AS team_long,
			home_team_short AS team_short,
			COUNT(*) AS TIES
		FROM
			games.games
		WHERE
			tie = TRUE
			AND sport ILIKE 'Hockey'
			AND season = '2021-2022'
			AND team_level = 'A'
			AND division = 'Peewee'
			AND game_type = 'Regular Season'
		GROUP BY
			home_team_long,
			home_team_short
	UNION ALL
		SELECT
			visitor_team_long AS team_long,
			visitor_team_short AS team_short,
			COUNT(*) AS TIES
		FROM
			games.games
		WHERE
			tie = TRUE
			AND sport ILIKE 'Hockey'
			AND season = '2021-2022'
			AND team_level = 'A'
			AND division = 'Peewee'
			AND game_type = 'Regular Season'
		GROUP BY
			visitor_team_long,
			visitor_team_short
    ) AS TIES
	GROUP BY
		team_long,
		team_short
	ORDER BY
		TIES
) AS tie_games ON
	tie_games.team_long = games.winning_team_long
	AND tie_games.team_short = games.winning_team_short
WHERE
	sport ILIKE 'Hockey'
	AND season = '2021-2022'
	AND team_level = 'A'
	AND division = 'Peewee'
	AND game_type = 'Regular Season'
GROUP BY
	games.winning_team_long,
	games.winning_team_short,
	wins.count,
	tie_games.TIES
ORDER BY
	points DESC;




SELECT teams.id, team_long, team_short, logo_image, primary_team_color, secondary_team_color, third_team_color
      FROM 
      (
      SELECT home_team_id_fk AS id, home_team_long AS team_long, home_team_short AS team_short
      FROM games.games
      WHERE sport ILIKE 'Hockey'
      AND season = '2021-2022'
      AND team_level = 'A'
      AND division = 'Peewee'
      AND game_type = 'Regular Season'
      GROUP BY id, team_long, team_short

      UNION ALL 

      SELECT visitor_team_id_fk AS id, visitor_team_long AS team_long, visitor_team_short AS team_short
      FROM games.games
      WHERE sport ILIKE 'Hockey'
      AND season = '2021-2022'
      AND team_level = 'A'
       AND division = 'Peewee'
      AND game_type = 'Regular Season'
      GROUP BY id, team_long, team_short
      ) AS games

      LEFT JOIN 
      (
      SELECT id, team_name_full, team_name_short, logo_image, primary_team_color, secondary_team_color, third_team_color
      FROM teams.teams
      WHERE sport ILIKE 'Hockey'
      AND team_level = 'A'
      GROUP BY id, team_name_short, team_name_full, logo_image, primary_team_color, secondary_team_color, third_team_color
      ORDER BY team_name_short, team_name_full
      ) AS teams
      ON teams.team_name_short = games.team_short

      GROUP BY teams.id, team_long, team_short ,logo_image, primary_team_color, secondary_team_color, third_team_color
      ORDER BY team_short, team_long;
     
    
     
     
     
     
     
     
     
     SELECT
      games.winning_team_long AS team_long,
      games.winning_team_short AS team_short,
          COALESCE(wins.count,
      0) + COALESCE (tie_games.ties, 0) AS "GP",
      COALESCE(wins.count,
      0) AS wins,
      COALESCE(tie_games.ties,
      0) AS TIES,
      COALESCE(wins.count,
      0) * 2 + COALESCE(tie_games.ties,
      0) AS points
    FROM
      games.games
    JOIN (
      SELECT
        winning_team_long,
        winning_team_short,
        COUNT(*) AS count
      FROM
        games.games
      WHERE
        sport ILIKE 'Hockey'
        AND season = '2021-2022'
        AND team_level = 'A'
        AND division = 'Peewee'
        AND game_type = 'Regular Season'
      GROUP BY
        winning_team_long,
        winning_team_short
    ) AS wins ON
      games.winning_team_long = wins.winning_team_long
      AND games.winning_team_short = wins.winning_team_short
    LEFT JOIN (
      SELECT
        team_long,
        team_short,
        SUM(TIES) AS TIES
      FROM
        (
        SELECT
          home_team_long AS team_long,
          home_team_short AS team_short,
          COUNT(*) AS TIES
        FROM
          games.games
        WHERE
          tie = TRUE
        AND sport ILIKE 'Hockey'
        AND season = '2021-2022'
        AND team_level = 'A'
        AND division = 'Peewee'
        AND game_type = 'Regular Season'
        GROUP BY
          home_team_long,
          home_team_short
      UNION ALL
        SELECT
          visitor_team_long AS team_long,
          visitor_team_short AS team_short,
          COUNT(*) AS TIES
        FROM
          games.games
        WHERE
          tie = TRUE
        AND sport ILIKE 'Hockey'
        AND season = '2021-2022'
        AND team_level = 'A'
        AND division = 'Peewee'
        AND game_type = 'Regular Season'
        GROUP BY
          visitor_team_long,
          visitor_team_short
        ) AS TIES
      GROUP BY
        team_long,
        team_short
      ORDER BY
        TIES
    ) AS tie_games ON
      tie_games.team_long = games.winning_team_long
      AND tie_games.team_short = games.winning_team_short
    WHERE
    sport ILIKE 'Hockey'
        AND season = '2021-2022'
        AND team_level = 'A'
        AND division = 'Peewee'
        AND game_type = 'Regular Season'
    GROUP BY
      games.winning_team_long,
      games.winning_team_short,
      wins.count,
      tie_games.TIES
    ORDER BY
      points DESC; 
     
     
     SELECT *
     FROM games.games
     WHERE (home_team_long = 'Jr. Ducks(2)' OR visitor_team_long = 'Jr. Ducks(2)')
     AND season = '2022-2023'
     ORDER BY game_date DESC;  
    
    SELECT *
    FROM games.games
WHERE season = '2022-2023'
AND game_type_league = 'CAHA'


DROP TABLE games.boxscore ;

CREATE TABLE games.boxscore (
  game_id UUID REFERENCES games.games (id),
  goals hstore
);




INSERT INTO games.boxscore (game_id, goals)
VALUES (
'b675d0df-c775-460a-8013-55c91baaf671',
ARRAY [1, 5, 3]
)

CREATE TABLE games.boxscore (
id uuid DEFAULT uuid_generate_v4 (),
gameId_fk uuid REFERENCES games.games(id),
playerId_fk uuid REFERENCES players.player_profiles(id),
goals integer[],
timeOfGoal TEXT[],
assists integer DEFAULT 0,
points integer DEFAULT 0,
SOG integer DEFAULT 0,
shootingPercengage NUMERIC (3,2),
powerPlayPoints integer DEFAULT 0,
plusMinus integer DEFAULT 0,
PIM integer DEFAULT 0,
saves NUMERIC DEFAULT 0,
goalieShotsAgainst NUMERIC DEFAULT 0,
savePercentage NUMERIC(3,2) GENERATED ALWAYS AS (saves / NULLIF (goalieShotsAgainst, 0)) STORED
)

INSERT INTO games.boxscore (
  gameId_fk,
  playerId_fk,
  goals,
  timeOfGoal,
  assists,
  SOG,
  powerPlayPoints,
  plusMinus,
  PIM
)
VALUES (
  '03bf5e24-42c5-4057-8af2-2b7f161bdb45'::uuid,
  '43ffb414-68df-46c5-a5c9-99c568466be6'::uuid,
  ARRAY[1],
  ARRAY['3:50 1st Period'],
  2,
  4,
  1,
  1,
  0
);

INSERT INTO games.boxscore (gameid_fk, goals)
VALUES ('03bf5e24-42c5-4057-8af2-2b7f161bdb45', ARRAY[2]);



SELECT * FROM games.boxscore;
DROP TABLE games.boxscore;

UPDATE games.boxscore
DELETE FROM games.boxscore;

SELECT concat(player.first_name, ' ', player.last_name), box.goals, game.game_date, game.winning_team_long
FROM games.boxscore box
LEFT JOIN players.player_profiles player
ON playerid_fk = player.id
LEFT JOIN games.games game
ON game.id = box.gameId_fk

ALTER games.boxscore 
ALTER COLUMN goals TYPE integer[] ;

ALTER TABLE games.boxscore
ALTER COLUMN goals SET DATA TYPE INTEGER[] USING ARRAY[goals];


ALTER TABLE games.boxscore
ALTER COLUMN goals::integer[];

 goals::integer[]



ALTER TABLE employees
ALTER COLUMN age TYPE smallint;

ALTER TABLE games.boxscore
ALTER COLUMN goals DROP DEFAULT;

ALTER TABLE games.boxscore
ALTER COLUMN goals SET DATA TYPE INTEGER[] USING ARRAY[goals];

CREATE TABLE games.boxscore (
id serial,
goals INTEGER[]
);

INSERT INTO games.boxscore (goals)
VALUES (ARRAY[3]);

SELECT * FROM games.boxscore ;

DROP TABLE games.boxscore ;



SELECT * FROM games.boxscore ;

-- Create the table
CREATE TABLE my_table (
  id SERIAL PRIMARY KEY,
  numbers INTEGER[]
);

-- Insert a value into the array
INSERT INTO my_table (numbers) VALUES (ARRAY[42]);

-- Query the table
SELECT * FROM my_table;

DROP TABLE games.boxscore  ;


CREATE TABLE games.boxscore (
  id SERIAL PRIMARY KEY,
  goal_data INTEGER[]
);
INSERT INTO games.boxscore (goal_data) VALUES (ARRAY[3]);
SELECT * FROM games.boxscore ;

INSERT INTO games.boxscore (goal_data)
VALUES (ARRAY  [5, 10])

UPDATE games.boxscore 
SET goal_data = goal_data || array[23];



-- DROP THE games.boxscore_goals TABLE
DROP TABLE games.boxscore_goals ;


-- CREATE THE games.boxscore_goals TABLE for players
CREATE TABLE games.boxscore_goals (
id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
game_id_fk uuid REFERENCES games.games(id),
goal_scored_player_id_fk uuid REFERENCES players.player_profiles(id),
goal_scored_player_name TEXT ,
goal_period INTEGER NOT NULL,
goal_time TIME,
assist_player1_id_fk uuid REFERENCES players.player_profiles(id) ,
assist_player1_name TEXT ,
assist_player2_id_fk uuid REFERENCES players.player_profiles(id) ,
assist_player2_name TEXT 
);


-- INSERT VALUES INTO THE games.boxscore_goals TABLE
INSERT INTO games.boxscore_goals (
    game_id_fk, 
    goal_scored_player_id_fk, 
    goal_period, 
    goal_time, 
    assist_player1_id_fk,
    assist_player2_id_fk
)
VALUES 
(
    '23b2910b-e582-4ba8-8ccb-911ed4e2e109',
    'ad65cc6d-87f2-416e-9c8c-4d7a65df6094',
    2,
    '12:30',
    'abf8f724-d853-401b-b636-accaba39e5e1',
    '66e802a2-661a-4e00-ad13-2ef6a9edcd1f'
);


-- CREATION OF FUNCTION FOR TRIGGER
CREATE OR REPLACE FUNCTION fn_update_goal_scored_player_name()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update the goal_scored_player_name in games.boxscore_goals
    UPDATE games.boxscore_goals AS bg
    SET goal_scored_player_name = (
        SELECT concat(pp.first_name,' ', pp.last_name)
        FROM players.player_profiles AS pp
        WHERE bg.goal_scored_player_id_fk = pp.id
    );
   
      UPDATE games.boxscore_goals AS bg
    SET assist_player1_name = (
        SELECT concat(pp.first_name,' ', pp.last_name)
        FROM players.player_profiles AS pp
        WHERE bg.assist_player1_id_fk = pp.id
    );
   
      UPDATE games.boxscore_goals AS bg
    SET assist_player2_name = (
        SELECT concat(pp.first_name,' ', pp.last_name)
        FROM players.player_profiles AS pp
        WHERE bg.assist_player2_id_fk = pp.id
    );
    

    RETURN NEW;
END;
$$;

-- CREATION OF TRIGGER WHICH CALLS THE FUNCTION
CREATE TRIGGER trigger_update_goal_scored_player_name
AFTER INSERT ON games.boxscore_goals
FOR EACH ROW
EXECUTE FUNCTION fn_update_goal_scored_player_name();


-- DROP THE TRIGGER IF IT ALREADY EXISTS
DROP TRIGGER IF EXISTS trigger_update_goal_scored_player_name ON games.boxscore_goals;

-- SELECT DATA FROM games.boxscore_goals ;
SELECT * FROM games.boxscore_goals ;


SELECT bg.*, g.winning_team_long , g.losing_team_long 
FROM games.boxscore_goals bg
LEFT JOIN games.games g
ON g.id = bg.game_id_fk;


-- DROP games.boxscore_saves TABLE
DROP TABLE games.boxscore_saves;


-- CREATE THE games.boxscore_goals TABLE for goalies
CREATE TABLE games.boxscore_saves (
id uuid DEFAULT uuid_generate_v4 () PRIMARY KEY,
game_id_fk uuid REFERENCES games.games(id),
goalie_id_fk uuid REFERENCES players.player_profiles(id),
goalie_name TEXT,
shots_against SMALLINT NOT NULL,
goals_against SMALLINT NOT NULL,
saves SMALLINT NOT NULL GENERATED ALWAYS AS (shots_against - goals_against) STORED,
save_percentage NUMERIC (6,3) NOT NULL GENERATED ALWAYS AS ((shots_against - goals_against) / shots_against) STORED
);

-- CREATION OF FUNCTION FOR TRIGGER INTO goals.boxscore_saves TABLE
CREATE OR REPLACE FUNCTION fn_update_goalie_name()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update the goal_scored_player_name in games.boxscore_goals
    UPDATE games.boxscore_saves AS bs
    SET goalie_name = (
        SELECT concat(pp.first_name,' ', pp.last_name)
        FROM players.player_profiles AS pp
        WHERE bs.goalie_id_fk = pp.id
    );
   
    RETURN NEW;
END;
$$;

-- CREATION OF TRIGGER WHICH CALLS THE FUNCTION
CREATE TRIGGER trigger_update_goalie_name
AFTER INSERT ON games.boxscore_saves
FOR EACH ROW
EXECUTE FUNCTION fn_update_goalie_name();


-- DROP THE TRIGGER IF IT ALREADY EXISTS
DROP TRIGGER IF EXISTS trigger_update_goal_scored_player_name ON games.boxscore_goals;


INSERT INTO games.boxscore_saves (game_id_fk, goalie_id_fk, shots_against, goals_against)
VALUES (
'53328d9b-134a-4683-9d09-b22bb0a7436a',
'867b9818-c35f-4e6a-a80f-7880d2d98db8',
10,
1
);

INSERT INTO games.boxscore_saves (game_id_fk, goalie_id_fk, shots_against, goals_against)
VALUES (
'b675d0df-c775-460a-8013-55c91baaf671',
'867b9818-c35f-4e6a-a80f-7880d2d98db8',
23,
0
);

-- Retrieve Goalie Saves Data
SELECT *
FROM games.boxscore_saves;

SELECT *
FROM games.boxscore_goals ;

-- Update the calculation of the save_percentage column
ALTER TABLE games.boxscore_saves
DROP COLUMN save_percentage;


-- Distinct player position
SELECT DISTINCT player_position 
FROM teams.rosters
WHERE sport ILIKE 'hockey'
AND
player_profile_id_fk = '867b9818-c35f-4e6a-a80f-7880d2d98db8'


-- Goalie Stats SQL Query
SELECT g.season, concat (tr.first_name, ' ', tr.last_name) AS player_name, tr.actual_team_name , t.team_name_full, t.team_name_short  , tr.team_id_fk, t.team_level, tr.division_level_fk , tr.player_position, t.logo_image, t.primary_team_color, t.secondary_team_color, t.third_team_color, sum(bs.shots_against) AS stats_shots_against, sum(bs.goals_against) AS stats_goals_against, sum(bs.saves) AS stats_saves, (100.0 * sum(bs.saves) / sum(bs.shots_against))::numeric(5,3) AS stats_save_percentage 
FROM (
SELECT *
FROM games.boxscore_saves bs
WHERE goalie_id_fk = '867b9818-c35f-4e6a-a80f-7880d2d98db8'
) bs
LEFT JOIN games.games g
ON g.id = bs.game_id_fk 
LEFT JOIN teams.rosters tr
ON bs.goalie_id_fk = tr.player_profile_id_fk AND tr.season = g.season 
LEFT JOIN teams.teams t
ON t.id = tr.team_id_fk 
GROUP BY g.season, concat (tr.first_name, ' ', tr.last_name), tr.actual_team_name, t.team_name_short , t.team_name_full , tr.team_id_fk, t.team_level ,tr.division_level_fk , tr.player_position, t.logo_image, t.primary_team_color, t.secondary_team_color, t.third_team_color;


-- Action images by season
SELECT *
FROM players.player_images
WHERE player_profile_id_fk = '867b9818-c35f-4e6a-a80f-7880d2d98db8'
AND sport ILIKE 'hockey'
ORDER BY season DESC; 





-- Goalie games played, wins and losses and shut outs
SELECT goalie_name, season, count(game_id_fk) AS games_played, sum(wins_losses) AS wins, count(game_id_fk) - sum(wins_losses) AS losses, sum(shots_against) AS shots_against, sum(goals_against) AS goals_against, (1.0 * sum(goals_against) / count(game_id_fk))::numeric(5, 2) AS goals_against_avg, sum(saves) AS saves, ((100.0 * sum(saves)) / sum(shots_against))::numeric(5,3) AS save_percentage, sum(shutouts) AS shutouts
FROM (
SELECT bs.*, g.season, r.team_id_fk AS player_team_id, g.winning_team_id_fk AS winning_team_id , g.winning_team_long AS winning_team_long , g.winning_team_short AS winning_team_short,
CASE 
	WHEN g.winning_team_id_fk = r.team_id_fk 
	THEN 1
	ELSE 0
END AS wins_losses,
CASE
	WHEN g.winning_team_id_fk = r.team_id_fk
	AND LEAST (g.home_team_score, g.visitor_team_score) = 0
	THEN 1
	ELSE 0
END AS shutouts
FROM games.boxscore_saves bs
LEFT JOIN games.games g
ON g.id = bs.game_id_fk
LEFT JOIN teams.rosters r
ON r.player_profile_id_fk = bs.goalie_id_fk AND r.season = g.season  
WHERE bs.goalie_id_fk = '867b9818-c35f-4e6a-a80f-7880d2d98db8'
) AS subquery
GROUP BY goalie_name,season


SELECT *
FROM games.boxscore_saves 

ALTER TABLE games.boxscore_saves 
ADD COLUMN "start" boolean

UPDATE games.boxscore_saves 
SET "start" = TRUE
WHERE goalie_id_fk = '867b9818-c35f-4e6a-a80f-7880d2d98db8'



