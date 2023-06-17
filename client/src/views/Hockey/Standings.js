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
    'PTS',
    'GF',
    'GA',
    'DIFF',
    'HOME',
    'AWAY',
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
      <div id="dropdowns-container">
        <Seasons dropdownSelection={changeSelection} fetchData={fetchData} />
        <Levels dropdownSelection={changeSelection} fetchData={fetchData} />
        <Divisions dropdownSelection={changeSelection} fetchData={fetchData} />
      </div>
      <h1 className="page-title">Standings</h1>
      <div id="standings-container">
        <table>
          <thead>
            {hockeyStatCategories.map((statCategory) => {
              return <th key={statCategory}>{statCategory}</th>;
            })}
          </thead>

          {combinedData.map((team) => {
            return (
              <tbody>
                <td>{team.displayedTeamName}</td>
                <td>{team.standingsData.games_played}</td>
                <td>{team.standingsData.total_wins}</td>
                <td>{team.standingsData.total_losses}</td>
                <td></td>
                <td>{team.standingsData.total_points}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tbody>
            );
          })}
        </table>
      </div>
    </div>
  );
}

export default Standings;
