import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import GlobalFunctions from '../../model/globalFunctions';
import Navbar from '../../components/Navbar';

function Scores() {
  const navigate = useNavigate();
  let urlPath;

  const location = useLocation();
  const currentPath = location.pathname;
  const sportToQuery = currentPath.split('/')[1];

  const defaultLevel = 'A';
  const defaultLeague = '12U - Peewee';

  //?----------------------------------------------------------------- USE STATE HOOKS ------------------------------------------------------------------------
  const [dropdowns, setDropdowns] = useState({
    levels: [],
    leagues: [],
  });

  const [selections, setSelections] = useState({
    selectedLevel: defaultLevel,
    selectedLeague: defaultLeague,
  });

  //?----------------------------------------------------------------- USE REF HOOKS ------------------------------------------------------------------------

  //?----------------------------------------------------------------- USE EFFECT HOOKS ------------------------------------------------------------------------
  useEffect(() => {
    const fetchDropdownData = async () => {
      const [levelsResponse, leaguesResponse] = await Promise.all([
        fetch(`/api/${sportToQuery}/levels`),
        fetch(`/api/${sportToQuery}/leagues`),
      ]);

      const levels = await levelsResponse.json();
      const leagues = await leaguesResponse.json();
      console.log(levels);
      console.log(leagues);
      setDropdowns({ levels: levels, leagues: leagues });
    };
    fetchDropdownData();
  }, []);

  //?----------------------------------------------------------------- FUNCTIONS ------------------------------------------------------------------------
  const changeSelectedLevel = (event) => {
    setSelections({ ...selections, selectedLevel: event.target.value });
  };

  const changeSelectedLeague = (event) => {
    setSelections({ ...selections, selectedLeague: event.target.value });
  };
  //?----------------------------------------------------------------- JSX ------------------------------------------------------------------------
  return (
    <div>
      <select
        name="level-dropdown"
        id="level-dropdown"
        value={selections.selectedLevel}
        onChange={changeSelectedLevel}
      >
        {dropdowns.levels.map((level) => {
          return (
            <option key={level.team_level} value={level.team_level}>
              {level.team_level}
            </option>
          );
        })}
      </select>

      <select
        name="level-dropdown"
        id="league-dropdown"
        value={selections.selectedLeague}
        onChange={changeSelectedLeague}
      >
        {dropdowns.leagues.map((league) => {
          return (
            <option key={league.league_age} value={league.league_age}>
              {league.league_age}
            </option>
          );
        })}
      </select>
    </div>
  );
}
export default Scores;
