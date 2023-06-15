import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Seasons from '../../components/Dropdowns/Seasons';
import Levels from '../../components/Dropdowns/Levels';
import Divisions from '../../components/Dropdowns/Divisions';
import { globalVariables } from '../../model/globalVariables';

function Standings() {
  const navigate = useNavigate();
  let urlPath;

  const location = useLocation();
  const currentPath = location.pathname;
  const sportToQuery = currentPath.split('/')[1];

  const defaultLevel = 'A';
  const defaultDivision = 'Peewee';
  const defaultSeason = globalVariables.currentSeason.hockey;

  //?----------------------------------------------------------------- UseState Hooks ------------------------------------------------------------------------
  const [selections, setSelections] = useState({
    level: defaultLevel,
    division: defaultDivision,
    season: defaultSeason,
  });

  const [standings, setStandings] = useState([]);

  //?----------------------------------------------------------------- UseEffect Hooks ------------------------------------------------------------------------

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `/api/${sportToQuery}/standings?season=${selections.season}&level=${selections.level}&division=${selections.division}`
      );
      const data = await response.json();
      console.log(data);
      setStandings(data);
    };
    fetchData();
  }, []);

  //?----------------------------------------------------------------- Functions ------------------------------------------------------------------------
  // Function that takes child state (selected level, division, season, etc) from dropdown components and sets children states at the parent level
  const changeSelection = (dropdown, childState) => {
    setSelections({ ...selections, [dropdown]: childState });
    console.log(childState);
  };

  //?----------------------------------------------------------------- JSX ------------------------------------------------------------------------

  return (
    <div id="standings-page-container">
      <Navbar />
      <div id="dropdowns-container">
        <Seasons dropdownSelection={changeSelection} />
        <Levels dropdownSelection={changeSelection} />
        <Divisions dropdownSelection={changeSelection} />
      </div>
      <h1>Standings</h1>
    </div>
  );
}

export default Standings;
