import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

// Current Season prop passed in from index.js is the current season for the sport being rendered (e.g. 2022-2023 season)
function Rosters({ currentSeason }) {
  // Get sport to render rosters for from the url
  const sportToQuery = window.location.pathname.split('/')[1];

  // const teamToQuery = window.location.pathname.split('/')[3];

  const defaultLevelToDisplay = 'A';
  const defaultTeamToDisplay = 'Bears';

  let teamNameCapitalized = '';

  const playersByPosition = {
    forwards: [],
    defense: [],
    goalies: [],
  };

  const location = useLocation();

  if (location?.state) {
    const { team } = location.state; // Destructure state prop that is passed from the Link element on Team.js so we can use to set the teams in drop-down menu and also use to query the database since the database contains team names such as Ice Dogs or Ducks
    teamNameCapitalized = team; // Used for drop-down menu and querying the database
  }

  //----------------------------------------------------------------- USE PARAMS HOOKS ------------------------------------------------------------------------
  const { teamName } = useParams(); // Gets team name from url path; This param variable is declared in index.js file
  const teamToQuery = teamName;

  //----------------------------------------------------------------- USE REF HOOKS ------------------------------------------------------------------------

  let pageData = useRef({
    seasons: [],
    allTeams: [],
    levels: [],
    multipleTeamsWithSameName: [],
  });

  //----------------------------------------------------------------- USE STATE HOOKS ------------------------------------------------------------------------
  const [rosterData, setRosterData] = useState(
    JSON.parse(localStorage.getItem('rosterData')) || {
      teamRoster: [],
      playersByPosition: {
        forwards: [],
        defenseman: [],
        goalies: [],
      },

      teamColorsAndLogo: {
        primaryColor: '',
        secondaryColor: '',
        thirdColor: '',
        logo: '',
      },
    }
  );
  const [selections, setSelections] = useState({
    selectedSeason:
      localStorage.getItem('season') || currentSeason[sportToQuery],
    selectedTeam: teamNameCapitalized || localStorage.getItem('team'), // Retrieve from local storage if page gets refreshed (so user stays on same page with same filters if page gets refreshed) otherwise take the team that was clicked on from teams page and render roster for that team
    selectedLevel: localStorage.getItem('level') || defaultLevelToDisplay,
  });

  //----------------------------------------------------------------- USE EFFECT HOOKS ------------------------------------------------------------------------

  // UseEffect hook that makes the initial calls upon page load to retrieve the available seasons, general team info and roster data
  useEffect(() => {
    const teamNameMoreThanOneWord = selections.selectedTeam.includes(' ');

    // If team has more than one word then use
    let teamToSearch = teamNameMoreThanOneWord
      ? selections.selectedTeam
      : teamToQuery;

    const seasonToQuery =
      localStorage.getItem('season') || currentSeason[sportToQuery];
    const levelToQuery = localStorage.getItem('level') || defaultLevelToDisplay;

    async function fetchData() {
      const fetchRosterData = fetch(
        `/api/${sportToQuery}/teams/${teamToSearch}/roster?season=${seasonToQuery}&level=${levelToQuery}`
      );

      const [rosterResponse, pageDataResponse] = await Promise.all([
        fetchRosterData,
        fetchPageData(),
      ]);
      const roster = await rosterResponse.json();

      await fetchMultipleTeamWithSameName(
        currentSeason[sportToQuery],
        teamToQuery,
        defaultLevelToDisplay
      );

      const teamColorsAndLogo = getTeamColorsAndLogo(teamToQuery);
      const playersByPosition = getPlayerByPositionAndTeam(roster);

      setRosterData({
        ...rosterData,
        teamRoster: roster,
        playersByPosition,
        teamColorsAndLogo: teamColorsAndLogo,
      });
    }

    fetchData();
  }, []);

  // Every time selected team is changed store the team in local storage so if user refreshes page it keeps the same team that user had selected and doesn't go back to blank or a default team
  useEffect(() => {
    localStorage.setItem('team', selections.selectedTeam);
    localStorage.setItem('season', selections.selectedSeason);
    localStorage.setItem('level', selections.selectedLevel);
    localStorage.setItem('rosterData', JSON.stringify(rosterData));
  }, [
    selections.selectedTeam,
    selections.selectedSeason,
    selections.selectedLevel,
    rosterData,
  ]);

  useEffect(() => {
    const teamPillFirstTeam = document.getElementById('pill0');
    if (teamPillFirstTeam) {
      teamPillFirstTeam.style.backgroundColor =
        rosterData.teamColorsAndLogo?.primaryColor;
    }
  }, [pageData.current.multipleTeamsWithSameName]);

  //----------------------------------------------------------------- FUNCTIONS ------------------------------------------------------------------------

  // Function to retrieve data for the dropdown filters on the page
  const fetchPageData = async function () {
    try {
      const APICalls = [
        fetch(`/api/${sportToQuery}/seasons`),
        fetch(`/api/${sportToQuery}/teams`),
        fetch(`/api/${sportToQuery}/levels`),
      ];
      const [seasonsDropdown, teamsDropdown, levelsDropdown] =
        await Promise.all(
          APICalls.map((call) => call.then((response) => response.json()))
        );

      pageData.current = {
        seasons: seasonsDropdown,
        allTeams: teamsDropdown,
        levels: levelsDropdown,
      };
    } catch (error) {
      console.log(error);
    }
  };

  // Function to retrieve names of teams if more than one team with same name. Example, Jr. Ducks A team could have 2 teams such as Jr. Ducks(1) and Jr. Ducks(2)
  const fetchMultipleTeamWithSameName = async (season, team, level) => {
    const response = await fetch(
      `/api/${sportToQuery}/teams/${team}/multiple-team-names?level=${level}&season=${season}`
    );

    const multipleTeamData = await response.json();
    pageData.current.multipleTeamsWithSameName = multipleTeamData;
    return multipleTeamData;
  };

  // Function to retrieve data every time a filter is changed to display rosters
  const fetchDataDueToSelectionChange = async (season, team, level) => {
    const response = await fetch(
      `/api/${sportToQuery}/teams/${team}/roster?season=${season}&level=${level}`
    );
    const roster = await response.json();
    return roster;
  };

  // Function to retrieve team colors and logo whenever a team is changed
  const getTeamColorsAndLogo = (selectedTeam) => {
    let teamColorsAndLogo = {
      primaryColor: '',
      secondaryColor: '',
      thirdColor: '',
      logo: '',
    };

    const teamToQuery = modifyTeamNameToLowercaseNoSpaces(selectedTeam);
    pageData.current.allTeams.forEach((team) => {
      const modifiedTeamName = modifyTeamNameToLowercaseNoSpaces(
        team.team_name_short
      );
      if (modifiedTeamName === teamToQuery) {
        teamColorsAndLogo = {
          primaryColor: team.primary_team_color,
          secondaryColor: team.secondary_team_color,
          thirdColor: team.third_team_color,
          logo: team.logo_image,
        };
      }
    });
    return teamColorsAndLogo;
  };

  const changeSelectedSeason = async (event) => {
    try {
      const season = event.target.value; // selected season from dropdown menu
      await setSelections({ ...selections, selectedSeason: season }); // Change state to selected season

      // Fetch new roster data due to selection change
      const { selectedTeam, selectedLevel } = selections; // destructuring of selections useState to pass into fetchDataDueToSelectionChange function
      const roster = await fetchDataDueToSelectionChange(
        season,
        selectedTeam,
        selectedLevel
      );

      await fetchMultipleTeamWithSameName(season, selectedTeam, selectedLevel);

      // If there is new roster data returned then organize the players by position and if no data returned then clear the playersByPosition state so no players display on page
      if (roster.length) {
        const playersByPosition = getPlayerByPositionAndTeam(roster);
        setRosterData({
          ...rosterData,
          teamRoster: roster,
          playersByPosition: playersByPosition,
        });
      } else {
        setRosterData({
          ...rosterData,
          playersByPosition: {
            forwards: [],
            defenseman: [],
            goalies: [],
          },
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const changeSelectedTeam = async (event) => {
    try {
      const team = event.target.value;
      setSelections({ ...selections, selectedTeam: team });
      modifyTeamNameToPlaceInURL(team);
      const teamColorsAndLogo = getTeamColorsAndLogo(team);

      const { selectedSeason, selectedLevel } = selections; // destructuring of selections useState to pass into fetchDataDueToSelectionChange function
      const roster = await fetchDataDueToSelectionChange(
        selectedSeason,
        team,
        selectedLevel
      );

      await fetchMultipleTeamWithSameName(selectedSeason, team, selectedLevel);

      if (roster.length) {
        const playersByPosition = getPlayerByPositionAndTeam(roster);
        setRosterData({
          ...rosterData,
          teamRoster: roster,
          playersByPosition: playersByPosition,
          teamColorsAndLogo: teamColorsAndLogo,
        });
      } else {
        setRosterData({
          ...rosterData,
          playersByPosition: {
            forwards: [],
            defenseman: [],
            goalies: [],
          },
          teamColorsAndLogo: teamColorsAndLogo,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const changeSelectedLevel = async (event) => {
    try {
      const level = event.target.value;
      await setSelections({ ...selections, selectedLevel: level });

      const { selectedSeason, selectedTeam } = selections; // destructuring of selections useState to pass into fetchDataDueToSelectionChange function
      const roster = await fetchDataDueToSelectionChange(
        selectedSeason,
        selectedTeam,
        level
      );

      await fetchMultipleTeamWithSameName(selectedSeason, selectedTeam, level);

      if (roster.length) {
        const playersByPosition = getPlayerByPositionAndTeam(roster);
        setRosterData({
          ...rosterData,
          teamRoster: roster,
          playersByPosition: playersByPosition,
        });
      } else {
        setRosterData({
          ...rosterData,
          playersByPosition: {
            forwards: [],
            defenseman: [],
            goalies: [],
          },
        });
      }
    } catch (error) {}
  };

  // This function takes the team name selected in drop-down and converts it to lower case with no spaces to insert into url path; window.history.pushState changes the url path with no reloading of page.
  const modifyTeamNameToPlaceInURL = (team) => {
    let modifiedTeam = '';
    if (team.indexOf(' ') >= 0) {
      modifiedTeam = team.replace(/ /g, '').toLowerCase();
    } else {
      modifiedTeam = team.toLowerCase();
    }
    window.history.pushState(
      '',
      '',
      `/${sportToQuery}/teams/${modifiedTeam}/roster`
    );
    return modifiedTeam;
  };

  const modifyTeamNameFromURL = (team) => {
    let teamName = '';
    rosterData.allTeams.forEach((el) => {
      const teamHave2Words = el.team_name_short.indexOf(' ') >= 0; // See if team name has two words; This returns a variable that is a boolean.
      const teamNameModified = teamHave2Words
        ? el.team_name_short.replace(/ /g, '').toLowerCase() // Replace space in team name to concatenate with all lowercase letters
        : el.team_name_short.toLowerCase();
      if (teamNameModified === team) {
        teamName = el.team_name_short;
      }
    });
    return teamName;
  };

  const modifyTeamNameToLowercaseNoSpaces = (team) => {
    let modifiedTeam = '';
    if (team.indexOf(' ') >= 0) {
      modifiedTeam = team.replace(/ /g, '').toLowerCase();
    } else {
      modifiedTeam = team.toLowerCase();
    }
    return modifiedTeam;
  };

  const getPlayerByPositionAndTeam = (roster) => {
    try {
      const playersByPosition = {
        forwards: [],
        defense: [],
        goalies: [],
      };

      if (roster.length) {
        roster.find((player) => {
          if (player.position === 'forward') {
            playersByPosition.forwards.push(player);
          } else if (player.position === 'defenseman') {
            playersByPosition.defense.push(player);
          } else if (player.position === 'goalie') {
            playersByPosition.goalies.push(player);
          }
        });
        return playersByPosition;
      } else {
        console.log(`There were no players to organize into positions`);
      }
    } catch (error) {
      throw error;
    }

    return playersByPosition;
  };

  const modBirthDateToDisplay = (birthDate) => {
    birthDate = new Date(birthDate); // Convert date string to date to perform Javascript functions
    return Intl.DateTimeFormat('en-US').format(birthDate);
  };

  // Function to change player name to primary team color when hovering over the player name
  const hoverOverPlayerName = (event) => {
    event.target.style.color = rosterData.teamColorsAndLogo?.primaryColor;
    event.target.style.transform = 'scale(1.05)';
  };

  // Function to change player name back to default color of black when no longer hovering over player name
  const leaveHoverStatePlayerName = (event) => {
    event.target.style.color = 'black';
  };

  //----------------------------------------------------------------- JSX ------------------------------------------------------------------------
  return (
    <>
      <div
        className="teams-container"
        style={{
          backgroundColor: rosterData.teamColorsAndLogo?.secondaryColor,
        }}
      >
        <Navbar />

        <div className="filter-dropdowns-container">
          <div className="filter-dropdowns">
            <label htmlFor="seasons">Season</label>
            <select
              name="seasons"
              id="seasons-selection"
              value={selections.selectedSeason}
              onChange={changeSelectedSeason}
            >
              {pageData.current.seasons.map((el) => {
                return (
                  <option value={el.season} key={el.season}>
                    {el.season}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="filter-dropdowns">
            <label htmlFor="teams">Team</label>
            <select
              name="teams"
              id="teams-selection"
              value={selections.selectedTeam}
              onChange={changeSelectedTeam}
            >
              {pageData.current.allTeams.map((el) => {
                return (
                  <option value={el.team_name_short} key={el.id}>
                    {el.team_name_short}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="filter-dropdowns">
            <label htmlFor="teams">Level</label>
            <select
              name="level"
              id="level-selection"
              value={selections.selectedLevel}
              onChange={changeSelectedLevel}
            >
              {pageData.current.levels.map((level) => {
                return <option key={level.level}>{level.level}</option>;
              })}
            </select>
          </div>
        </div>

        <img src={rosterData.teamColorsAndLogo?.logo} alt="" id="team-logo" />
        <h1
          style={{ color: `${rosterData.teamColorsAndLogo?.primaryColor}` }}
        >{`${selections.selectedTeam} Roster`}</h1>

        <div className="pill-container">
          {pageData.current.multipleTeamsWithSameName?.length
            ? pageData.current.multipleTeamsWithSameName.map((team, index) => {
                return (
                  <div key={team.actual_team_name}>
                    <a href="" className={`pill`} id={`pill${index}`}>
                      {team.actual_team_name}
                    </a>
                  </div>
                );
              })
            : ''}
        </div>

        <h3 style={{ color: `${rosterData.teamColorsAndLogo?.primaryColor}` }}>
          Forwards
        </h3>
        <table
          className="roster-table"
          style={{
            border: `10px solid ${rosterData.teamColorsAndLogo?.primaryColor}`,
          }}
        >
          <thead>
            <tr>
              <th>Player</th>
              <th>#</th>
              <th>Shooting Hand</th>
              <th>Height</th>
              <th>Weight</th>
              <th>Birth Date</th>
            </tr>
          </thead>

          <tbody>
            {rosterData.playersByPosition?.forwards?.map((player) => {
              return (
                <tr className="roster-table-data" key={player.id}>
                  <td className="shaded">
                    <Link className="player-img-name" to={''}>
                      <img
                        src={player.profile_img_1}
                        alt=""
                        style={{
                          border: `2px solid ${rosterData.teamColorsAndLogo?.primaryColor}`,
                        }}
                      />
                      <p
                        className="left player-name default-color"
                        onMouseEnter={hoverOverPlayerName}
                        onMouseLeave={leaveHoverStatePlayerName}
                      >
                        {`${player.first_name} ${player.last_name}`}
                      </p>
                    </Link>
                  </td>
                  <td className="centered">{player.jersey_number}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="centered">
                    {modBirthDateToDisplay(player.date_of_birth)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h3 style={{ color: `${rosterData.teamColorsAndLogo?.primaryColor}` }}>
          Defense
        </h3>
        <table
          className="roster-table"
          style={{
            border: `10px solid ${rosterData.teamColorsAndLogo?.primaryColor}`,
          }}
        >
          <thead>
            <tr>
              <th>Player</th>
              <th>#</th>
              <th>Shooting Hand</th>
              <th>Height</th>
              <th>Weight</th>
              <th>Birth Date</th>
            </tr>
          </thead>

          <tbody>
            {rosterData.playersByPosition?.defense?.map((player) => {
              return (
                <tr className="roster-table-data" key={player.id}>
                  <td className="shaded">
                    <Link className="player-img-name" to={''}>
                      <img
                        src={player.profile_img_1}
                        alt=""
                        style={{
                          border: `2px solid ${rosterData.teamColorsAndLogo?.primaryColor}`,
                        }}
                      />
                      <p className="left">
                        {`${player.first_name} ${player.last_name}`}
                      </p>
                    </Link>
                  </td>
                  <td className="centered">{player.jersey_number}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="centered">
                    {modBirthDateToDisplay(player.date_of_birth)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h3 style={{ color: `${rosterData.teamColorsAndLogo?.primaryColor}` }}>
          Goalies
        </h3>
        <table
          className="roster-table"
          style={{
            border: `10px solid ${rosterData.teamColorsAndLogo?.primaryColor}`,
          }}
        >
          <thead>
            <tr>
              <th>Player</th>
              <th>#</th>
              <th>Height</th>
              <th>Weight</th>
              <th>Birth Date</th>
            </tr>
          </thead>

          <tbody>
            {rosterData.playersByPosition?.goalies?.map((player) => {
              return (
                <tr className="roster-table-data" key={player.id}>
                  <td className="shaded">
                    <Link className="player-img-name" to={''}>
                      <img
                        src={player.profile_img_1}
                        alt=""
                        style={{
                          border: `2px solid ${rosterData.teamColorsAndLogo?.primaryColor}`,
                        }}
                      />
                      <p className="left">
                        {`${player.first_name} ${player.last_name}`}
                      </p>
                    </Link>
                  </td>
                  <td className="centered">{player.jersey_number}</td>
                  <td></td>
                  <td></td>
                  <td className="centered">
                    {modBirthDateToDisplay(player.date_of_birth)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Rosters;
