require('dotenv').config(); // Requirement to be able to use .env file so we can reference passwords without displaying them in code.
const express = require('express');
const app = express();
const path = require('path');
const APIRouter = express.Router();
var logger = require('tracer').console(); // Logger so you can see code line numbers in Node.js. Need to use logger.log instead of console.log though. Must download Tracer from npm using npm i tracer
var cors = require('cors');
app.use(cors());
const url = require('url');
const sqlQueries = require('./SqlQueries/sqlQueries');

const port = process.env.PORT || 3000;
logger.log(port);

app.get(`/api/hockey/team-records`, async (req, res) => {
  const { date, level, division, season, gameType } = req.query; // Destructure req.query items
  logger.log(date, level, division, season, gameType);

  const records = await sqlQueries.getTeamRecords(
    date,
    level,
    division,
    season,
    gameType
  );
  logger.log(records);
  return res.json(records);
});

app.get(`/api/hockey/scores`, async (req, res) => {
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

app.get(`/api/hockey/levels`, async (req, res) => {
  const levels = await sqlQueries.getAllLevels();
  return res.json(levels);
});

app.get(`/api/:sport/divisions`, async (req, res) => {
  const sport = req.params.sport;
  const divisions = await sqlQueries.getAllDivisions(sport);
  return res.json(divisions);
});

app.get(`/api/hockey/seasons`, async (req, res) => {
  const seasons = await sqlQueries.getAllSeasons();
  return res.json(seasons);
});

// Endpoint returns all teams based on certain level (i.e. B, BB, A, AA, AAA)
app.get(`/api/hockey/teams`, async (req, res) => {
  const level = req.query.level;
  const teams = await sqlQueries.getAllTeams(level);
  return res.json(teams);
});

// Endpoint returns all teams that played based on a certain season, level and division. Not all teams have a team each season so this retrieves the teams that played in that season
app.get(`/api/:sport/teams-season`, async (req, res) => {
  const sport = req.params.sport;
  const { season, level, division } = req.query;

  const teams = await sqlQueries.getTeamsForSeason(
    sport,
    season,
    level,
    division
  );
  return res.json(teams);
});

app.get(`/api/hockey/teams/fullNames`, async (req, res) => {
  const teams = await sqlQueries.getAllTeamsFullNames();
  return res.json(teams);
});

app.get(`/api/hockey/teams/:team/roster`, async (req, res) => {
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

app.get(`/api/hockey/teams/:team/multiple-team-names`, async (req, res) => {
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

app.get(`/api/:sport/standings`, async (req, res) => {
  const sport = req.params.sport;
  const { season, level, division, gameType } = req.query;
  logger.log(sport);
  logger.log(season);
  logger.log(level);
  logger.log(division);
  logger.log(gameType);

  const records = await sqlQueries.getTeamRecords(
    '',
    level,
    division,
    season,
    gameType
  );

  const points = await sqlQueries.getStandingsPoints(
    sport,
    season,
    level,
    division,
    gameType
  );
  logger.log(records);
  return res.json({ records: records, points: points });
});

app.get(`/api/:sport/teams/GF_GA_DIFF`, async (req, res) => {
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

app.get(`/api/:sport/teams/home-records`, async (req, res) => {
  const sport = req.params.sport;
  const { season, level, division, gameType } = req.query;
  logger.log(sport);
  logger.log(season, level, division);
  const data = await sqlQueries.getHomeWinsLossRecords(
    sport,
    season,
    level,
    division,
    gameType
  );
  return res.json(data);
});

app.get(`/api/:sport/teams/away-records`, async (req, res) => {
  const sport = req.params.sport;
  const { season, level, division, gameType } = req.query;
  logger.log(sport);
  logger.log(season, level, division);
  const data = await sqlQueries.getAwayWinsLossRecords(
    sport,
    season,
    level,
    division,
    gameType
  );
  return res.json(data);
});

app.get(`/api/:sport/teams/last-10-streak`, async (req, res) => {
  const sport = req.params.sport;
  const { season, level, division, team, earliestGame, limit } = req.query;
  logger.log(sport);
  logger.log(season, level, division, team, earliestGame);
  const data = await sqlQueries.getLast10Streak(
    sport,
    season,
    level,
    division,
    team,
    earliestGame,
    limit
  );
  return res.json(data);
});

app.get(`/api/:sport/teams/game-streak`, async (req, res) => {
  const sport = req.params.sport;
  const { season, level, division, team, gameType } = req.query;

  const data = await sqlQueries.getTeamStreak(
    sport,
    season,
    level,
    division,
    team,
    gameType
  );
  return res.json(data);
});

app.get('/api/:sport/player/:playerID', async (req, res) => {
  const { sport, playerID } = req.params;
  logger.log(sport, playerID);
  const playerPositionResponse = await sqlQueries.getPlayerPosition(
    sport,
    playerID
  );
  const playerPosition = playerPositionResponse[0].player_position; // playerPositionResponse is returned as an array of objects such as [ {player_position: 'goalie'} ]
  const playerCareerStats = await sqlQueries.getPlayerCareerStats(
    sport,
    playerPosition,
    playerID
  );
  const playerImages = await sqlQueries.getPlayerImages(sport, playerID);
  const playerAttributes = await sqlQueries.getPlayerAttributes(
    sport,
    playerID
  );
  return res.json({
    stats: playerCareerStats,
    images: playerImages,
    playerAttributes: playerAttributes,
  });
});

// Gets player images
app.get('/api/:sport/player/:playerID/images', async (req, res) => {
  const { sport, playerID } = req.params;
  const playerImages = await sqlQueries.getPlayerImages(sport, playerID);
  return res.json(playerImages);
});

// Gets player highlight videos
app.get('/api/:sport/player/:playerID/highlights', async (req, res) => {
  const { sport, playerID } = req.params;
  const playerHighlights = await sqlQueries.getPlayerHighlightVideos(
    sport,
    playerID
  );
  return res.json(playerHighlights);
});

//? DEPLOYMENT CODE FOR PRODUCTION - No Need to Modify This Code
if (process.env.NODE_ENV === 'production') {
  // When .env file has NODE_ENV=production in it run this code below (we must put this in our .env file for when deploying)
  app.use(express.static(path.join(__dirname, '/client/build'))); // When .env file has NODE_ENV=production then look for the static file in the /client/build folder. This folder won't be there until you go into the client folder and run npm run build command in Terminal.

  // Code below activates our React front-end. Any routes not shown above in API routes this code will send a file from the /client/build/index.html file which is basically our React front-end files
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.listen(port, () => {
  logger.log(`Server is listening on port ${port}`);
});
