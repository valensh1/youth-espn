import { useState, useEffect } from 'react';

function Divisions({ dropdownSelection }) {
  const defaultDivision = '12U - Peewee';
  //?----------------------------------------------------------------- UseState Hooks ------------------------------------------------------------------------
  const [leagueDropdown, setDivisionDropdown] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState(defaultDivision);

  //?----------------------------------------------------------------- UseEffect Hooks ------------------------------------------------------------------------
  // Fetch leagues data on initial render of component
  useEffect(() => {
    const fetchDropdownData = async () => {
      const response = await fetch(`/api/hockey/leagues`);
      const data = await response.json();
      console.log(await data);
      setDivisionDropdown(data);
    };
    fetchDropdownData();
  }, []);

  //?----------------------------------------------------------------- Functions ------------------------------------------------------------------------
  const changeDivision = (event) => {
    setSelectedDivision(event.target.value);
    dropdownSelection('division', event.target.value); // Callback function to pass state back to parent
  };

  //?----------------------------------------------------------------- JSX ------------------------------------------------------------------------
  return (
    <div className="single-dropdown-container">
      <label htmlFor="division-dropdown">Division</label>
      <select
        name="division-dropdown"
        className="filter-dropdowns"
        id="division-dropdown"
        value={selectedDivision}
        onChange={changeDivision}
      >
        {leagueDropdown?.map((el) => {
          return (
            <option key={el.league_level} value={el.league_age}>
              {el.league_age}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default Divisions;
