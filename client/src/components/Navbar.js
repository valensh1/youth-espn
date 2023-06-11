import { Link } from 'react-router-dom';

function Navbar() {
  const navbarList = ['Basketball', 'Football', 'Baseball', 'Hockey', 'Soccer'];
  const sportSubCategories = [
    'Home',
    'Scores',
    'Schedule',
    'Standings',
    'Stats',
    'Teams',
  ];
  const otherSports = ['Tennis', 'Boxing'];

  //?----------------------------------------------------------------- FUNCTIONS ------------------------------------------------------------------------

  // Function that clears local storage for these key/value pairs that pertain to the roster page. Don't want these values to persist if user is no longer on that page.
  const clearLocalStorage = () => {
    localStorage.removeItem('team');
    localStorage.removeItem('actualTeam');
    localStorage.removeItem('teamNumber');
    localStorage.removeItem('season');
    localStorage.removeItem('level');
    localStorage.removeItem('league');
    localStorage.removeItem('rosterData');
  };

  //?----------------------------------------------------------------- JSX ------------------------------------------------------------------------

  return (
    <div id="navbar-container">
      <div id="navbar-content">
        {navbarList.map((sport) => {
          return (
            <div
              className="drop-down"
              id={sport}
              key={sport}
              onClick={clearLocalStorage}
            >
              <Link to={`/${sport.toLowerCase()}`}>{sport}</Link>
              <div className="hover-content">
                {sportSubCategories.map((subCategory) => {
                  return (
                    <>
                      <Link
                        to={`/${sport.toLowerCase()}/${subCategory.toLowerCase()}`}
                        id={subCategory}
                        key={`${sport}-${subCategory}`}
                      >
                        {subCategory}
                      </Link>
                    </>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="drop-down">
          <a href="">Other Sports</a>
          <div className="hover-content">
            {otherSports.map((sport) => {
              return (
                <>
                  <a href="" key={sport}>
                    {sport}
                  </a>
                  ;
                </>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
