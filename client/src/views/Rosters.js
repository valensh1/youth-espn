import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Rosters() {
  const [seasons, setSeasons] = useState([]);
  const [teams, setTeams] = useState([]);
  const [singleTeam, setSingleTeam] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');

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
        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [selectedTeam]);

  return (
    <div className="teams-container">
      <h1>Roster</h1>
      <select name="seasons" id="seasons">
        {seasons.map((el) => {
          return <option value={el.season}>{el.season}</option>;
        })}
      </select>

      <select
        name="teams"
        id="teams"
        value={selectedTeam}
        onChange={changeSelectedTeam}
      >
        {teams.map((el) => {
          return <option value={el.team_short}>{el.team_name_short}</option>;
        })}
      </select>
    </div>
  );
}

export default Rosters;
