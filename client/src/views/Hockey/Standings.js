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
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [combinedData]);

  useEffect(() => {
    const dataCheck = () => {
      try {
        const allTeamStreaks = [];
        const fetchMoreDataCheck = async (team, gamesArray) => {
          console.log(team);
          console.log(gamesArray);

          let earliestGameDate = new Date(
            gamesArray[gamesArray.length - 1].game_date
          );

          const year = earliestGameDate.getFullYear();
          const month = earliestGameDate.getMonth() + 1;
          const dayOfMonth = earliestGameDate.getDate();
          earliestGameDate = `${year}-${month}-${dayOfMonth}`;
          console.log(earliestGameDate);

          const season = gamesArray[0].season;
          const level = gamesArray[0].team_level;
          const division = gamesArray[0].division;

          let winsCheck = gamesArray.every(
            (game) =>
              game.winning_team_long === team ||
              game.winning_team_short === team
          );

          let lossesCheck = gamesArray.every(
            (game) =>
              game.losing_team_long === team || game.losing_team_short === team
          );

          let tiesCheck = gamesArray.every(
            (game) =>
              game.winning_team_long === null ||
              game.winning_team_short === null
          );

          console.log(winsCheck, lossesCheck, tiesCheck);

          const statStreak = winsCheck
            ? 'winsStreak'
            : lossesCheck
            ? 'lossesStreak'
            : tiesCheck
            ? 'tiesStreak'
            : '';
          console.log(statStreak);

          while (winsCheck || lossesCheck || tiesCheck) {
            const response = await fetch(
              `/api/${sportToQuery}/teams/last-10-streak?season=${season}&level=${level}&division=${division}&team=${team}&earliestGame=${earliestGameDate}`
            );
            console.log(
              `/api/${sportToQuery}/teams/last-10-streak?season=${season}&level=${level}&division=${division}&team=${team}&earliestGame=${earliestGameDate}`
            );
            const data = await response.json();
            console.log(data);

            switch (statStreak) {
              case 'winsStreak':
                winsCheck = data.every(
                  (game) =>
                    game.winning_team_long === team ||
                    game.winning_team_short === team
                );
                break;
              case 'lossesStreak':
                lossesCheck = data.every(
                  (game) =>
                    game.losing_team_long === team ||
                    game.losing_team_short === team
                );
                break;
              case 'tiesStreak':
                tiesCheck = gamesArray.every(
                  (game) =>
                    game.winning_team_long === null ||
                    game.winning_team_short === null
                );
                break;
              default:
                console.log('There is no default');
            }
          }

          const winsLossTieArray = [];
          gamesArray.map((game) => {
            if (
              game.winning_team_long === team ||
              game.winning_team_short === team
            ) {
              winsLossTieArray.push('W');
            } else if (
              game.losing_team_long === team ||
              game.losing_team_short === team
            ) {
              winsLossTieArray.push('L');
            } else if (
              game.winning_team_long === null ||
              game.winning_team_short === null
            ) {
              winsLossTieArray.push('T');
            }
            return winsLossTieArray;
          });
          let streakNumber = 1;
          console.log(winsLossTieArray);
          let streak = `${streakNumber}${winsLossTieArray[0]}`;
          for (let i = 0; i < winsLossTieArray.length; i++) {
            if (winsLossTieArray[i] === winsLossTieArray[i + 1]) {
              streak = `${(streakNumber += 1)}${winsLossTieArray[0]}`;
            } else {
              streak = `${streakNumber}${winsLossTieArray[0]}`;
              break;
            }
          }
          console.log(streak);

          const teamDataToAdd = { team: team, streak: streak };
          console.log(teamDataToAdd);
          allTeamStreaks.push(teamDataToAdd);
          setGameStreak(allTeamStreaks);
        };
        const dataCheck = last10.forEach((team) => {
          console.log(team.team, team.data);
          fetchMoreDataCheck(team.team, team.data);
        });
      } catch (error) {
        console.error(error);
      }
    };
    dataCheck();
  }, [last10]);

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
    setTeamsData(teamsData);
    const combinedStandingsData = {
      winsLossesPoints,
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

  const getCombinedDataToRender = (combinedData, teamsData) => {
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
                      <td>{calcLast10Streak(displayedTeamName)}</td>
                      <td>
                        {gameStreak.map((streak) => {
                          if (streak.team === displayedTeamName) {
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
