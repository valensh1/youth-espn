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
  const defaultLeageNameOnly = defaultLeague.split('-')[1].trim();
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

  const [scores, setScores] = useState([]);
  const [teamRecords, setTeamRecords] = useState({});

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
    navigate(
      `?date=${dateOfGames.gameDate}&level=${
        selections.selectedLevel
      }&league=${leagueNameOnly(defaultLeague)}`
    );
  }, []);

  useEffect(() => {
    fetchTeamRecords(
      dateOfGames.gameDate,
      selections.selectedLevel,
      leagueNameOnly(selections.selectedLeague)
    );
  }, [scores]);

  //?----------------------------------------------------------------- FUNCTIONS ------------------------------------------------------------------------
  const changeSelectedLevel = async (event) => {
    try {
      setSelections({ ...selections, selectedLevel: event.target.value });
      navigate(
        `?date=${dateOfGames.gameDate}&level=${
          event.target.value
        }&league=${leagueNameOnly(selections.selectedLeague)}`
      );

      await fetchGameData(
        dateOfGames.gameDate,
        event.target.value,
        selections.selectedLeague
      );
    } catch (error) {
      console.error(error);
    }
  };

  const changeSelectedLeague = async (event) => {
    try {
      setSelections({ ...selections, selectedLeague: event.target.value });
      navigate(
        `?date=${dateOfGames.gameDate}&level=${
          selections.selectedLevel
        }&league=${leagueNameOnly(event.target.value)}`
      );
      await fetchGameData(
        dateOfGames.gameDate,
        selections.selectedLevel,
        event.target.value
      );
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
          selections.selectedLevel
        }&league=${leagueNameOnly(selections.selectedLeague)}`
      );
      await fetchGameData(
        event.target.value,
        selections.selectedLevel,
        selections.selectedLeague
      );
    } catch (error) {
      console.error(error);
    }
  };

  // This function removes the age group from the league name so left with 'Peewee' instead of '12U - Peewee'; This is to aid in making queries to the database.
  const leagueNameOnly = (league) => {
    const leagueArray = league.split('-');
    const leagueName = leagueArray[1].trim();
    return leagueName;
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
  const fetchGameData = async (date, team_level, league) => {
    try {
      const leagueToQuery = leagueNameOnly(league);
      const response = await fetch(
        `/api/hockey/scores?date=${date}&level=${team_level}&league=${leagueToQuery}`
      );
      const data = await response.json();
      if (data.length) console.log(data);
      setScores(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTeamRecords = async (date, team_level, league) => {
    try {
      const season = GlobalFunctions.hockeySeason(date);
      console.log(season);
      if (scores.length) {
        const response = await fetch(
          `/api/hockey/team-records?date=${date}&level=${team_level}&league=${league}&season=${season}`
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

    const wins = winningRecord?.count || 0;
    const losses = losingRecord?.count || 0;
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
            className={dropdowns.showCalendar ? 'show' : 'hidden'}
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
        </div>

        <div className="single-dropdown-container">
          <label htmlFor="league-dropdown">League</label>
          <select
            name="league-dropdown"
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
      </div>

      <div id="scoreboard-container">
        <div className="scores-headers-container">
          <h1 className="scores-heading" id="game-date-heading">
            {gameDateHeading()}
          </h1>
          <h1
            className="scores-heading"
            id="league-level-heading"
          >{`${selections.selectedLeague} ${selections.selectedLevel}`}</h1>
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
                      <p className="scores-button">BOX SCORE</p>
                    </Link>
                    <Link to={''}>
                      <p className="scores-button">HIGHLIGHTS</p>
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
