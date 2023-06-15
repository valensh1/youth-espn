import { useState, useEffect } from 'react';

function Levels({ dropdownSelection }) {
  const defaultLevel = 'A';
  //?----------------------------------------------------------------- UseState Hooks ------------------------------------------------------------------------
  const [levelDropdown, setLevelDropdown] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(defaultLevel);

  //?----------------------------------------------------------------- UseEffect Hooks ------------------------------------------------------------------------
  // Fetch levels data on initial render of component
  useEffect(() => {
    const fetchDropdownData = async () => {
      const response = await fetch(`/api/hockey/levels`);
      const data = await response.json();
      console.log(await data);
      setLevelDropdown(data);
    };
    fetchDropdownData();
  }, []);

  //?----------------------------------------------------------------- Functions ------------------------------------------------------------------------
  const changeLevel = (event) => {
    setSelectedLevel(event.target.value);
    dropdownSelection('level', event.target.value); // Callback function to pass state back to parent
  };

  //?----------------------------------------------------------------- JSX ------------------------------------------------------------------------
  return (
    <div className="single-dropdown-container">
      <label htmlFor="level-dropdown">Level</label>
      <select
        name="level-dropdown"
        className="filter-dropdowns"
        id="level-dropdown"
        value={selectedLevel}
        onChange={changeLevel}
      >
        {levelDropdown?.map((el) => {
          return (
            <option key={el.team_level} value={el.team_level}>
              {el.team_level}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default Levels;
