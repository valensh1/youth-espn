import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import GlobalFunctions from '../../model/globalFunctions';
import Navbar from '../../components/Navbar';

function Scores() {
  const navigate = useNavigate();
  let urlPath;

  const location = useLocation();
  const currentPath = location.pathname;
  const sportToQuery = currentPath.split('/')[1];

  const defaultLevel = 'A';
  const defaultLeague = '12U - Peewee';
  const todaysDate = GlobalFunctions.dateFormats(undefined, 0); // Passing in a blank first argument so function defaults to default argument which is the current date

  //?----------------------------------------------------------------- USE STATE HOOKS ------------------------------------------------------------------------
  const [dateOfGames, setDateOfGames] = useState({
    dateForHeader: todaysDate.dateForHeader,
    gameDate: todaysDate.gameDate,
  });
  const [dropdowns, setDropdowns] = useState({
    levels: [],
    leagues: [],
  });

  const [selections, setSelections] = useState({
    selectedLevel: defaultLevel,
    selectedLeague: defaultLeague,
  });

  //?----------------------------------------------------------------- USE REF HOOKS ------------------------------------------------------------------------

  //?----------------------------------------------------------------- USE EFFECT HOOKS ------------------------------------------------------------------------
  useEffect(() => {
    const fetchDropdownData = async () => {
      const [levelsResponse, leaguesResponse] = await Promise.all([
        fetch(`/api/${sportToQuery}/levels`),
        fetch(`/api/${sportToQuery}/leagues`),
      ]);

      const levels = await levelsResponse.json();
      const leagues = await leaguesResponse.json();
      console.log(levels);
      console.log(leagues);
      setDropdowns({ levels: levels, leagues: leagues });
    };
    fetchDropdownData();
  }, []);

  //?----------------------------------------------------------------- FUNCTIONS ------------------------------------------------------------------------
  const changeSelectedLevel = (event) => {
    setSelections({ ...selections, selectedLevel: event.target.value });
  };

  const changeSelectedLeague = (event) => {
    setSelections({ ...selections, selectedLeague: event.target.value });
  };

  const selectedDate = (event) => {
    console.log(event.target.value);
    const dates = GlobalFunctions.dateFormats(event.target.value);
    setDateOfGames({
      ...dateOfGames,
      gameDate: dates.gameDate,
      dateForHeader: dates.dateForHeader,
    });
  };
  //?----------------------------------------------------------------- JSX ------------------------------------------------------------------------
  return (
    <div id="scores-page-container">
      <Navbar />
      <div id="dropdowns-container">
        <input
          id="date-picker"
          type="date"
          onChange={selectedDate}
          value={dateOfGames.gameDate}
        />

        <select
          name="level-dropdown"
          className="filter-dropdowns"
          id="level-dropdown"
          value={selections.selectedLevel}
          onChange={changeSelectedLevel}
        >
          {dropdowns.levels.map((level) => {
            return (
              <option key={level.team_level} value={level.team_level}>
                {level.team_level}
              </option>
            );
          })}
        </select>

        <select
          name="level-dropdown"
          className="filter-dropdowns"
          id="league-dropdown"
          value={selections.selectedLeague}
          onChange={changeSelectedLeague}
        >
          {dropdowns.leagues.map((league) => {
            return (
              <option key={league.league_age} value={league.league_age}>
                {league.league_age}
              </option>
            );
          })}
        </select>
      </div>

      <div id="scoreboard-container">
        <h1 id="game-date">{dateOfGames.dateForHeader || ''}</h1>
        <div id="individual-game-container">
          <h3 id="game-status">FINAL</h3>
          <div className="team-container scoreboard-home-team-container ">
            <div className="scoreboard-team-info scoreboard-home-team-info ">
              <Link className="scoreboard-team-name-logo" to={''}>
                <img
                  src="https://i.imgur.com/x4pIvDM.png"
                  alt=""
                  className="team-logo scoreboard-team-logo"
                />
                <p className="scoreboard-team-name">Jr. Ducks(2)</p>
              </Link>
              <p className="scoreboard-record">(0-0-0)</p>
            </div>
            <div className="scoreboard-scores-container scoreboard-home-team-scores">
              <p id="home-team-score">3</p>
            </div>
          </div>
          <div className="team-container scoreboard-visitor-team-container ">
            <div className="scoreboard-team-info scoreboard-visitor-team-info ">
              <Link className="scoreboard-team-name-logo" to={''}>
                <img
                  src="https://i.imgur.com/TfJ4Gqd.png"
                  alt=""
                  className="team-logo scoreboard-team-logo"
                />
                <p className="scoreboard-team-name">Goldrush</p>
              </Link>
              <p className="scoreboard-record">(0-0-0)</p>
            </div>
            <div className="scoreboard-scores-container scoreboard-visitor-team-scores">
              <p id="visitor-team-score">4</p>
            </div>
          </div>
          <div className="scoreboard-top-players-container scoreboard-top-players">
            <div className="scoreboard-top-player">
              <Link className="player-img-name" to={''}>
                <img
                  className="player-profile-pic"
                  src={'https://i.imgur.com/aLjKQD2.jpg'}
                  alt=""
                />
              </Link>
              <div className="player-stats-info">
                <p className="">Defense - Ducks(2)</p>
                <p className="">1 Goal, 2 Assists</p>
              </div>
            </div>
            <div className="scoreboard-top-player">
              <Link className="player-img-name" to={''}>
                <img
                  className="player-profile-pic"
                  src={'https://i.imgur.com/aLjKQD2.jpg'}
                  alt=""
                />
              </Link>
              <div className="player-stats-info">
                <p className="">Defense - Ducks(2)</p>
                <p className="">1 Goal, 2 Assists</p>
              </div>
            </div>
            <div className="scoreboard-top-player">
              <Link className="player-img-name" to={''}>
                <img
                  className="player-profile-pic"
                  src={'https://i.imgur.com/aLjKQD2.jpg'}
                  alt=""
                />
              </Link>
              <div className="player-stats-info">
                <p className="">Defense - Ducks(2)</p>
                <p className="">1 Goal, 2 Assists</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Scores;
