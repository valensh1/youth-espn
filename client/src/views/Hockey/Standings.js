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
    if (teamLong || teamShort) {
      return teamLong.includes('(') ? teamLong : teamShort;
    }
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

  // Function used to pass game object in and determine the wins, losses or ties for a team
  const calcWinsLossesTies = ({ wins, losses, ties }) => {
    const won = wins.length;
    const loss = losses.length;
    const tie = ties.length;
    return `${won} - ${loss} - ${tie}`;
  };

  const fetchData = async (
    season = selections.season,
    level = selections.level,
    division = selections.division
  ) => {
    console.log(season, level, division);
    const team_division = divisionToQuery(division);
    const [
      winsLossRecord,
      GF_GA_DIFF,
      homeWinLossRecord,
      awayWinLossRecord,
      teams,
    ] = await Promise.all([
      fetch(
        `/api/${sportToQuery}/standings?season=${season}&level=${level}&division=${team_division}`
      ),
      fetch(
        `/api/${sportToQuery}/teams/GF_GA_DIFF?season=${season}&level=${level}&division=${team_division}`
      ),
      fetch(
        `/api/${sportToQuery}/teams/home-records?season=${season}&level=${level}&division=${team_division}`
      ),
      fetch(
        `/api/${sportToQuery}/teams/away-records?season=${season}&level=${level}&division=${team_division}`
      ),
      fetch(`/api/${sportToQuery}/teams?level=${level}`),
    ]);
    const winsLossesPoints = await winsLossRecord.json();
    const teamsData = await teams.json();
    const GF_GA = await GF_GA_DIFF.json();
    const homeWinsLossRecord = await homeWinLossRecord.json();
    const awayWinsLossRecord = await awayWinLossRecord.json();
    console.log(winsLossesPoints);
    console.log(GF_GA);
    console.log(homeWinsLossRecord);
    console.log(awayWinsLossRecord);
    console.log(teamsData);
    setTeamsData(teamsData);
    const combinedStandingsData = {
      winsLossesPoints,
      GF_GA,
      homeWinsLossRecord,
      awayWinsLossRecord,
    };
    getCombinedDataToRender(combinedStandingsData, teamsData);
  };

  const getCombinedDataToRender = (combinedData, teamsData) => {
    console.log(teamsData);
    console.log(combinedData);

    let finalData = combinedData.winsLossesPoints.map((winsLossPoints) => {
      const teams = teamsData.find((team) => {
        return (
          team.team_name_full === winsLossPoints.team_name_long ||
          team.team_name_short === winsLossPoints.team_name_short
        );
      });

      const GF_GA_DIFF = combinedData.GF_GA.find((stat) => {
        return (
          stat.team_long === winsLossPoints.team_name_long ||
          stat.team_short === winsLossPoints.team_name_short
        );
      });

      const homeWinsLossRecords = {
        wins: [],
        losses: [],
        ties: [],
      };

      combinedData.homeWinsLossRecord.map((stat) => {
        if (
          stat.home_team_long === winsLossPoints.team_name_long &&
          stat.winning_team_long === stat.home_team_long
        ) {
          homeWinsLossRecords.wins.push(stat);
        } else if (
          stat.home_team_long === winsLossPoints.team_name_long &&
          stat.winning_team_long !== stat.home_team_long &&
          stat.tie === false
        ) {
          homeWinsLossRecords.losses.push(stat);
        } else if (
          stat.home_team_long === winsLossPoints.team_name_long &&
          stat.tie === true
        ) {
          homeWinsLossRecords.ties.push(stat);
        }
      });

      const awayWinsLossRecords = {
        wins: [],
        losses: [],
        ties: [],
      };

      combinedData.awayWinsLossRecord.map((stat) => {
        if (
          stat.visitor_team_long === winsLossPoints.team_name_long &&
          stat.winning_team_long === stat.visitor_team_long
        ) {
          awayWinsLossRecords.wins.push(stat);
        } else if (
          stat.visitor_team_long === winsLossPoints.team_name_long &&
          stat.winning_team_long !== stat.visitor_team_long &&
          stat.tie === false
        ) {
          awayWinsLossRecords.losses.push(stat);
        } else if (
          stat.visitor_team_long === winsLossPoints.team_name_long &&
          stat.tie === true
        ) {
          awayWinsLossRecords.ties.push(stat);
        }
      });

      return {
        ...teams,
        winsLossPoints,
        GF_GA_DIFF,
        homeWinsLossRecords,
        awayWinsLossRecords,
        displayedTeamName: teamNameToRender(
          winsLossPoints.team_name_long,
          winsLossPoints.team_name_short
        ),
      };
    });
    console.log(finalData);
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
              {combinedData.map(
                ({
                  displayedTeamName,
                  id,
                  logo_image,
                  winsLossPoints,
                  GF_GA_DIFF,
                  homeWinsLossRecords,
                  awayWinsLossRecords,
                }) => {
                  return (
                    <tr key={`${displayedTeamName}-${id}`}>
                      <td id="standings-team-logo">
                        <Link to={''}>
                          <img
                            src={logo_image}
                            alt=""
                            className="team-logo standings-team-logo"
                          />
                          <p>{displayedTeamName}</p>
                        </Link>
                      </td>

                      <td>{winsLossPoints.games_played}</td>
                      <td>{winsLossPoints.total_wins}</td>
                      <td>{winsLossPoints.total_losses}</td>
                      <td></td>
                      <td>{winsLossPoints.total_ties}</td>
                      <td id="stat-points">{winsLossPoints.total_points}</td>
                      <td>
                        {pointsPercentageCalc(
                          winsLossPoints.games_played,
                          winsLossPoints.total_points
                        )}
                      </td>
                      <td></td>
                      <td></td>
                      <td>{GF_GA_DIFF.GF}</td>
                      <td>{GF_GA_DIFF.GA}</td>
                      <td>{GF_GA_DIFF.DIFF}</td>
                      <td>{calcWinsLossesTies(homeWinsLossRecords)}</td>
                      <td>{calcWinsLossesTies(awayWinsLossRecords)}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Standings;
