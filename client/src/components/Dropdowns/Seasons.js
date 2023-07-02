import { useState, useEffect } from 'react';
import { globalVariables } from '../../model/globalVariables';

function Seasons({ dropdownSelection, fetchData }) {
  const defaultSeason = globalVariables.currentSeason.hockey;
  const localStorageSeason = localStorage.getItem('season');

  //?----------------------------------------------------------------- UseState Hooks ------------------------------------------------------------------------
  const [seasonDropdown, setSeasonDropdown] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(
    localStorageSeason || defaultSeason
  );

  //?----------------------------------------------------------------- UseEffect Hooks ------------------------------------------------------------------------
  // Fetch seasons data on initial render of component
  useEffect(() => {
    const fetchDropdownData = async () => {
      const response = await fetch(`/api/hockey/seasons`);
      const data = await response.json();
      console.log(await data);
      setSeasonDropdown(data);
    };
    fetchDropdownData();
  }, []);

  //?----------------------------------------------------------------- Functions ------------------------------------------------------------------------
  const changeSeason = (event) => {
    setSelectedSeason(event.target.value);
    dropdownSelection('season', event.target.value); // Callback function to pass state back to parent
    fetchData(event.target.value, undefined, undefined);
  };

  //?----------------------------------------------------------------- JSX ------------------------------------------------------------------------
  return (
    <div className="single-dropdown-container">
      <label htmlFor="season-dropdown">Season</label>
      <select
        name="season-dropdown"
        className="filter-dropdowns"
        id="season-dropdown"
        value={selectedSeason}
        onChange={changeSeason}
      >
        {seasonDropdown?.map((el) => {
          return (
            <option key={el.season} value={el.season}>
              {el.season}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default Seasons;
