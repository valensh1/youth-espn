import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Seasons from '../../components/Dropdowns/Seasons';
import Levels from '../../components/Dropdowns/Levels';
import Divisions from '../../components/Dropdowns/Divisions';
import { globalVariables } from '../../model/globalVariables';

function Standings() {
  const location = useLocation();
  const currentPath = location.pathname;
  const sportToQuery = currentPath.split('/')[1];

  const defaultLevel = 'A';
  const defaultDivision = 'Peewee';
  const defaultSeason = globalVariables.currentSeason.hockey;
  const localStorageLevel = localStorage.getItem('level');
  const localStorageDivision = localStorage.getItem('division');
  const localStorageSeason = localStorage.getItem('season');

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
    level: localStorageLevel || defaultLevel,
    division: localStorageDivision || defaultDivision,
    season: localStorageSeason || defaultSeason,
  });

  const [teamsData, setTeamsData] = useState([]);
  const [last10, setLast10] = useState([]);
  const [gameStreak, setGameStreak] = useState([]);
  const [combinedData, setCombinedData] = useState([]);

  //?----------------------------------------------------------------- UseEffect Hooks ------------------------------------------------------------------------

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getLast10GamesData(
          sportToQuery,
          selections.season,
          selections.level,
          selections.division
        );

        const teamGames = await Promise.all(
          combinedData.map(async (team) => {
            const teamGameStreak = await getTeamGames(team.displayedTeamName);
            return teamGameStreak;
          })
        );
        calcTeamGameStreak(teamGames);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [combinedData]);

  //?----------------------------------------------------------------- Functions ------------------------------------------------------------------------
  // Function that takes child state (selected level, division, season, etc) from dropdown components and sets children states at the parent level
  const changeSelection = (dropdown, childState) => {
    let division = '';
    if (dropdown === 'division') {
      division = divisionToQuery(childState);
    }
    setSelections({ ...selections, [dropdown]: division || childState });
    localStorage.setItem(`${dropdown}`, childState);
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
    const team_division = divisionToQuery(division);
    const [
      winsLossRecord,
      GF_GA_DIFF,
      homeWinLossRecord,
      awayWinLossRecord,
      teams,
    ] = await Promise.all([
      fetch(
        `/api/${sportToQuery}/standings?season=${season}&level=${level}&division=${team_division}&gameType=Regular Season`
      ),
      fetch(
        `/api/${sportToQuery}/teams/GF_GA_DIFF?season=${season}&level=${level}&division=${team_division}`
      ),
      fetch(
        `/api/${sportToQuery}/teams/home-records?season=${season}&level=${level}&division=${team_division}&gameType=Regular Season`
      ),
      fetch(
        `/api/${sportToQuery}/teams/away-records?season=${season}&level=${level}&division=${team_division}&gameType=Regular Season`
      ),
      fetch(
        `/api/${sportToQuery}/teams-season?season=${season}&level=${level}&division=${team_division}`
      ),
    ]);
    const teamRecordsAndPoints = await winsLossRecord.json();
    const GF_GA = await GF_GA_DIFF.json();
    const homeWinsLossRecord = await homeWinLossRecord.json();
    const awayWinsLossRecord = await awayWinLossRecord.json();
    const teamsData = await teams.json();
    setTeamsData(teamsData);
    const combinedStandingsData = {
      teamRecordsAndPoints,
      GF_GA,
      homeWinsLossRecord,
      awayWinsLossRecord,
    };
    getCombinedDataToRender(combinedStandingsData, teamsData);
  };

  const getLast10GamesData = async (
    sport = 'Hockey',
    season,
    level,
    division
  ) => {
    try {
      const teamsArray = combinedData.map((team) => {
        return team.displayedTeamName;
      });
      const data = await Promise.all(
        teamsArray.map(async (team) => {
          const response = await fetch(
            `/api/${sport}/teams/last-10-streak?team=${team}&season=${season}&level=${level}&division=${division}`
          );
          const jsonData = await response.json();
          return { data: jsonData, team: team };
        })
      );
      setLast10(data);
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  const calcLast10Streak = (team) => {
    const teamData = last10.find((el) => {
      return el.team === team;
    });
    const last10Record = {
      wins: 0,
      losses: 0,
      ties: 0,
    };
    teamData?.data.forEach((el) => {
      if (el.winning_team_long === team || el.winning_team_short === team) {
        last10Record.wins += 1;
      } else if (
        el.losing_team_long === team ||
        el.losing_team_short === team
      ) {
        last10Record.losses += 1;
      } else {
        last10Record.ties += 1;
      }
    });
    return `${last10Record.wins}-${last10Record.losses}-${last10Record.ties}`;
  };

  const getTeamGames = async (team) => {
    const response = await fetch(
      `/api/${sportToQuery}/teams/game-streak?season=${selections.season}&level=${selections.level}&division=${selections.division}&team=${team}&gameType=Regular Season`
    );
    const data = await response.json();
    return data;
  };

  const calcTeamGameStreak = (teamGames) => {
    console.log(teamGames);
    let allTeamStreaks = [];
    for (let i = 0; i < teamGames.length; i++) {
      let streakNumber = 1;
      let streak = '';
      for (let j = 0; j < teamGames[i]?.length; j++) {
        streak = teamGames[i][j]?.game_result;
        if (teamGames[i][j]?.game_result === teamGames[i][j + 1]?.game_result) {
          streakNumber++;
        } else {
          break;
        }
      }
      allTeamStreaks.push({
        team_long: teamGames[i][0].team_long,
        team_short: teamGames[i][0].team_short,
        streak: `${streakNumber}${streak}`,
      });
    }
    setGameStreak(allTeamStreaks);
  };

  // Function to sort the standings by points in DESC order and then by displayed team name in ASC order
  const sortData = (data) => {
    data.sort((a, b) => {
      if (b.winsLossesTiesPoints.points !== a.winsLossesTiesPoints.points) {
        return b.winsLossesTiesPoints.points - a.winsLossesTiesPoints.points;
      } else {
        return a.displayedTeamName.localeCompare(b.displayedTeamName);
      }
    });
  };

  const getCombinedDataToRender = (combinedData, teamsData) => {
    let finalDataToRender = [];

    teamsData.forEach((team, index) => {
      finalDataToRender.push({
        teamInfo: { ...team },
        displayedTeamName: teamNameToRender(team.team_long, team.team_short),
        winsLossesTiesPoints: { GP: 0, wins: 0, losses: 0, ties: 0, points: 0 },
        GF_GA_DIFF: { GF: 0, GA: 0, DIFF: 0 },
      });

      combinedData.teamRecordsAndPoints.records?.wins.forEach((el) => {
        if (el.team_long === team.team_long) {
          finalDataToRender[index].winsLossesTiesPoints = {
            ...finalDataToRender[index].winsLossesTiesPoints,
            wins: el.wins,
            GP: (finalDataToRender[index].winsLossesTiesPoints.GP += Number(
              el.wins
            )),
          };
        }
      });

      combinedData.teamRecordsAndPoints.records?.losses.forEach((el) => {
        if (el.team_long === team.team_long) {
          finalDataToRender[index].winsLossesTiesPoints = {
            ...finalDataToRender[index].winsLossesTiesPoints,
            losses: el.losses,
            GP: (finalDataToRender[index].winsLossesTiesPoints.GP += Number(
              el.losses
            )),
          };
        }
      });

      combinedData.teamRecordsAndPoints.records?.ties.forEach((el) => {
        if (el.team_long === team.team_long) {
          finalDataToRender[index].winsLossesTiesPoints = {
            ...finalDataToRender[index].winsLossesTiesPoints,
            ties: el.ties,
            GP: (finalDataToRender[index].winsLossesTiesPoints.GP += Number(
              el.ties
            )),
          };
        }
      });

      combinedData.teamRecordsAndPoints?.points?.forEach((el) => {
        if (el.team_long === team.team_long) {
          finalDataToRender[index].winsLossesTiesPoints = {
            ...finalDataToRender[index].winsLossesTiesPoints,
            points: el.points,
          };
        }
      });

      combinedData.GF_GA.forEach((goalStat) => {
        if (
          goalStat.team_long === team.team_long &&
          goalStat.team_short === team.team_short
        ) {
          finalDataToRender[index].GF_GA_DIFF = {
            GF: goalStat.GF,
            GA: goalStat.GA,
            DIFF: goalStat.DIFF,
          };
        }
      });

      const homeWinsLossRecords = {
        wins: [],
        losses: [],
        ties: [],
      };

      combinedData.homeWinsLossRecord.forEach((stat) => {
        if (
          stat.home_team_long === team.team_long &&
          stat.winning_team_long === stat.home_team_long
        ) {
          homeWinsLossRecords.wins.push(stat);
        } else if (
          stat.home_team_long === team.team_long &&
          stat.winning_team_long !== stat.home_team_long &&
          stat.tie === false
        ) {
          homeWinsLossRecords.losses.push(stat);
        } else if (
          stat.home_team_long === team.team_long &&
          stat.tie === true
        ) {
          homeWinsLossRecords.ties.push(stat);
        }
        const homeRecord = calcWinsLossesTies(homeWinsLossRecords);
        finalDataToRender[index].homeAwayRecords = {
          ...finalDataToRender[index].homeAwayRecords,
          homeRecord: homeRecord,
        };
      });

      console.log(
        teamNameToRender(team.team_long, team.team_short),
        homeWinsLossRecords
      );

      const awayWinsLossRecords = {
        wins: [],
        losses: [],
        ties: [],
      };

      combinedData.awayWinsLossRecord.forEach((stat) => {
        if (
          stat.visitor_team_long === team.team_long &&
          stat.winning_team_long === stat.visitor_team_long
        ) {
          awayWinsLossRecords.wins.push(stat);
        } else if (
          stat.visitor_team_long === team.team_long &&
          stat.winning_team_long !== stat.visitor_team_long &&
          stat.tie === false
        ) {
          awayWinsLossRecords.losses.push(stat);
        } else if (
          stat.visitor_team_long === team.team_long &&
          stat.tie === true
        ) {
          awayWinsLossRecords.ties.push(stat);
        }
        const awayRecord = calcWinsLossesTies(awayWinsLossRecords);
        finalDataToRender[index].homeAwayRecords = {
          ...finalDataToRender[index].homeAwayRecords,
          awayRecord: awayRecord,
        };
      });

      console.log(
        teamNameToRender(team.team_long, team.team_short),
        awayWinsLossRecords
      );
    });

    console.log(finalDataToRender);
    sortData(finalDataToRender);
    setCombinedData(finalDataToRender);
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
                  GF_GA_DIFF,
                  displayedTeamName,
                  homeAwayRecords,
                  teamInfo,
                  winsLossesTiesPoints,
                }) => {
                  return (
                    <tr key={`${displayedTeamName}-${teamInfo.id}`}>
                      <td id="standings-team-logo">
                        <Link to={''}>
                          <img
                            src={teamInfo.logo_image}
                            alt=""
                            className="team-logo standings-team-logo"
                          />
                          <p>{displayedTeamName}</p>
                        </Link>
                      </td>

                      <td>{winsLossesTiesPoints.GP}</td>
                      <td>{winsLossesTiesPoints.wins}</td>
                      <td>{winsLossesTiesPoints.losses}</td>
                      <td></td>
                      <td>{winsLossesTiesPoints.ties}</td>
                      <td id="stat-points">{winsLossesTiesPoints.points}</td>
                      <td>
                        {pointsPercentageCalc(
                          winsLossesTiesPoints.GP,
                          winsLossesTiesPoints.points
                        )}
                      </td>
                      <td></td>
                      <td></td>
                      <td>{GF_GA_DIFF.GF}</td>
                      <td>{GF_GA_DIFF.GA}</td>
                      <td>{GF_GA_DIFF.DIFF}</td>
                      <td>{homeAwayRecords.homeRecord}</td>
                      <td>{homeAwayRecords.awayRecord}</td>
                      <td></td>
                      <td>{calcLast10Streak(displayedTeamName)}</td>
                      <td>
                        {gameStreak.map((streak) => {
                          if (
                            streak.team_long === displayedTeamName ||
                            streak.team_short === displayedTeamName
                          ) {
                            return <>{streak.streak}</>;
                          }
                        })}
                      </td>
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
