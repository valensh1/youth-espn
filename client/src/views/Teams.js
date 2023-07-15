import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Teams() {
  const [teams, setTeams] = useState([]);

  let urlPathToParse = window.location.pathname.split('/'); // Get sport from url path
  const sport = urlPathToParse[1]; // Sport is located in first index position in url path

  const sportCase = `${sport[0].toUpperCase()}${sport.slice(1)}`; // Capitalization of sport so it appears such as Hockey

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`/api/${sport}/teams`); // Fetching of sports teams from database to display
        const teamsDataPull = await response.json();
        console.log(teamsDataPull);
        setTeams(teamsDataPull);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  //?----------------------------------------------------------------- JSX ------------------------------------------------------------------------

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
              <div
                className="individual-team-container"
                id={teamName}
                key={team.team_name_short}
              >
                <Link to={`/${team.team_name_short}`}>
                  <img className="team-logo" src={team.logo_image} alt="" />
                  <span>{team.team_name_short}</span>
                </Link>
                <div className="team-links">
                  <Link to={`${teamName}/stats`}>Statistics</Link>
                  <Link to={`${teamName}/schedule`}>Schedule</Link>
                  <Link
                    to={`${teamName}/roster`}
                    state={{ team: team.team_name_short }}
                  >
                    Roster
                  </Link>
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
