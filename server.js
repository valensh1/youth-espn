require('dotenv').config(); // Requirement to be able to use .env file so we can reference passwords without displaying them in code.
const express = require('express');
const app = express();
const APIRouter = express.Router();
var logger = require('tracer').console(); // Logger so you can see code line numbers in Node.js. Need to use logger.log instead of console.log though. Must download Tracer from npm using npm i tracer
var cors = require('cors');
app.use(cors());
const sqlQueries = require('./SqlQueries/sqlQueries');

app.listen(5001);

app.get('/api/hockey/levels', async (req, res) => {
  const levels = await sqlQueries.getAllLevels();
  return res.json(levels);
});

app.get('/api/hockey/scores', async (req, res) => {
  const dateToQuery = req.query.date;
  const seasonToQuery = req.query.season;
  logger.log(dateToQuery);
  logger.log(seasonToQuery);
  logger.log(`Date to query for scores ${dateToQuery}`);
  const scores = await sqlQueries.getScores('2021-2022', '10-10-2021', 'A');
  logger.log(scores);
  return res.json(scores);
});

app.get('/api/hockey/seasons', async (req, res) => {
  const seasons = await sqlQueries.getAllSeasons();
  return res.json(seasons);
});

app.get('/api/hockey/teams', async (req, res) => {
  const teams = await sqlQueries.getAllTeams();
  return res.json(teams);
});

app.get('/api/hockey/teams/fullNames', async (req, res) => {
  const teams = await sqlQueries.getAllTeamsFullNames();
  return res.json(teams);
});

app.get('/api/hockey/teams/:team/roster', async (req, res) => {
  logger.log(req.query);
  const seasonToQuery = req.query.season;
  const levelToQuery = req.query.level;
  // logger.log(levelToQuery);
  const team = req.params.team;
  const teamToQuery = req.query.teamToQuery ? req.query.teamToQuery : team; // On initial load there is no req.query params. Req.params does NOT happen until the user selects a team from the drop-down menu. So if no req.params then just take the team from the url path.
  logger.log(
    `These are the query items -> ${teamToQuery}, ${seasonToQuery}, ${levelToQuery}`
  );
  const singleTeamRoster = await sqlQueries.getSingleTeamRoster(
    teamToQuery,
    seasonToQuery,
    levelToQuery
  );
  return res.json(singleTeamRoster);
});

app.get('/api/hockey/teams/:team/multiple-team-names', async (req, res) => {
  const team = req.params.team;
  const level = req.query.level;
  const season = req.query.season;
  logger.log(`This is the team to query --> ${team}`);
  logger.log(`This is the level to query --> ${level} `);
  const multipleTeamNames = await sqlQueries.getMultipleTeamNames(
    season,
    level,
    team
  );
  logger.log(multipleTeamNames);
  return res.json(multipleTeamNames);
});
