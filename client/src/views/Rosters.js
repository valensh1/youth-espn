import { useEffect, useState } from 'react';

function Rosters() {
  const [seasons, setSeasons] = useState([]);
  const [teams, setTeams] = useState([]);
  const [singleTeam, setSingleTeam] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');

  console.log(window.location.pathname);
  console.log(window.location.pathname.split('/')[3]); // Gets the team name from the url path to query database
  const teamToQuery = window.location.pathname.split('/')[3];
  console.log(teamToQuery);

  const teamNameToCapitalizeFirstLetter = (team) => {
    console.log(team);
    teams.forEach((el) => {
      const teamHave2Words = el.team_name_short.indexOf(' ') >= 0; // See if team name has two words; This returns a variable that is a boolean.
      console.log(teamHave2Words);
      const teamNameModified = teamHave2Words
        ? el.team_name_short.replace(/ /g, '').toLowerCase()
        : el.team_name_short.toLowerCase();
      console.log(teamNameModified);
      if (teamNameModified === team) {
        console.log(el.team_name_short);
        setSelectedTeam(el.team_name_short);
      }
    });
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
        teamNameToCapitalizeFirstLetter(teamToQuery);
      });
  }, []);

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
        // value={teamNameToCapitalizeFirstLetter(teamToQuery)}
        value={selectedTeam}
      >
        {teams.map((el) => {
          return <option value={el.team_short}>{el.team_name_short}</option>;
        })}
      </select>
    </div>
  );
}

export default Rosters;
