import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

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
  const [singleTeam, setSingleTeam] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(
    currentSeason[sportToQuery]
  );
  const [selectedTeam, setSelectedTeam] = useState(teamNameCapitalized);

  //----------------------------------------------------------------- USE EFFECT HOOKS ------------------------------------------------------------------------
  useEffect(() => {
    const APICalls = [
      fetch(`/api/${sportToQuery}/seasons`),
      fetch(`/api/${sportToQuery}/teams`),
      fetch(
        `/api/${sportToQuery}/teams/${teamToQuery}/roster?season=${currentSeason[sportToQuery]}`
      ),
    ];

    Promise.all([APICalls[0], APICalls[1], APICalls[2]])
      .then(([seasonsData, teamsData, singleTeamData]) =>
        Promise.all([
          seasonsData.json(),
          teamsData.json(),
          singleTeamData.json(),
        ])
      )
      .then(([seasonsData, teamsData, singleTeamData]) => {
        setSeasons(seasonsData);
        setTeams(teamsData);
        setSingleTeam(singleTeamData);
      });
  }, []);

  //----------------------------------------------------------------- FUNCTIONS ------------------------------------------------------------------------

  const changeSelectedSeason = async (event) => {
    try {
      console.log(event.target.value);
      setSelectedSeason(event.target.value);
      const response = await fetch(
        `/api/${sportToQuery}/teams/${selectedTeam}/roster?season=${event.target.value}`
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
        )}/roster?season=${selectedSeason}&teamToQuery=${event.target.value}`
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

  const modBirthDateToDisplay = (birthDate) => {
    birthDate = new Date(birthDate); // Convert date string to date to perform Javascript functions
    return Intl.DateTimeFormat('en-US').format(birthDate);
  };

  //----------------------------------------------------------------- JSX ------------------------------------------------------------------------
  return (
    <div className="teams-container">
      <h1>Roster</h1>
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
      <table className="roster-table">
        <thead>
          <tr>
            <th>Player</th>
            <th>#</th>
            <th>Position</th>
            <th>Shooting Hand</th>
            <th>Height</th>
            <th>Weight</th>
            <th>Birth Date</th>
          </tr>
        </thead>

        {singleTeam.map((player) => {
          return (
            <tbody key={player.id}>
              <tr className="roster-table-data">
                <td>
                  <Link
                    to={'/'}
                  >{`${player.first_name} ${player.last_name}`}</Link>
                </td>
                <td>{player.jersey_number}</td>
                <td>{player.position}</td>
                <td></td>
                <td></td>
                <td></td>
                <td>{modBirthDateToDisplay(player.date_of_birth)}</td>
              </tr>
            </tbody>
          );
        })}
      </table>
    </div>
  );
}

export default Rosters;
