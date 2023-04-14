import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

// Current Season prop passed in from index.js is the current season for the sport being rendered (e.g. 2022-2023 season)
function Rosters({ currentSeason }) {
  // Get sport to render rosters for
  const sportToQuery = window.location.pathname.split('/')[1];
  console.log(sportToQuery);

  const teamToQuery = window.location.pathname.split('/')[3];
  console.log(teamToQuery);

  let teamNameCapitalized = '';
  const location = useLocation();
  // console.log(location.state);
  if (location?.state) {
    const { team } = location.state; // Destructure state prop that is passed from the Link element on Team.js so we can use to set the teams in drop-down menu and also use to query the database since the database contains team names such as Ice Dogs or Ducks
    teamNameCapitalized = team; // Used for drop-down menu and querying the database
  }

  //----------------------------------------------------------------- USE STATE HOOKS ------------------------------------------------------------------------
  const [seasons, setSeasons] = useState([]);
  const [teams, setTeams] = useState([]);
  const [levels, setLevels] = useState([]);
  const [singleTeam, setSingleTeam] = useState([]);
  const [playerPositions, setPlayerPositions] = useState({});
  const [selectedSeason, setSelectedSeason] = useState(
    currentSeason[sportToQuery]
  );
  const [selectedLevel, setSelectedLevel] = useState('AAA');
  const [selectedTeam, setSelectedTeam] = useState(teamNameCapitalized);
  const [selectedTeamInfo, setSelectedTeamInfo] = useState({});

  //----------------------------------------------------------------- USE EFFECT HOOKS ------------------------------------------------------------------------

  // UseEffect hook that makes the initial calls upon page load to retrieve the available seasons, general team info and roster data
  useEffect(() => {
    const APICalls = [
      fetch(`/api/${sportToQuery}/seasons`),
      fetch(`/api/${sportToQuery}/teams`),
      fetch(
        `/api/${sportToQuery}/teams/${teamToQuery}/roster?season=${currentSeason[sportToQuery]}&level=AAA`
      ),
      fetch(`/api/${sportToQuery}/levels`),
    ];

    Promise.all([APICalls[0], APICalls[1], APICalls[2], APICalls[3]])
      .then(([seasonsData, teamsData, singleTeamData, teamLevels]) =>
        Promise.all([
          seasonsData.json(),
          teamsData.json(),
          singleTeamData.json(),
          teamLevels.json(),
        ])
      )
      .then(([seasonsData, teamsData, singleTeamData, teamLevels]) => {
        setSeasons(seasonsData);
        setTeams(teamsData);
        setSingleTeam(singleTeamData);
        setLevels(teamLevels);
        teamsData.forEach((team) => {
          const modifiedTeamName = modifyTeamNameToLowercaseNoSpaces(
            team.team_name_short
          );
          if (modifiedTeamName === teamToQuery) {
            setSelectedTeamInfo({
              primaryColor: team.primary_team_color,
              secondaryColor: team.secondary_team_color,
              thirdColor: team.third_team_color,
              logo: team.logo_image,
            });
          }
        });
      });
  }, []);

  // UseEffect hook that organizes the players by position
  useEffect(() => {
    const playersByPosition = {
      forwards: [],
      defense: [],
      goalies: [],
    };
    singleTeam.find((player) => {
      if (player.position === 'forward') {
        console.log(`${player.first_name} ${player.last_name}`);
        playersByPosition.forwards.push(player);
      } else if (player.position === 'defenseman') {
        console.log(`${player.first_name} ${player.last_name}`);
        playersByPosition.defense.push(player);
      } else {
        console.log(`${player.first_name} ${player.last_name}`);
        playersByPosition.goalies.push(player);
      }
    });
    return setPlayerPositions(playersByPosition);
  }, [singleTeam]);

  //----------------------------------------------------------------- FUNCTIONS ------------------------------------------------------------------------

  const changeSelectedSeason = async (event) => {
    try {
      console.log(event.target.value);
      setSelectedSeason(event.target.value);
      const response = await fetch(
        `/api/${sportToQuery}/teams/${selectedTeam}/roster?season=${event.target.value}&level=${selectedLevel}`
      );
      const rosterData = await response.json();
      setSingleTeam(rosterData);
    } catch (error) {
      console.error(error);
    }
  };

  const changeSelectedTeam = async (event) => {
    try {
      console.log(event.target.value);
      setSelectedTeam(event.target.value);
      modifyTeamNameToPlaceInURL(event.target.value);
      const response = await fetch(
        `/api/${sportToQuery}/teams/${modifyTeamNameToPlaceInURL(
          event.target.value
        )}/roster?season=${selectedSeason}&teamToQuery=${
          event.target.value
        }&level=${selectedLevel}`
      );
      const rosterData = await response.json();
      console.log(rosterData);
      setSingleTeam(rosterData);
      teams.forEach((team) => {
        console.log(team.team_name_short, event.target.value);
        if (team.team_name_short === event.target.value) {
          setSelectedTeamInfo({
            primaryColor: team.primary_team_color,
            secondaryColor: team.secondary_team_color,
            thirdColor: team.third_team_color,
            logo: team.logo_image,
          });
        }
      });
    } catch (error) {}
  };

  const changeSelectedLevel = async (event) => {
    try {
      console.log(event.target.value);
      setSelectedLevel(event.target.value);
      const response = await fetch(
        `/api/${sportToQuery}/teams/${selectedTeam}/roster?season=${selectedSeason}&level=${event.target.value}`
      );
      const rosterData = await response.json();
      console.log(rosterData);
      setSingleTeam(rosterData);
    } catch (error) {}
  };

  // This function takes the team name selected in drop-down and converts it to lower case with no spaces to insert into url path; window.history.pushState changes the url path with no reloading of page.
  const modifyTeamNameToPlaceInURL = (team) => {
    let modifiedTeam = '';
    if (team.indexOf(' ') >= 0) {
      modifiedTeam = team.replace(/ /g, '').toLowerCase();
    } else {
      modifiedTeam = team.toLowerCase();
    }
    window.history.pushState(
      '',
      '',
      `/${sportToQuery}/teams/${modifiedTeam}/roster`
    );
    return modifiedTeam;
  };

  const modifyTeamNameFromURL = (team) => {
    console.log(team);
    let teamName = '';
    teams.forEach((el) => {
      const teamHave2Words = el.team_name_short.indexOf(' ') >= 0; // See if team name has two words; This returns a variable that is a boolean.
      const teamNameModified = teamHave2Words
        ? el.team_name_short.replace(/ /g, '').toLowerCase() // Replace space in team name to concatenate with all lowercase letters
        : el.team_name_short.toLowerCase();
      if (teamNameModified === team) {
        console.log(teamNameModified, team, el.team_name_short);
        teamName = el.team_name_short;
      }
    });
    return teamName;
  };

  const modifyTeamNameToLowercaseNoSpaces = (team) => {
    let modifiedTeam = '';
    if (team.indexOf(' ') >= 0) {
      modifiedTeam = team.replace(/ /g, '').toLowerCase();
    } else {
      modifiedTeam = team.toLowerCase();
    }
    return modifiedTeam;
  };

  const modBirthDateToDisplay = (birthDate) => {
    birthDate = new Date(birthDate); // Convert date string to date to perform Javascript functions
    return Intl.DateTimeFormat('en-US').format(birthDate);
  };

  //----------------------------------------------------------------- JSX ------------------------------------------------------------------------
  return (
    <>
      <div
        className="teams-container"
        style={{ backgroundColor: selectedTeamInfo.secondaryColor }}
      >
        <Navbar />

        <div className="filter-dropdowns-container">
          <div className="filter-dropdowns">
            <label htmlFor="seasons">Season</label>
            <select
              name="seasons"
              id="seasons-selection"
              value={selectedSeason}
              onChange={changeSelectedSeason}
            >
              {seasons.map((el) => {
                return (
                  <option value={el.season} key={el.season}>
                    {el.season}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="filter-dropdowns">
            <label htmlFor="teams">Team</label>
            <select
              name="teams"
              id="teams-selection"
              value={selectedTeam}
              onChange={changeSelectedTeam}
            >
              {teams.map((el) => {
                return (
                  <option value={el.team_short} key={el.team_name_short}>
                    {el.team_name_short}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="filter-dropdowns">
            <label htmlFor="teams">Level</label>
            <select
              name="level"
              id="level-selection"
              value={selectedLevel}
              onChange={changeSelectedLevel}
            >
              {levels.map((level) => {
                return <option key={level.level}>{level.level}</option>;
              })}
            </select>
          </div>
        </div>

        <img src={selectedTeamInfo.logo} alt="" id="team-logo" />
        <h1
          style={{ color: `${selectedTeamInfo.primaryColor}` }}
        >{`${selectedTeam} Roster`}</h1>

        <div className="pill-container">
          <a href="" className="pill">
            Ducks(1)
          </a>
          <a href="" className="pill">
            Ducks(2)
          </a>
        </div>

        <h3 style={{ color: `${selectedTeamInfo.primaryColor}` }}>Forwards</h3>
        <table
          className="roster-table"
          style={{ border: `10px solid ${selectedTeamInfo.primaryColor}` }}
        >
          <thead>
            <tr>
              <th>Player</th>
              <th>#</th>
              <th>Shooting Hand</th>
              <th>Height</th>
              <th>Weight</th>
              <th>Birth Date</th>
            </tr>
          </thead>

          <tbody>
            {playerPositions?.forwards?.map((player) => {
              return (
                <tr className="roster-table-data" key={player.id}>
                  <td className="shaded">
                    <Link className="player-img-name" to={''}>
                      <img
                        src={player.profile_img_1}
                        alt=""
                        style={{
                          border: `2px solid ${selectedTeamInfo.primaryColor}`,
                        }}
                      />
                      <p className="left">
                        {`${player.first_name} ${player.last_name}`}
                      </p>
                    </Link>
                  </td>
                  <td className="centered">{player.jersey_number}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="centered">
                    {modBirthDateToDisplay(player.date_of_birth)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h3 style={{ color: `${selectedTeamInfo.primaryColor}` }}>Defense</h3>
        <table
          className="roster-table"
          style={{ border: `10px solid ${selectedTeamInfo.primaryColor}` }}
        >
          <thead>
            <tr>
              <th>Player</th>
              <th>#</th>
              <th>Shooting Hand</th>
              <th>Height</th>
              <th>Weight</th>
              <th>Birth Date</th>
            </tr>
          </thead>

          <tbody>
            {playerPositions?.defense?.map((player) => {
              return (
                <tr className="roster-table-data" key={player.id}>
                  <td className="shaded">
                    <Link className="player-img-name" to={''}>
                      <img
                        src={player.profile_img_1}
                        alt=""
                        style={{
                          border: `2px solid ${selectedTeamInfo.primaryColor}`,
                        }}
                      />
                      <p className="left">
                        {`${player.first_name} ${player.last_name}`}
                      </p>
                    </Link>
                  </td>
                  <td className="centered">{player.jersey_number}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="centered">
                    {modBirthDateToDisplay(player.date_of_birth)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h3 style={{ color: `${selectedTeamInfo.primaryColor}` }}>Goalies</h3>
        <table
          className="roster-table"
          style={{ border: `10px solid ${selectedTeamInfo.primaryColor}` }}
        >
          <thead>
            <tr>
              <th>Player</th>
              <th>#</th>
              <th>Height</th>
              <th>Weight</th>
              <th>Birth Date</th>
            </tr>
          </thead>

          <tbody>
            {playerPositions?.goalies?.map((player) => {
              return (
                <tr className="roster-table-data" key={player.id}>
                  <td className="shaded">
                    <Link className="player-img-name" to={''}>
                      <img
                        src={player.profile_img_1}
                        alt=""
                        style={{
                          border: `2px solid ${selectedTeamInfo.primaryColor}`,
                        }}
                      />
                      <p className="left">
                        {`${player.first_name} ${player.last_name}`}
                      </p>
                    </Link>
                  </td>
                  <td className="centered">{player.jersey_number}</td>
                  <td></td>
                  <td></td>
                  <td className="centered">
                    {modBirthDateToDisplay(player.date_of_birth)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Rosters;
