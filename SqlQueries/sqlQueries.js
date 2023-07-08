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

  getTeamsForSeason: async (sport, season, level, division) => {
    try {
      response = await pool.query(`
      SELECT team_long, team_short, logo_image, primary_team_color, secondary_team_color, third_team_color
      FROM 
      (
      SELECT home_team_long AS team_long, home_team_short AS team_short
      FROM games.games
      WHERE sport ILIKE '${sport}'
      AND season = '${season}'
      AND team_level = '${level}'
      AND division = '${division}'
      AND game_type = 'Regular Season'
      GROUP BY team_long, team_short

      UNION ALL 

      SELECT visitor_team_long AS team_long, visitor_team_short AS team_short
      FROM games.games
      WHERE sport ILIKE '${sport}'
      AND season = '${season}'
      AND team_level = '${level}'
      AND division = '${division}'
      AND game_type = 'Regular Season'
      GROUP BY team_long, team_short
      ) AS games

      LEFT JOIN 
      (
      SELECT team_name_full, team_name_short, logo_image, primary_team_color, secondary_team_color, third_team_color
      FROM teams.teams
      GROUP BY team_name_short, team_name_full, logo_image, primary_team_color, secondary_team_color, third_team_color
      ORDER BY team_name_short, team_name_full
      ) AS teams
      ON teams.team_name_short = games.team_short

      GROUP BY team_long, team_short ,logo_image, primary_team_color, secondary_team_color, third_team_color
      ORDER BY team_short, team_long;
      `);
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
      p.hand,
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
        p.hand,
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

  getTeamRecords: async (date = null, level, division, season, gameType) => {
    try {
      if (date) {
        const wins = await pool.query(`
          SELECT winning_team_long, winning_team_short, count(*) as wins
          FROM games.games
          WHERE season = '${season}'
          AND game_date <= '${date}'
          AND team_level = '${level}'
          AND division = '${division}'
          AND game_type = '${gameType}'
          GROUP BY winning_team_long, winning_team_short
          ORDER BY winning_team_long;
    `);
        const losses = await pool.query(`
          SELECT losing_team_long, losing_team_short, count(*)  as losses
          FROM games.games
          WHERE season = '${season}'
          AND game_date <= '${date}'
          AND team_level = '${level}'
          AND division = '${division}'
          AND game_type = '${gameType}'
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
            AND game_type = '${gameType}'
            GROUP BY home_team_long, home_team_short, visitor_team_long, visitor_team_short, tie
            ORDER BY home_team_long;
    `);
        return [wins.rows, losses.rows, ties.rows];
      } else {
        const wins = await pool.query(`
            SELECT winning_team_long as team_long, winning_team_short as team_short, count(*) as wins
            FROM games.games
            WHERE season = '${season}'
            AND team_level = '${level}'
            AND division = '${division}'
            AND game_type = '${gameType}'
            GROUP BY team_long, team_short
            ORDER BY team_long;
    `);
        const losses = await pool.query(`
            SELECT losing_team_long as team_long, losing_team_short as team_short, count(*) as losses
            FROM games.games
            WHERE season = '${season}'
            AND team_level = '${level}'
            AND division = '${division}'
            AND game_type = '${gameType}'
            GROUP BY team_long, team_short
            ORDER BY team_long;
    `);
        const ties = await pool.query(`
            SELECT team_long, team_short, sum(ties) AS ties
            FROM
            (
              SELECT home_team_long AS team_long, home_team_short AS team_short, count(*) AS ties
            FROM games.games
            WHERE tie = TRUE
            AND season = '${season}'
            AND team_level = '${level}'
            AND division = '${division}'
            AND game_type = '${gameType}'
            GROUP BY team_long , team_short

            UNION ALL

            SELECT visitor_team_long AS team_long, visitor_team_short AS team_short, count(*) AS ties
            FROM games.games
            WHERE tie = TRUE
            AND season = '${season}'
            AND team_level = '${level}'
            AND division = '${division}'
            AND game_type = '${gameType}'
            GROUP BY team_long , team_short
            ) AS ties
            GROUP BY team_long, team_short
            ORDER BY ties ;
    `);
        return { wins: wins.rows, losses: losses.rows, ties: ties.rows };
      }
    } catch (error) {
      logger.log(error);
    }
  },

  getStandingsPoints: async (sport, season, level, division, gameType) => {
    try {
      const points = await pool.query(`
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
        sport ILIKE '${sport}'
        AND season = '${season}'
        AND team_level = '${level}'
        AND division = '${division}'
        AND game_type = '${gameType}'
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
        AND sport ILIKE '${sport}'
        AND season = '${season}'
        AND team_level = '${level}'
        AND division = '${division}'
        AND game_type = '${gameType}'
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
        AND sport ILIKE '${sport}'
        AND season = '${season}'
        AND team_level = '${level}'
        AND division = '${division}'
        AND game_type = '${gameType}'
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
    sport ILIKE '${sport}'
    AND season = '${season}'
    AND team_level = '${level}'
    AND division = '${division}'
    AND game_type = '${gameType}'
    GROUP BY
      games.winning_team_long,
      games.winning_team_short,
      wins.count,
      tie_games.TIES
    ORDER BY
      points DESC;    
        `);
      return points.rows;
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
      SELECT id AS game_id, home_team_short, home_team_long , winning_team_short, winning_team_long, tie
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
    earliestGame,
    limitAmount = 10
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
        LIMIT '${limitAmount}';
      `;

      const response = await pool.query(query);
      return response.rows;
    } catch (error) {
      logger.log(error);
    }
  },

  getTeamStreak: async (sport, season, level, division, team) => {
    try {
      const response = await pool.query(`
      SELECT id, game_date, team_long, team_short, game_result 
      FROM (
        SELECT id, game_date, winning_team_long AS team_long, winning_team_short AS team_short,
              CASE 
                  WHEN winning_team_long = '${team}' OR winning_team_short = '${team}'
                  THEN 'W'
              END AS game_result
        FROM games.games
        WHERE season = '${season}'
          AND team_level = '${level}'
          AND division = '${division}'
          AND (winning_team_long = '${team}' OR winning_team_short = '${team}')
      
        UNION ALL
      
        SELECT id, game_date, losing_team_long AS team_long, losing_team_short AS team_short, 
              CASE 
                  WHEN losing_team_long = '${team}' OR losing_team_short = '${team}'
                  THEN 'L'
              END AS game_result
        FROM games.games
        WHERE season = '${season}'
          AND team_level = '${level}'
          AND division = '${division}'
          AND (losing_team_long = '${team}' OR losing_team_short = '${team}') 
          
          UNION ALL
          
          SELECT id, game_date, team_long, team_short, game_result
      FROM (
        SELECT id, game_date,
          CASE 
            WHEN (home_team_long = '${team}' OR home_team_short = '${team}')
              OR 
              (visitor_team_long = '${team}' OR visitor_team_short = '${team}')
              THEN 'Jr. Gulls'
          END AS team_long,
          CASE 
            WHEN (home_team_long = '${team}' OR home_team_short = '${team}')
              OR 
              (visitor_team_long = '${team}' OR visitor_team_short = '${team}')
              THEN 'Gulls'
          END AS team_short,
          'T' AS game_result
        FROM games.games
        WHERE season = '${season}'
        AND team_level = '${level}'
        AND division = '${division}'
          AND tie = TRUE
          ORDER BY game_date DESC
      ) AS TIES
      WHERE team_short = '${team}'
          
      ) AS combined_results
      ORDER BY game_date DESC
      ;`);
      return response.rows;
    } catch (error) {
      logger.log(error);
    }
  },
};
