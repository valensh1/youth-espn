import { useState, useEffect } from 'react';

function Divisions({ dropdownSelection, fetchData }) {
  const defaultDivision = '12U - Peewee';
  const localStorageDivision = localStorage.getItem('division');
  //?----------------------------------------------------------------- UseState Hooks ------------------------------------------------------------------------
  const [divisionDropdown, setDivisionDropdown] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState(
    localStorageDivision || defaultDivision
  );

  //?----------------------------------------------------------------- UseEffect Hooks ------------------------------------------------------------------------
  // Fetch divisions data on initial render of component
  useEffect(() => {
    const fetchDropdownData = async () => {
      const response = await fetch(`/api/hockey/divisions`);
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
    fetchData(undefined, undefined, event.target.value);
    console.log(event.target.value);
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
        {divisionDropdown?.map((el) => {
          return (
            <option key={el.division_level} value={el.division_age}>
              {el.division_age}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default Divisions;
