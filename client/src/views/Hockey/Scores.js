import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import GlobalFunctions from '../../model/globalFunctions';
import Navbar from '../../components/Navbar';

function Scores() {
  const navigate = useNavigate();

  const location = useLocation();
  const currentPath = location.pathname;
  const sportToQuery = currentPath.split('/')[1];
  const localStorageDate = localStorage.getItem('date');
  const localStorageLevel = localStorage.getItem('level');
  const localStorageDivision = localStorage.getItem('division');
  const localStorageDivisionDropdown =
    localStorage.getItem('division-dropdown');
  const defaultLevel = localStorageLevel || 'A';
  const defaultDivision = localStorageDivision || '12U - Peewee';
  const todaysDate = localStorageDate
    ? GlobalFunctions.dateFormats(localStorageDate, 1)
    : GlobalFunctions.dateFormats(undefined, 0); // Passing in a blank first argument so function defaults to default argument which is the current date

  //?----------------------------------------------------------------- USE STATE HOOKS ------------------------------------------------------------------------
  const [dateOfGames, setDateOfGames] = useState({
    dateForHeader: todaysDate.dateForHeader,
    gameDate: localStorageDate || todaysDate.gameDate,
  });
  const [dropdowns, setDropdowns] = useState({
    levels: [],
    divisions: [],
  });

  const [selections, setSelections] = useState({
    level: defaultLevel,
    division: defaultDivision,
  });

  const [scores, setScores] = useState([]);
  const [teamRecords, setTeamRecords] = useState({});

  //?----------------------------------------------------------------- USE EFFECT HOOKS ------------------------------------------------------------------------
  useEffect(() => {
    const fetchDropdownData = async () => {
      const [levelsResponse, divisionsResponse] = await Promise.all([
        fetch(`/api/${sportToQuery}/levels`),
        fetch(`/api/${sportToQuery}/divisions`),
      ]);

      const levels = await levelsResponse.json();
      const divisions = await divisionsResponse.json();
      console.log(levels);
      console.log(divisions);
      setDropdowns({
        levels: levels,
        divisions: divisions,
      });
    };
    fetchDropdownData();
    navigate(
      `?date=${dateOfGames.gameDate}&level=${
        selections.level
      }&division=${divisionNameOnly(defaultDivision)}`
    );

    console.log(
      `Fetching of game date on original load of page -> ${
        localStorageDate || todaysDate
      }`
    );
    console.log(
      `Fetching of game date on original load of page -> ${
        localStorageLevel || defaultLevel
      }`
    );
    console.log(
      `Fetching of game date on original load of page -> ${
        localStorageDivision || defaultDivision
      }`
    );

    fetchGameData(
      localStorageDate || todaysDate,
      defaultLevel,
      defaultDivision
    );
  }, []);

  useEffect(() => {
    fetchTeamRecords(
      dateOfGames.gameDate,
      selections.level,
      localStorageDivision || divisionNameOnly(selections.division)
    );
  }, [scores]);

  //?----------------------------------------------------------------- FUNCTIONS ------------------------------------------------------------------------
  const changeSelectedLevel = async (event) => {
    try {
      setSelections({ ...selections, level: event.target.value });
      navigate(
        `?date=${dateOfGames.gameDate}&level=${
          event.target.value
        }&division=${divisionNameOnly(selections.division)}`
      );

      await fetchGameData(
        dateOfGames.gameDate,
        event.target.value,
        selections.division
      );
      localStorage.setItem('level', event.target.value);
    } catch (error) {
      console.error(error);
    }
  };

  const changeSelectedDivision = async (event) => {
    try {
      setSelections({ ...selections, division: event.target.value });
      navigate(
        `?date=${dateOfGames.gameDate}&level=${
          selections.level
        }&division=${divisionNameOnly(event.target.value)}`
      );
      await fetchGameData(
        dateOfGames.gameDate,
        selections.level,
        event.target.value
      );
      localStorage.setItem('division', event.target.value);
    } catch (error) {
      console.error(error);
    }
  };

  const selectedDate = async (event) => {
    try {
      const dates = GlobalFunctions.dateFormats(event.target.value);
      setDateOfGames({
        ...dateOfGames,
        gameDate: dates.gameDate,
        dateForHeader: dates.dateForHeader,
      });
      navigate(
        `?date=${dates.gameDate}&level=${
          selections.level
        }&division=${divisionNameOnly(selections.division)}`
      );
      await fetchGameData(
        event.target.value,
        selections.level,
        selections.division
      );

      localStorage.setItem('date', event.target.value);
    } catch (error) {
      console.error(error);
    }
  };

  // This function removes the age group from the division name so left with 'Peewee' instead of '12U - Peewee'; This is to aid in making queries to the database.
  const divisionNameOnly = (division) => {
    console.log(`Division passed in ---> ${division}`);
    if (division.includes('-')) {
      console.log('Division includes -');
      const divisionArray = division.split('-');
      const divisionName = divisionArray[1]?.trim();
      return divisionName;
    } else {
      return division;
    }
  };

  // This function displays the team_name_long if it detects a team such as Ducks(2) but will only display team_name_short such as the Bears instead of California Golden Bears because there is no (2) in the name meaning there is only 1 Bears team
  const teamNameToDisplay = (teamNameLong, teamNameShort) => {
    if (teamNameLong.includes('(')) {
      return <p className="scoreboard-team-name">{teamNameLong}</p>;
    } else {
      return <p className="scoreboard-team-name">{teamNameShort}</p>;
    }
  };

  const gameDateHeading = () => {
    const gameDateArray = dateOfGames.dateForHeader.split(',');
    if (gameDateArray.includes('undefined')) {
      return '';
    } else {
      return dateOfGames.dateForHeader;
    }
  };

  // This function fetches the scores data for page
  const fetchGameData = async (date, team_level, division) => {
    try {
      const divisionToQuery = divisionNameOnly(division);
      const response = await fetch(
        `/api/hockey/scores?date=${date}&level=${team_level}&division=${divisionToQuery}`
      );
      console.log(
        `/api/hockey/scores?date=${date}&level=${team_level}&division=${divisionToQuery}`
      );
      const data = await response.json();
      if (data.length) console.log(data);
      setScores(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTeamRecords = async (date, team_level, division) => {
    try {
      const season = GlobalFunctions.hockeySeason(date);
      console.log(season);
      if (scores.length) {
        const response = await fetch(
          `/api/hockey/team-records?date=${date}&level=${team_level}&division=${division}&season=${season}&gameType=Regular Season`
        );
        const records = await response.json();
        console.log(records);
        setTeamRecords(records);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const calcTeamRecords = (team) => {
    const winningRecord = teamRecords[0]?.find((record) => {
      return record.winning_team_long === team;
    });
    const losingRecord = teamRecords[1]?.find((record) => {
      return record.losing_team_long === team;
    });

    let tiesCount = 0;
    teamRecords?.[2]?.forEach((record) => {
      if (record.home_team_long === team || record.visitor_team_long === team) {
        tiesCount++;
      }
    });

    const wins = winningRecord?.wins || 0;
    const losses = losingRecord?.losses || 0;
    const ties = tiesCount;
    return `(${wins}-${losses}-${ties})`;
  };

  //?----------------------------------------------------------------- JSX ------------------------------------------------------------------------
  return (
    <div id="scores-page-container">
      <Navbar />
      <div id="dropdowns-container">
        <div className="single-dropdown-container">
          <label htmlFor="date-picker">Game Date</label>
          <input
            id="date-picker"
            type="date"
            onChange={selectedDate}
            value={dateOfGames.gameDate}
          />
        </div>
        <div className="single-dropdown-container">
          <label htmlFor="level-dropdown">Level</label>
          <select
            name="level-dropdown"
            className="filter-dropdowns"
            id="level-dropdown"
            value={selections.level}
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
        </div>

        <div className="single-dropdown-container">
          <label htmlFor="division-dropdown">Division</label>
          <select
            name="division-dropdown"
            className="filter-dropdowns"
            id="division-dropdown"
            value={selections.division}
            onChange={changeSelectedDivision}
          >
            {dropdowns.divisions.map((division) => {
              return (
                <option
                  key={division.division_age}
                  value={division.division_age}
                >
                  {division.division_age}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div id="scoreboard-container">
        <div className="scores-headers-container">
          <h1 className="scores-heading" id="game-date-heading">
            {gameDateHeading()}
          </h1>
          <h1
            className="scores-heading"
            id="division-level-heading"
          >{`${selections.division} ${selections.level}`}</h1>
        </div>
        {scores.length ? (
          scores.map((game) => {
            return (
              <div id="individual-game-container" key={game.id}>
                <h3 id="game-status">FINAL</h3>
                <div className="team-container scoreboard-home-team-container ">
                  <div className="scoreboard-team-info scoreboard-home-team-info ">
                    <Link
                      className="scoreboard-team-name-logo"
                      to={`/hockey/teams/${game.home_team_short.toLowerCase()}/roster`}
                    >
                      <img
                        src={game.home_team_logo}
                        alt=""
                        className="team-logo scoreboard-team-logo"
                      />

                      {teamNameToDisplay(
                        game.home_team_long,
                        game.home_team_short
                      )}
                    </Link>
                    <p className="scoreboard-record">
                      {calcTeamRecords(game.home_team_long)}
                    </p>
                  </div>
                  <div className="scoreboard-scores-container scoreboard-home-team-scores">
                    <p id="home-team-score">{game.home_team_score}</p>
                  </div>
                </div>
                <div className="team-container scoreboard-visitor-team-container ">
                  <div className="scoreboard-team-info scoreboard-visitor-team-info ">
                    <Link
                      className="scoreboard-team-name-logo"
                      to={`/hockey/teams/${game.visitor_team_short.toLowerCase()}/roster`}
                    >
                      <img
                        src={game.visitor_team_logo}
                        alt=""
                        className="team-logo scoreboard-team-logo"
                      />

                      {teamNameToDisplay(
                        game.visitor_team_long,
                        game.visitor_team_short
                      )}
                    </Link>
                    <p className="scoreboard-record">
                      {' '}
                      {calcTeamRecords(game.visitor_team_long)}
                    </p>
                  </div>
                  <div className="scoreboard-scores-container scoreboard-visitor-team-scores">
                    <p id="visitor-team-score">{game.visitor_team_score}</p>
                  </div>

                  <div className="venue-gameTime-container">
                    <p id="venue">{game.venue}</p>
                    <p id="game-time">{game.game_time}</p>
                  </div>

                  <div className="scores-button-container">
                    <Link to={'/hockey/scores/boxscore'}>
                      <span className="scores-button">BOX SCORE</span>
                    </Link>
                    <Link to={''}>
                      <span className="scores-button">HIGHLIGHTS</span>
                    </Link>
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
            );
          })
        ) : (
          <h1 id="no-games-message">No games played on this date</h1>
        )}
      </div>
    </div>
  );
}
export default Scores;
