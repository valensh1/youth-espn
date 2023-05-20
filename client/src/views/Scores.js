import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalFunctions from '../model/globalFunctions';
import GameScoreboard from '../components/GameScoreboard';
import Navbar from '../components/Navbar';

function Scores() {
  const navigate = useNavigate();
  let urlPath;
  //?----------------------------------------------------------------- USE STATE HOOKS ------------------------------------------------------------------------

  const [dateOfGames, setDateOfGames] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('AAA');

  //?----------------------------------------------------------------- USE REF HOOKS ------------------------------------------------------------------------

  let gameDateForHeading = useRef(); // Access useRef by calling gameDateForHeading.current

  //?----------------------------------------------------------------- USE EFFECT HOOKS ------------------------------------------------------------------------

  useEffect(() => {
    const dateObject = GlobalFunctions.datesWithDifferentFormats();
    console.log(dateObject);
    setDateOfGames(dateObject.datePickerFormat);
    gameDateForHeading.current = dateObject.dateSpelledOutWithDayOfWeek;
  }, []);

  //?----------------------------------------------------------------- FUNCTIONS ------------------------------------------------------------------------

  const selectedDate = (event) => {
    const dateObject = GlobalFunctions.datesWithDifferentFormats(
      new Date(event.target.value),
      true
    );
    setDateOfGames(dateObject.datePickerFormat);
    gameDateForHeading.current = dateObject.dateSpelledOutWithDayOfWeek;
    navigate(`?date=${event.target.value}&level=A`);
  };

  //?----------------------------------------------------------------- JSX ------------------------------------------------------------------------
  return (
    <div>
      <Navbar />
      <input
        id="date-picker"
        type="date"
        onChange={selectedDate}
        value={dateOfGames}
      />
      <div className="filter-dropdowns">
        <label htmlFor="games-level">Level</label>
        <select name="games-level" id="games-level">
          <option value="B">B</option>
          <option value="BB">BB</option>
          <option value="A">A</option>
          <option value="AA">AA</option>
          <option value="AAA">AAA</option>
        </select>
      </div>
      <GameScoreboard
        dateForHeader={gameDateForHeading.current}
        dateOfGames={dateOfGames}
      />
    </div>
  );
}

export default Scores;
