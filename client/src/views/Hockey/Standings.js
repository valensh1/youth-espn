import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Seasons from '../../components/Dropdowns/Seasons';
import Levels from '../../components/Dropdowns/Levels';
import Divisions from '../../components/Dropdowns/Divisions';
import { globalVariables } from '../../model/globalVariables';

function Standings() {
  const navigate = useNavigate();

  const location = useLocation();
  const currentPath = location.pathname;
  const sportToQuery = currentPath.split('/')[1];

  const defaultLevel = 'A';
  const defaultDivision = 'Peewee';
  const defaultSeason = globalVariables.currentSeason.hockey;

  const hockeyStatCategories = [
    'TEAM',
    'GP',
    'W',
    'L',
    'OTL',
    'TIES',
    'PTS',
    'P%',
    'RW',
    'ROW',
    'GF',
    'GA',
    'DIFF',
    'HOME',
    'AWAY',
    'S/O',
    'L10',
    'STRK',
  ];

  //?----------------------------------------------------------------- UseState Hooks ------------------------------------------------------------------------
  const [selections, setSelections] = useState({
    level: defaultLevel,
    division: defaultDivision,
    season: defaultSeason,
  });

  const [standings, setStandings] = useState([]);
  const [teamsData, setTeamsData] = useState([]);
  const [combinedData, setCombinedData] = useState([]);

  //?----------------------------------------------------------------- UseEffect Hooks ------------------------------------------------------------------------

  useEffect(() => {
    fetchData();
  }, []);

  //?----------------------------------------------------------------- Functions ------------------------------------------------------------------------
  // Function that takes child state (selected level, division, season, etc) from dropdown components and sets children states at the parent level
  const changeSelection = (dropdown, childState) => {
    console.log(childState);
    setSelections({ ...selections, [dropdown]: childState });
    console.log(childState);
  };

  const teamNameToRender = (teamLong, teamShort) => {
    return teamLong.includes('(') ? teamLong : teamShort;
  };

  // Function to remove the age group from division in order to query the database
  const divisionToQuery = (division) => {
    const divisionNameOnly = division.includes('-')
      ? division.split('-')[1].trim()
      : division;
    return divisionNameOnly;
  };

  const pointsPercentageCalc = (gamesPlayed, totalPoints) => {
    const maxPointsPerGamesPlayed = gamesPlayed * 2;
    let pointsPercentage = (totalPoints / maxPointsPerGamesPlayed).toFixed(3);
    pointsPercentage = pointsPercentage.replace(/^0+/, '');
    return pointsPercentage;
  };

  const fetchData = async (
    season = selections.season,
    level = selections.level,
    division = selections.division
  ) => {
    console.log(season, level, division);
    const team_division = divisionToQuery(division);
    const [standingsData, teams] = await Promise.all([
      fetch(
        `/api/${sportToQuery}/standings?season=${season}&level=${level}&division=${team_division}`
      ),
      fetch(`/api/${sportToQuery}/teams?level=${level}`),
    ]);
    const standings = await standingsData.json();
    const teamsData = await teams.json();
    console.log(standings);
    console.log(teamsData);
    setStandings(standings);
    setTeamsData(teamsData);
    getCombinedDataToRender(standings, teamsData);
  };

  const getCombinedDataToRender = (standings, teamData) => {
    console.log(teamData);
    let finalData = standings.map((standingsData) => {
      const teams = teamData.find((team) => {
        return (
          team.team_name_full === standingsData.team_name_long ||
          team.team_name_short === standingsData.team_name_short
        );
      });
      return {
        ...teams,
        standingsData,
        displayedTeamName: teamNameToRender(
          standingsData.team_name_long,
          standingsData.team_name_short
        ),
      };
    });
    setCombinedData(finalData);
  };

  //?----------------------------------------------------------------- JSX ------------------------------------------------------------------------

  return (
    <div id="standings-page-container">
      <Navbar />
      <div className="center-items">
        <div id="dropdowns-container">
          <Seasons dropdownSelection={changeSelection} fetchData={fetchData} />
          <Levels dropdownSelection={changeSelection} fetchData={fetchData} />
          <Divisions
            dropdownSelection={changeSelection}
            fetchData={fetchData}
          />
        </div>
        <h1 className="page-title">Standings</h1>
        <div id="standings-container">
          <table>
            <thead>
              <tr>
                {hockeyStatCategories.map((statCategory) => {
                  return <th key={statCategory}>{statCategory}</th>;
                })}
              </tr>
            </thead>

            <tbody>
              {combinedData.map((team) => {
                return (
                  <tr key={`${team.displayedTeamName}-${team.id}`}>
                    <td id="standings-team-logo">
                      <Link to={''}>
                        <img
                          src={team.logo_image}
                          alt=""
                          className="team-logo standings-team-logo"
                        />
                        <p>{team.displayedTeamName}</p>
                      </Link>
                    </td>

                    <td>{team.standingsData.games_played}</td>
                    <td>{team.standingsData.total_wins}</td>
                    <td>{team.standingsData.total_losses}</td>
                    <td></td>
                    <td>{team.standingsData.total_ties}</td>
                    <td id="stat-points">{team.standingsData.total_points}</td>
                    <td>
                      {pointsPercentageCalc(
                        team.standingsData.games_played,
                        team.standingsData.total_points
                      )}
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Standings;
