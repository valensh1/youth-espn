require('dotenv').config(); // Requirement to be able to use .env file so we can reference passwords without displaying them in code.
const express = require('express');
const app = express();
const APIRouter = express.Router();
var logger = require('tracer').console(); // Logger so you can see code line numbers in Node.js. Need to use logger.log instead of console.log though. Must download Tracer from npm using npm i tracer
var cors = require('cors');
app.use(cors());
const url = require('url');

const sqlQueries = require('./SqlQueries/sqlQueries');

app.listen(5001);

app.get('/api/hockey/team-records', async (req, res) => {
  const { date, level, division, season } = req.query; // Destructure req.query items
  const records = await sqlQueries.getTeamRecords(
    date,
    level,
    division,
    season
  );
  logger.log(records);
  return res.json(records);
});

app.get('/api/hockey/scores', async (req, res) => {
  const dateToQuery = req.query.date;
  const levelToQuery = req.query.level;
  const divisionToQuery = req.query.division;
  logger.log(dateToQuery);
  logger.log(levelToQuery);
  logger.log(divisionToQuery);
  const scores = await sqlQueries.getScores(
    dateToQuery,
    levelToQuery,
    divisionToQuery
  );
  logger.log(scores);
  return res.json(scores);
});

app.get('/api/hockey/levels', async (req, res) => {
  const levels = await sqlQueries.getAllLevels();
  return res.json(levels);
});

app.get(`/api/:sport/divisions`, async (req, res) => {
  const sport = req.params.sport;
  const divisions = await sqlQueries.getAllDivisions(sport);
  return res.json(divisions);
});

app.get('/api/hockey/seasons', async (req, res) => {
  const seasons = await sqlQueries.getAllSeasons();
  return res.json(seasons);
});

app.get('/api/hockey/teams', async (req, res) => {
  const level = req.query.level;
  const teams = await sqlQueries.getAllTeams(level);
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
  const divisionToQuery = req.query.division;
  // logger.log(levelToQuery);
  const team = req.params.team;
  const teamToQuery = req.query.teamToQuery ? req.query.teamToQuery : team; // On initial load there is no req.query params. Req.params does NOT happen until the user selects a team from the drop-down menu. So if no req.params then just take the team from the url path.
  logger.log(
    `These are the query items -> ${teamToQuery}, ${seasonToQuery}, ${levelToQuery}, ${divisionToQuery}`
  );
  const singleTeamRoster = await sqlQueries.getSingleTeamRoster(
    teamToQuery,
    seasonToQuery,
    levelToQuery,
    divisionToQuery
  );
  return res.json(singleTeamRoster);
});

app.get('/api/hockey/teams/:team/multiple-team-names', async (req, res) => {
  const team = req.params.team;
  const level = req.query.level;
  const division = req.query.division;
  const season = req.query.season;
  logger.log(`This is the team to query --> ${team}`);
  logger.log(`This is the level to query --> ${level} `);
  logger.log(`This is the division to query --> ${division} `);
  const multipleTeamNames = await sqlQueries.getMultipleTeamNames(
    season,
    level,
    team,
    division
  );
  logger.log(multipleTeamNames);
  return res.json(multipleTeamNames);
});

app.get('/api/:sport/standings', async (req, res) => {
  const sport = req.params.sport;
  const { season, level, division } = req.query;
  logger.log(sport);
  logger.log(season);
  logger.log(level);
  logger.log(division);
  const standings = await sqlQueries.getStandings(
    sport,
    season,
    level,
    division
  );
  return res.json(standings);
});

app.get('/api/:sport/teams/GF_GA_DIFF', async (req, res) => {
  const sport = req.params.sport;
  const { season, level, division } = req.query;
  const goalsData = await sqlQueries.getGoalsData_GA_GF_DIFF(
    sport,
    season,
    level,
    division
  );
  return res.json(goalsData);
});

app.get('/api/:sport/teams/home-records', async (req, res) => {
  const sport = req.params.sport;
  const { season, level, division } = req.query;
  logger.log(sport);
  logger.log(season, level, division);
  const data = await sqlQueries.getHomeWinsLossRecords(
    sport,
    season,
    level,
    division
  );
  return res.json(data);
});

app.get('/api/:sport/teams/away-records', async (req, res) => {
  const sport = req.params.sport;
  const { season, level, division } = req.query;
  logger.log(sport);
  logger.log(season, level, division);
  const data = await sqlQueries.getAwayWinsLossRecords(
    sport,
    season,
    level,
    division
  );
  return res.json(data);
});

app.get('/api/:sport/teams/last-10-streak', async (req, res) => {
  const sport = req.params.sport;
  const { season, level, division, team, earliestGame } = req.query;
  logger.log(sport);
  logger.log(season, level, division, team, earliestGame);
  const data = await sqlQueries.getLast10Streak(
    sport,
    season,
    level,
    division,
    team,
    earliestGame
  );
  return res.json(data);
});
