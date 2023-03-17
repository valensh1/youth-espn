import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Current Season prop passed in from index.js is the current season for the sport being rendered (e.g. 2022-2023 season)
function Rosters({ currentSeason }) {
  // Information from the url
  console.log(window.location.pathname);
  let teamToQuery = window.location.pathname.split('/')[3]; // Gets the team name from the url path to query database
  console.log(teamToQuery);

  const sportToQuery = window.location.pathname.split('/')[1];
  console.log(sportToQuery);

  // States
  const [seasons, setSeasons] = useState([]);
  const [teams, setTeams] = useState([]);
  const [singleTeam, setSingleTeam] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedSeason, setSelectedSeason] = useState(
    currentSeason[sportToQuery]
  );

  const teamNameToCapitalizeFirstLetter = (team) => {
    console.log(team);
    teams.forEach((el) => {
      const teamHave2Words = el.team_name_short.indexOf(' ') >= 0; // See if team name has two words; This returns a variable that is a boolean.
      const teamNameModified = teamHave2Words
        ? el.team_name_short.replace(/ /g, '').toLowerCase() // Replace space in team name to concatenate with all lowercase letters
        : el.team_name_short.toLowerCase();
      if (teamNameModified === team) {
        setSelectedTeam(el.team_name_short);
      }
    });
  };

  // Function to place the team selected by user in drop-down in the url with lower case letters and no spaces in the url
  const changeSelectedTeam = (event) => {
    console.log(event.target.value);
    setSelectedTeam(event.target.value);
    let modifiedTeam = event.target.value;
    if (modifiedTeam.indexOf(' ') >= 0) {
      modifiedTeam = event.target.value.replace(/ /g, '').toLowerCase();
    } else {
      modifiedTeam = event.target.value.toLowerCase();
    }
    document.location.href = `/${sportToQuery}/teams/${modifiedTeam}/roster`;
    return modifiedTeam;
  };

  const changeSeason = (event) => {
    console.log(event.target.value);
    setSelectedSeason(event.target.value);
  };

  const modBirthDateToDisplay = (birthDate) => {
    birthDate = new Date(birthDate); // Convert date string to date to perform Javascript functions
    return Intl.DateTimeFormat('en-US').format(birthDate);
  };

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
        console.log(seasonsData, teamsData, singleTeamData);
      });
  }, []);

  useEffect(() => {
    teamNameToCapitalizeFirstLetter(teamToQuery);
  }, [teams]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
          `/api/${sportToQuery}/teams/${selectedTeam}/roster?season=${selectedSeason}`
        );
        const rosterData = await response.json();
        console.log(rosterData);
        setSingleTeam(rosterData);
        const seasonsDropDownElement = document.getElementById('seasons');
        const seasonsDropDownText = seasonsDropDownElement.innerText;
        console.log(seasonsDropDownText);
        // setSelectedSeason(seasonsDropDownText);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [selectedTeam]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
          `/api/${sportToQuery}/teams/${selectedTeam}/roster?season=${selectedSeason}`
        );
        const rosterData = await response.json();
        console.log(rosterData);
        setSingleTeam(rosterData);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [selectedSeason]);

  return (
    <div className="teams-container">
      <h1>Roster</h1>
      <select
        name="seasons"
        id="seasons"
        onChange={changeSeason}
        value={selectedSeason || currentSeason[sportToQuery]}
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
        id="teams"
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
        <tr>
          <th>Player</th>
          <th>#</th>
          <th>Position</th>
          <th>Shooting Hand</th>
          <th>Height</th>
          <th>Weight</th>
          <th>Birth Date</th>
        </tr>

        {singleTeam.map((player) => {
          return (
            <tr className="roster-table-data">
              <Link to={'/'}>
                <td>{`${player.first_name} ${player.last_name}`}</td>
              </Link>
              <td>{player.jersey_number}</td>
              <td>{player.position}</td>
              <td></td>
              <td></td>
              <td></td>
              <td>{modBirthDateToDisplay(player.date_of_birth)}</td>
            </tr>
          );
        })}
      </table>
    </div>
  );
}

export default Rosters;
