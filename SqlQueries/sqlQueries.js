const { Pool } = require('pg');
var logger = require('tracer').console(); // Logger so you can see code line numbers in Node.js. Need to use logger.log instead of console.log though. Must download Tracer from npm using npm i tracer

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
              FROM rosters
              ORDER BY 1 DESC;
              `);
      return response.rows;
    } catch (error) {
      throw error;
    }
  },
  getAllTeams: async () => {
    try {
      response = await pool.query(` 
              SELECT sport, team_name_short, team_name_full, logo_image
              FROM teams
              WHERE sport = 'Hockey'
              GROUP BY sport, team_name_short,team_name_full, logo_image
              ORDER BY team_name_short;
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
              FROM teams
              WHERE sport = 'Hockey'
              GROUP BY sport, team_name_short,team_name_full, logo_image
              ORDER BY team_name_full;
        `);
      return response.rows;
    } catch (error) {
      throw error;
    }
  },
  getSingleTeamRoster: async (team) => {
    try {
      //   await logger.log(team.toUpperCase());
      const teamToQuery = team.toUpperCase();
      logger.log(teamToQuery);
      //   const teamToRetrieve = team.toUpperCase();
      response = await pool.query(`
      SELECT r.*, p.date_of_birth, p.height_inches, p.weight_lbs, t.team_name_full, t.team_name_short 
      FROM rosters r
      LEFT JOIN player_profiles p
      ON player_profile_id_fk = p.id
      LEFT JOIN teams t
      ON team_id_fk = t.id
      WHERE team_name_short ILIKE '${teamToQuery}'
      ORDER BY r.first_name;
        `);
      logger.log(response.rows[0]);
      return response.rows;
    } catch (error) {
      throw error;
    }
  },
};
