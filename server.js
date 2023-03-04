require('dotenv').config(); // Requirement to be able to use .env file so we can reference passwords without displaying them in code.
const express = require('express');
const app = express();
const APIRouter = express.Router();
var logger = require('tracer').console(); // Logger so you can see code line numbers in Node.js. Need to use logger.log instead of console.log though. Must download Tracer from npm using npm i tracer
var cors = require('cors');
app.use(cors());
const sqlQueries = require('./SqlQueries/sqlQueries');

app.listen(5001);

app.get('/api/hockey/seasons', async (req, res) => {
  const seasons = await sqlQueries.getAllSeasons();
  // await logger.log(seasons);
  res.json(seasons);
});

app.get('/api/hockey/teams', async (req, res) => {
  const teams = await sqlQueries.getAllTeams();
  // await logger.log(teams);
  res.json(teams);
});

app.get('/api/hockey/teams/fullNames', async (req, res) => {
  const teams = await sqlQueries.getAllTeamsFullNames();
  // await logger.log(teams);
  res.json(teams);
});

app.get('/api/hockey/teams/:team/roster', async (req, res) => {
  const team = req.params.team;
  const singleTeamRoster = await sqlQueries.getSingleTeamRoster(team);
  // await logger.log(singleTeamRoster);
  res.json(singleTeamRoster);
});
