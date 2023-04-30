import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

// Current Season prop passed in from index.js is the current season for the sport being rendered (e.g. 2022-2023 season)
function Rosters({ currentSeason }) {
  // Get sport to render rosters for from the url
  const sportToQuery = window.location.pathname.split('/')[1];

  const teamToQuery = window.location.pathname.split('/')[3];

  const defaultLevelToDisplay = 'A';

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

  //----------------------------------------------------------------- USE REF HOOKS ------------------------------------------------------------------------

  let pageData = useRef({
    seasons: [],
    allTeams: [],
    levels: [],
    multipleTeamsWithSameName: [],
  });

  //----------------------------------------------------------------- USE STATE HOOKS ------------------------------------------------------------------------
  const [rosterData, setRosterData] = useState({
    teamRoster: [],
    playersByPosition: {
      forwards: [],
      defenseman: [],
      goalies: [],
    },
  });
  const [selections, setSelections] = useState({
    selectedSeason: currentSeason[sportToQuery],
    selectedTeam: teamNameCapitalized,
    selectedLevel: defaultLevelToDisplay,
  });

  //----------------------------------------------------------------- USE EFFECT HOOKS ------------------------------------------------------------------------

  // UseEffect hook that makes the initial calls upon page load to retrieve the available seasons, general team info and roster data
  useEffect(() => {
    async function fetchData() {
      const fetchRosterData = fetch(
        `/api/${sportToQuery}/teams/${teamToQuery}/roster?season=${currentSeason[sportToQuery]}&level=${defaultLevelToDisplay}`
      );
      console.log(
        `/api/${sportToQuery}/teams/${teamToQuery}/roster?season=${currentSeason[sportToQuery]}&level=${defaultLevelToDisplay}`
      );
      const [rosterResponse, pageDataResponse] = await Promise.all([
        fetchRosterData,
        fetchPageData(),
      ]);
      const roster = await rosterResponse.json();
      console.log(roster);
      console.log(pageData);

      let teamColorsAndLogo = {
        primaryColor: '',
        secondaryColor: '',
        thirdColor: '',
        logo: '',
      };
      roster.forEach((team) => {
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
      getPlayerByPositionAndTeam(roster);
      setRosterData({
        ...rosterData,
        teamRoster: roster,
        playersByPosition: playersByPosition,
        teamColorsAndLogo,
      });
    }
    fetchData();
  }, []);

  // useEffect(() => {
  // console.log(`single team data changed`);
  // getPlayerByPositionAndTeam();
  // async function fetchMultipleTeamData() {
  //   try {
  //     const multipleTeamResponse = await fetch(
  //       `/api/${sportToQuery}/teams/${rosterData.selectedTeam}/multiple-team-names?level=${rosterData.selectedLevel}`
  //     );
  //     console.log(
  //       `/api/${sportToQuery}/teams/${rosterData.selectedTeam}/multiple-team-names?level=${rosterData.selectedLevel}`
  //     );
  //     const multipleTeamData = await multipleTeamResponse.json();
  //     console.log(multipleTeamData);
  //     setRosterData({ ...rosterData, multipleTeamNames: multipleTeamData });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
  // fetchMultipleTeamData();
  // },
  // [rosterData.teamRoster]);

  useEffect(() => {
    const teamPillFirstTeam = document.getElementById('pill0');
    console.log(teamPillFirstTeam?.innerText);
    if (teamPillFirstTeam) {
      teamPillFirstTeam.style.backgroundColor =
        rosterData.teamColorsAndLogo?.primaryColor;
    }
  }, [rosterData.multipleTeamData]);

  //----------------------------------------------------------------- FUNCTIONS ------------------------------------------------------------------------

  const fetchPageData = async function () {
    try {
      const APICalls = [
        fetch(`/api/${sportToQuery}/seasons`),
        fetch(`/api/${sportToQuery}/teams`),
        fetch(`/api/${sportToQuery}/levels`),
        fetch(
          `/api/${sportToQuery}/teams/${teamToQuery}/multiple-team-names?level=${defaultLevelToDisplay}`
        ),
      ];
      const [
        seasonsDropdown,
        teamsDropdown,
        levelsDropdown,
        multipleTeamsWithSameName,
      ] = await Promise.all(
        APICalls.map((call) => call.then((response) => response.json()))
      );
      console.log(
        seasonsDropdown,
        teamsDropdown,
        levelsDropdown,
        multipleTeamsWithSameName
      );
      return (pageData.current = {
        seasons: seasonsDropdown,
        allTeams: teamsDropdown,
        levels: levelsDropdown,
        multipleTeamsWithSameName: multipleTeamsWithSameName,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const changeSelectedSeason = async (event) => {
    try {
      setSelections({ ...selections, selectedSeason: event.target.value });
      const response = await fetch(
        `/api/${sportToQuery}/teams/${selections.selectedTeam}/roster?season=${event.target.value}&level=${selections.selectedLevel}`
      );
      const roster = await response.json();
      setRosterData({
        ...rosterData,
        singleTeam: roster,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const changeSelectedTeam = async (event) => {
    try {
      setSelections({ ...selections, selectedTeam: event.target.value });
      modifyTeamNameToPlaceInURL(event.target.value);
      const response = await fetch(
        `/api/${sportToQuery}/teams/${modifyTeamNameToPlaceInURL(
          event.target.value
        )}/roster?season=${rosterData.selectedSeason}&teamToQuery=${
          event.target.value
        }&level=${rosterData.selectedLevel}`
      );
      const roster = await response.json();

      pageData.allTeams.forEach((team) => {
        if (team.team_name_short === event.target.value) {
          const teamColorsAndLogo = {
            primaryColor: team.primary_team_color,
            secondaryColor: team.secondary_team_color,
            thirdColor: team.third_team_color,
            logo: team.logo_image,
          };
          setSelections({
            ...selections,
            selectedTeam: event.target.value,
            singleTeam: roster,
            teamColorsAndLogo,
          });
        }
      });
    } catch (error) {}
  };

  const changeSelectedLevel = async (event) => {
    try {
      setSelections({ ...selections, selectedLevel: event.target.value });

      const response = await fetch(
        `/api/${sportToQuery}/teams/${rosterData.selectedTeam}/roster?season=${rosterData.selectedSeason}&level=${event.target.value}`
      );
      const roster = await response.json();
      setRosterData({
        ...rosterData,
        singleTeam: roster,
      });
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
    console.log(team);
    let teamName = '';
    rosterData.allTeams.forEach((el) => {
      const teamHave2Words = el.team_name_short.indexOf(' ') >= 0; // See if team name has two words; This returns a variable that is a boolean.
      const teamNameModified = teamHave2Words
        ? el.team_name_short.replace(/ /g, '').toLowerCase() // Replace space in team name to concatenate with all lowercase letters
        : el.team_name_short.toLowerCase();
      if (teamNameModified === team) {
        console.log(teamNameModified, team, el.team_name_short);
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
      if (roster.length) {
        rosterData.teamRoster.find((player) => {
          console.log(player);
          if (player.position === 'forward') {
            playersByPosition.forwards.push(player);
          } else if (player.position === 'defenseman') {
            playersByPosition.defense.push(player);
          } else if (player.position === 'goalie') {
            playersByPosition.goalies.push(player);
          }
        });
        console.log(playersByPosition);
        return playersByPosition;
      }
    } catch (error) {
      console.log('There was an error');
      throw error;
    }
    // return setRosterData({ ...rosterData, playerPositions: playersByPosition });
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
        >{`${rosterData.selectedTeam} Roster`}</h1>

        <div className="pill-container">
          {rosterData.multipleTeamNames?.length
            ? rosterData.multipleTeamNames.map((team, index) => {
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
            {rosterData.playerPositions?.forwards?.map((player) => {
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
            {rosterData.playerPositions?.defense?.map((player) => {
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
            {rosterData.playerPositions?.goalies?.map((player) => {
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
