let { response } = require('express');
const { Pool } = require('pg');
let logger = require('tracer').console(); // Logger so you can see code line numbers in Node.js. Need to use logger.log instead of console.log though. Must download Tracer from npm using npm i tracer

const config = {
  host: 'postgres-server-smv.postgres.database.azure.com',
  user: process.env.AZURE_USERNAME,
  password: process.env.AZURE_PASSWORD,
  database: process.env.AZURE_DATABASE,
  port: 5432,
  ssl: true,
};

const pool = new Pool(config);

module.exports = {
  getAllSeasons: async () => {
    try {
      response = await pool.query(`SELECT DISTINCT season
              FROM teams.rosters
              ORDER BY 1 DESC;
              `);
      return response.rows;
    } catch (error) {
      throw error;
    }
  },

  getAllLevels: async () => {
    try {
      response = await pool.query(`
      SELECT DISTINCT team_level
      FROM teams.teams
      ORDER BY team_level;
      `);
      return response.rows;
    } catch (error) {
      throw error;
    }
  },

  getAllTeams: async (level) => {
    try {
      const queryWithLevel = `SELECT id, sport, team_name_short, team_name_full, logo_image, primary_team_color, secondary_team_color, third_team_color
                              FROM teams.teams
                              WHERE sport = 'Hockey'
                              AND team_level = '${level}'
                              GROUP BY id, sport, team_name_short,team_name_full, logo_image, primary_team_color, secondary_team_color, third_team_color 
                              ORDER BY team_name_short;`;

      const queryWithoutLevel = `SELECT DISTINCT sport, team_name_short, logo_image , primary_team_color, secondary_team_color , third_team_color  
      FROM teams.teams
      ORDER BY team_name_short  ;`;

      const sqlQueryStatement = level ? queryWithLevel : queryWithoutLevel;

      response = await pool.query(sqlQueryStatement);
      return response.rows;
    } catch (error) {
      throw error;
    }
  },

  getAllDivisions: async (sport) => {
    try {
      response = await pool.query(`
      SELECT *, age_group || ' - ' || division_level AS division_age
      FROM divisions.divisions
      WHERE sport ILIKE '${sport}';
      `);
      return response.rows;
    } catch (error) {
      throw error;
    }
  },

  getAllTeamsFullNames: async () => {
    try {
      response = await pool.query(`
          SELECT sport, team_name_short, team_name_full, logo_image
              FROM teams.teams
              WHERE sport = 'Hockey'
              GROUP BY sport, team_name_short,team_name_full, logo_image
              ORDER BY team_name_full;   
              `);
      return response.rows;
    } catch (error) {
      throw error;
    }
  },

  getMultipleTeamNames: async (season, level, team, division) => {
    try {
      const teamToQuery = team.toUpperCase();
      response = await pool.query(`
      SELECT DISTINCT r.actual_team_name
      FROM teams.rosters r
      JOIN teams.teams t
      ON r.team_id_fk = t.id
      WHERE t.team_name_short ILIKE '${teamToQuery}'
      AND t.team_level = '${level}'
      AND r.season = '${season}'
      AND r.division_level_fk = '${division}'
      ;
      `);
      // logger.log(
      //   `This is the team names array --> ${JSON.stringify(response.rows)}`
      // );
      return response.rows;
    } catch (error) {
      throw error;
    }
  },

  // Always retrieve Team(1) if it is a team with multiple teams
  getSingleTeamRoster: async (team, season, level, division) => {
    try {
      const moreThanOneTeamFlag = team.includes('('); // If true then just query team directly vs. doing a general search on ducks and ducks(1)
      logger.log(`More than one team Flag --> ${moreThanOneTeamFlag}`);
      const teamToQuery = team.toUpperCase();
      const query = moreThanOneTeamFlag
        ? `SELECT r.*,
      p.date_of_birth,
      p.height_inches,
      p.weight_lbs,
      t.team_name_full,
      t.team_name_short,
      t.team_level,
      t.primary_team_color,
      t.secondary_team_color,
      t.third_team_color,
      a.profile_img_1,
      a.profile_img_2,
      a.profile_img_3,
      a.profile_img_4,
      a.profile_img_5,
      a.action_img_1,
      a.action_img_2,
      a.action_img_3,
      a.action_img_4,
      a.action_img_5,
      a.action_img_6,
      a.action_img_7,
      a.action_img_8,
      a.action_img_9,
      a.action_img_10
    FROM teams.rosters r
    LEFT JOIN players.player_profiles p ON player_profile_id_fk = p.id
    LEFT JOIN teams.teams t ON team_id_fk = t.id
    LEFT JOIN players.player_images a ON r.player_profile_id_fk = a.player_profile_id_fk
    WHERE r.actual_team_name ILIKE '${teamToQuery}'
      AND (r.season = '${season}'
                AND t.team_level = '${level}'
                AND r.division_level_fk = '${division}')
    ORDER BY r.first_name
    ;`
        : `SELECT r.*,
        p.date_of_birth,
        p.height_inches,
        p.weight_lbs,
        t.team_name_full,
        t.team_name_short,
        t.team_level,
        t.primary_team_color,
        t.secondary_team_color,
        t.third_team_color,
        a.profile_img_1,
        a.profile_img_2,
        a.profile_img_3,
        a.profile_img_4,
        a.profile_img_5,
        a.action_img_1,
        a.action_img_2,
        a.action_img_3,
        a.action_img_4,
        a.action_img_5,
        a.action_img_6,
        a.action_img_7,
        a.action_img_8,
        a.action_img_9,
        a.action_img_10
      FROM teams.rosters r
      LEFT JOIN players.player_profiles p ON player_profile_id_fk = p.id
      LEFT JOIN teams.teams t ON team_id_fk = t.id
      LEFT JOIN players.player_images a ON r.player_profile_id_fk = a.player_profile_id_fk
      WHERE (r.actual_team_name ILIKE '${teamToQuery}'
      OR r.actual_team_name ILIKE '%${teamToQuery}(1)')
        AND (r.season = '${season}'
                  AND t.team_level = '${level}'
                  AND r.division_level_fk = '${division}')
      ORDER BY r.first_name
      ;`;
      response = await pool.query(query);
      logger.log(JSON.stringify(response.rows));
      return response.rows;
    } catch (error) {
      throw error;
    }
  },

  getScores: async (date, team_level, division) => {
    try {
      logger.log(date);
      logger.log(team_level);
      logger.log(division);
      const response = await pool.query(`
      SELECT g.*, t_home.logo_image AS home_team_logo, t_visitor.logo_image AS visitor_team_logo
      FROM games.games g
      LEFT JOIN teams.teams t_home ON g.home_team_id_fk = t_home.id
      LEFT JOIN teams.teams t_visitor ON g.visitor_team_id_fk = t_visitor.id
      WHERE g.game_date = '${date}' AND g.team_level = '${team_level}' AND g.division = '${division}';`);
      return response.rows;
    } catch (error) {
      console.error(error);
    }
  },

  getTeamRecords: async (date, level, division, season) => {
    try {
      const wins = await pool.query(`
      SELECT winning_team_long, winning_team_short, count(*) 
      FROM games.games
      WHERE season = '${season}'
      AND game_date <= '${date}'
      AND team_level = '${level}'
      AND division = '${division}'
      GROUP BY winning_team_long, winning_team_short
      ORDER BY winning_team_long;
      `);
      const losses = await pool.query(`
      SELECT losing_team_long, losing_team_short, count(*) 
      FROM games.games 
      WHERE season = '${season}'
      AND game_date <= '${date}'
      AND team_level = '${level}'
      AND division = '${division}'
      GROUP BY losing_team_long, losing_team_short
      ORDER BY losing_team_long;
      `);
      const ties = await pool.query(`
      SELECT home_team_long, home_team_short, visitor_team_long, visitor_team_short, tie 
      FROM games.games 
      WHERE season = '${season}'
      AND game_date <= '${date}'
      AND tie = TRUE 
      AND team_level = '${level}'
      AND division = '${division}'
      GROUP BY home_team_long, home_team_short, visitor_team_long, visitor_team_short, tie
      ORDER BY home_team_long;
      `);
      return [wins.rows, losses.rows, ties.rows];
    } catch (error) {
      logger.log(error);
    }
  },

  getStandings: async (sport, season, level, division) => {
    try {
      const response = await pool.query(`

   SELECT teams.team_name_long, teams.team_name_short, games_played, teams.total_wins, COALESCE(losses.total_losses, 0) AS total_losses, COALESCE(ties.total_ties, 0) AS total_ties, COALESCE (points.total_points, 0) AS total_points
   FROM (
       SELECT winning_team_long AS team_name_long, winning_team_short AS team_name_short, COUNT(winning_team_points) AS total_wins
       FROM games.games
       WHERE sport ILIKE '${sport}'
       AND season = '${season}'
       AND team_level = '${level}'
       AND division = '${division}'
       GROUP BY winning_team_long, winning_team_short
   ) teams
   LEFT JOIN (
       SELECT losing_team_long AS team_name_long, losing_team_short AS team_name_short, COUNT(losing_team_points) AS total_losses
       FROM games.games
       WHERE sport ILIKE '${sport}'
       AND season = '${season}'
       AND team_level = '${level}'
       AND division = '${division}'
       GROUP BY losing_team_long, losing_team_short
   ) losses ON teams.team_name_long = losses.team_name_long
   LEFT JOIN (
       SELECT team_name_long AS team_name_long, team_name_short AS team_name_short, sum(total_ties) AS total_ties
       FROM (
           SELECT home_team_long AS team_name_long, home_team_short AS team_name_short, COUNT(*) AS total_ties
           FROM games.games
           WHERE sport ILIKE '${sport}'
           AND season = '${season}'
           AND team_level = '${level}'
           AND division = '${division}'
           AND tie = TRUE
           GROUP BY home_team_long, home_team_short

           UNION ALL

           SELECT visitor_team_long AS team_name_long, visitor_team_short AS team_name_short, COUNT(*) AS total_ties
           FROM games.games
           WHERE sport ILIKE '${sport}'
           AND season = '${season}'
           AND team_level = '${level}'
           AND division = '${division}'
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
       WHERE sport ILIKE '${sport}'
       AND season = '${season}'
       AND team_level = '${level}'
       AND division = '${division}'
       GROUP BY winning_team_long, winning_team_short

       UNION ALL

       SELECT losing_team_long AS team_long, losing_team_short AS team_short, sum(losing_team_points) AS points
       FROM games.games
       WHERE sport ILIKE '${sport}'
       AND season = '${season}'
       AND team_level = '${level}'
       AND division = '${division}'
       GROUP BY losing_team_long, losing_team_short

       UNION ALL

       SELECT home_team_long AS team_long, home_team_short AS team_short, 1 AS points
       FROM games.games
       WHERE sport ILIKE '${sport}'
       AND season = '${season}'
       AND team_level = '${level}'
       AND division = '${division}'
       AND tie = TRUE

       UNION ALL

       SELECT visitor_team_long AS team_long, visitor_team_short , 1 AS points
       FROM games.games
       WHERE sport ILIKE '${sport}'
       AND season = '${season}'
       AND team_level = '${level}'
       AND division = '${division}'
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
        `);
      return response.rows;
    } catch (error) {
      logger.log(error);
    }
  },

  getGoalsData_GA_GF_DIFF: async (sport, season, level, division) => {
    try {
      const response = await pool.query(`
      SELECT team_long, team_short, sum(GF) AS "GF", sum(GA) AS "GA", sum(GF - GA) AS "DIFF"
      FROM (
      SELECT home_team_long AS team_long, home_team_short AS team_short, sum(home_team_score ) AS GF, sum(visitor_team_score) AS GA, sum(home_team_score - visitor_team_score)
      FROM games.games
      WHERE sport ILIKE '${sport}'
      AND team_level = '${level}' 
      AND division = '${division}' 
      AND season = '${season}'
      GROUP BY home_team_long, home_team_short
      
      UNION ALL 
      
      SELECT visitor_team_long AS team_long, visitor_team_short AS team_short, sum(visitor_team_score) AS GF, sum(home_team_score) AS GA, sum(visitor_team_score - home_team_score)
      FROM games.games
      WHERE sport ILIKE '${sport}'
      AND team_level = '${level}' 
      AND division = '${division}' 
      AND season = '${season}'
      GROUP BY visitor_team_long, visitor_team_short
      
      ) AS gf_ga_table
      GROUP BY team_long, team_short
      ORDER BY "DIFF" DESC ;`);
      return response.rows;
    } catch (error) {
      logger.log(error);
    }
  },

  getHomeWinsLossRecords: async (sport, season, level, division) => {
    try {
      const response = await pool.query(`
      SELECT id AS game_id, home_team_short, home_team_long ,  winning_team_short, winning_team_long, tie
      FROM games.games
      WHERE sport ILIKE '${sport}'
      AND team_level = '${level}' 
      AND division = '${division}' 
      AND season = '${season}'
      ORDER BY home_team_short, home_team_long ;`);
      return response.rows;
    } catch (error) {
      logger.log(error);
    }
  },

  getAwayWinsLossRecords: async (sport, season, level, division) => {
    try {
      const response = await pool.query(`
      SELECT id, visitor_team_short, visitor_team_long ,  winning_team_short, winning_team_long, tie
      FROM games.games
      WHERE sport ILIKE '${sport}'
      AND team_level = '${level}' 
      AND division = '${division}' 
      AND season = '${season}'
      ORDER BY visitor_team_short, visitor_team_long ;`);
      return response.rows;
    } catch (error) {
      logger.log(error);
    }
  },

  getLast10Streak: async (
    sport,
    season,
    level,
    division,
    team,
    earliestGame
  ) => {
    try {
      logger.log(sport, season, level, division, team, earliestGame);
      let query = `
        SELECT *
        FROM games.games
        WHERE sport ILIKE '${sport}'
        AND ((home_team_long = '${team}' OR visitor_team_long = '${team}') OR (home_team_short = '${team}' OR visitor_team_short = '${team}'))
        AND team_level = '${level}' 
        AND division = '${division}' 
        AND season = '${season}'
      `;

      if (earliestGame) {
        query += ` AND game_date < '${earliestGame}'`;
      }

      query += `
        ORDER BY game_date DESC
        LIMIT 10;
      `;

      const response = await pool.query(query);
      return response.rows;
    } catch (error) {
      logger.log(error);
    }
  },
};
