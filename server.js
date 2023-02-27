require('dotenv').config(); // Requirement to be able to use .env file so we can reference passwords without displaying them in code.
const express = require('express');
const app = express();
const APIRouter = express.Router();
const pg = require('pg');
var logger = require('tracer').console(); // Logger so you can see code line numbers in Node.js. Need to use logger.log instead of console.log though. Must download Tracer from npm using npm i tracer
var cors = require('cors');
app.use(cors());

app.listen(5001);

const config = {
  host: 'postgres-server-smv.postgres.database.azure.com',
  user: process.env.AZURE_USERNAME,
  password: process.env.AZURE_PASSWORD,
  database: process.env.AZURE_DATABASE,
  port: 5432,
  ssl: true,
};

app.get('/api/hockey/teams', async (req, res) => {
  const client = new pg.Client(config);

  client.connect((err) => {
    if (err) throw err;
    else {
      const query = `
      SELECT sport, team_name_short, logo_image
      FROM teams
      WHERE sport = 'Hockey'
      GROUP BY sport, team_name_short, logo_image
      ORDER BY team_name_short;
      `;
      client.query(query).then((response) => {
        const rows = response.rows;
        logger.log(rows);
        res.json(rows);
      });
    }
  });
});
