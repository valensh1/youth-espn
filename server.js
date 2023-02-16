require('dotenv').config(); // Requirement to be able to use .env file so we can reference passwords without displaying them in code.
const express = require('express');
const app = express();
const APIRouter = express.Router();
const pg = require('pg');
var logger = require('tracer').console(); // Logger so you can see code line numbers in Node.js. Need to use logger.log instead of console.log though. Must download Tracer from npm using npm i tracer
var cors = require('cors');
app.use(cors());

// app.listen(5000);
// app.get('/api/hockeyPlayers/teams', (req, res) => {
//   console.log('Yo yo');
//   logger.log('hello mofos!');
//   res.status(200).json({ message: 'hello there Shaun' });
// });

app.listen(5000);
app.get('/api/hockeyPlayers/teams', async (req, res) => {
  console.log('Yo yo');
  logger.log('hello mofos!');

  const config = {
    host: 'postgres-server-smv.postgres.database.azure.com',
    // Do not hard code your username and password.
    // Consider using Node environment variables.
    user: process.env.AZURE_USERNAME,
    password: process.env.AZURE_PASSWORD,
    database: process.env.AZURE_DATABASE,
    port: 5432,
    ssl: true,
  };

  const client = new pg.Client(config);
  client.connect((err) => {
    if (err) throw err;
    else {
      const query = 'SELECT * FROM player_profiles;';
      client.query(query).then((response) => {
        const rows = response.rows;
        logger.log(rows);
        res.json(rows);
      });
    }
  });
});

// SQL CONNECTION
// const config = {
//   host: 'postgres-server-smv.postgres.database.azure.com',
//   // Do not hard code your username and password.
//   // Consider using Node environment variables.
//   user: process.env.AZURE_USERNAME,
//   password: process.env.AZURE_PASSWORD,
//   database: process.env.AZURE_DATABASE,
//   port: 5432,
//   ssl: true,
// };

// const client = new pg.Client(config);

// client.connect((err) => {
//   if (err) throw err;
//   else {
//     queryDatabase();
//   }
// });

// function queryDatabase() {
//   console.log(`Running query to PostgreSQL server: ${config.host}`);

//   const query = 'SELECT * FROM player_profiles;';

//   client
//     .query(query)
//     .then((res) => {
//       const rows = res.rows;

//       rows.map((row) => {
//         console.log(`Read: ${JSON.stringify(row)}`);
//       });

//       process.exit();
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// }
