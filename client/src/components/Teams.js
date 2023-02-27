import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

function Teams() {
  const [teams, setTeams] = useState([]);

  let urlPathToParse = window.location.pathname.split('/');
  const sport = urlPathToParse[1];

  const sportCase = `${sport[0].toUpperCase()}${sport.slice(1)}`;

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`/api/${sport}/teams`);
        const teamsDataPull = await response.json();
        console.log(teamsDataPull);
        setTeams(teamsDataPull);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  return (
    <div id="teams-background-image">
      <Navbar />
      <div className="all-teams-container">
        <h1 id="teams-header">{sportCase} Teams</h1>
        <div className="all-teams-content">
          {teams.map((team) => {
            const teamName = team.team_name_short
              .toLowerCase()
              .replace(' ', '');
            return (
              <div className="individual-team-container" id={teamName}>
                <Link
                  key={team.team_name_short}
                  to={`/${team.team_name_short}`}
                >
                  <img className="team-logo" src={team.logo_image} alt="" />
                  <span>{team.team_name_short}</span>
                </Link>
                <div className="team-links">
                  <Link to={`/${team.team_name_short}/stats`}>Statistics</Link>
                  <Link to={`/${team.team_name_short}/schedule`}>Schedule</Link>
                  <Link to={`/${team.team_name_short}/roster`}>Roster</Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Teams;
