import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import GlobalFunctions from '../model/globalFunctions';
import GameScoreboard from '../components/GameScoreboard';
import Navbar from '../components/Navbar';

function Scores() {
  const navigate = useNavigate();
  let urlPath;

  const location = useLocation();
  const currentPath = location.pathname;
  const sportToQuery = currentPath.split('/')[1];

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
      <div id="scores-page-container">
        <input
          id="date-picker"
          type="date"
          onChange={selectedDate}
          value={dateOfGames}
        />

        <div id="scoreboard-container">
          <h1 id="game-date">Saturday, May 20, 2023</h1>
          <div id="individual-game-container">
            <h3 id="game-status">FINAL</h3>
            <div className="team-container scoreboard-home-team-container ">
              <div className="scoreboard-team-info scoreboard-home-team-info ">
                <Link className="scoreboard-team-name-logo" to={''}>
                  <img
                    src="https://i.imgur.com/x4pIvDM.png"
                    alt=""
                    className="team-logo scoreboard-team-logo"
                  />
                  <p className="scoreboard-team-name">Jr. Ducks(2)</p>
                </Link>
                <p className="scoreboard-record">(0-0-0)</p>
              </div>
              <div className="scoreboard-scores-container scoreboard-home-team-scores">
                <p id="home-team-score">3</p>
              </div>
            </div>
            <div className="team-container scoreboard-visitor-team-container ">
              <div className="scoreboard-team-info scoreboard-visitor-team-info ">
                <Link className="scoreboard-team-name-logo" to={''}>
                  <img
                    src="https://i.imgur.com/TfJ4Gqd.png"
                    alt=""
                    className="team-logo scoreboard-team-logo"
                  />
                  <p className="scoreboard-team-name">Goldrush</p>
                </Link>
                <p className="scoreboard-record">(0-0-0)</p>
              </div>
              <div className="scoreboard-scores-container scoreboard-visitor-team-scores">
                <p id="visitor-team-score">4</p>
              </div>
            </div>
            <div className="scoreboard-top-players-container scoreboard-top-players">
              <div className="scoreboard-top-player">
                <Link className="player-img-name" to={''}>
                  <img
                    className="player-profile-pic"
                    src={'https://i.imgur.com/aLjKQD2.jpg'}
                    alt=""
                  />
                </Link>
                <div className="player-stats-info">
                  <p className="">Defense - Ducks(2)</p>
                  <p className="">1 Goal, 2 Assists</p>
                </div>
              </div>
              <div className="scoreboard-top-player">
                <Link className="player-img-name" to={''}>
                  <img
                    className="player-profile-pic"
                    src={'https://i.imgur.com/aLjKQD2.jpg'}
                    alt=""
                  />
                </Link>
                <div className="player-stats-info">
                  <p className="">Defense - Ducks(2)</p>
                  <p className="">1 Goal, 2 Assists</p>
                </div>
              </div>
              <div className="scoreboard-top-player">
                <Link className="player-img-name" to={''}>
                  <img
                    className="player-profile-pic"
                    src={'https://i.imgur.com/aLjKQD2.jpg'}
                    alt=""
                  />
                </Link>
                <div className="player-stats-info">
                  <p className="">Defense - Ducks(2)</p>
                  <p className="">1 Goal, 2 Assists</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <GameScoreboard
        dateForHeader={gameDateForHeading.current}
        dateOfGames={dateOfGames}
      /> */}
      </div>
    </div>
  );
}

export default Scores;
