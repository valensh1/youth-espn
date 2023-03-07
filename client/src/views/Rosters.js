import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Rosters() {
  const [seasons, setSeasons] = useState([]);
  const [teams, setTeams] = useState([]);
  const [singleTeam, setSingleTeam] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');

  console.log(window.location.pathname);
  console.log(window.location.pathname.split('/')[3]); // Gets the team name from the url path to query database
  let teamToQuery = window.location.pathname.split('/')[3];
  console.log(teamToQuery);

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

  const changeSelectedTeam = (event) => {
    console.log(event.target.value);
    setSelectedTeam(event.target.value);
    let modifiedTeam = event.target.value;
    if (modifiedTeam.indexOf(' ') >= 0) {
      modifiedTeam = event.target.value.replace(/ /g, '').toLowerCase();
    } else {
      modifiedTeam = event.target.value.toLowerCase();
    }
    document.location.href = `/hockey/teams/${modifiedTeam}/roster`;
    return modifiedTeam;
  };

  const changeSeason = (event) => {
    console.log(event.target.value);
    setSelectedSeason(event.target.value);
  };

  useEffect(() => {
    const APICalls = [
      fetch(`/api/hockey/seasons`),
      fetch(`/api/hockey/teams`),
      fetch(`/api/hockey/teams/${teamToQuery}/roster`),
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
        setSelectedSeason(seasonsData[0].season);
      });
  }, []);

  useEffect(() => {
    teamNameToCapitalizeFirstLetter(teamToQuery);
  }, [teams]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
          `/api/hockey/teams/${selectedTeam}/roster`
        );
        const rosterData = await response.json();
        console.log(rosterData);
        setSingleTeam(rosterData);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [selectedTeam]);

  return (
    <div className="teams-container">
      <h1>Roster</h1>
      <select
        name="seasons"
        id="seasons"
        onChange={changeSeason}
        value={selectedSeason}
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
      <table>
        <tr>
          <th>Player</th>
          <th>#</th>
          <th>Position</th>
        </tr>

        {singleTeam.map((player) => {
          return (
            <tr>
              <td>{`${player.first_name}`}</td>
              <td>{`${player.last_name}`}</td>
              <td>{`${player.position}`}</td>
            </tr>
          );
        })}
      </table>
    </div>
  );
}

export default Rosters;
