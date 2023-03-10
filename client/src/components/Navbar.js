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
  const test = ''; // Need to delete this

  return (
    <div id="navbar-container">
      <div id="navbar-content">
        {navbarList.map((sport) => {
          return (
            <div className="drop-down">
              <Link to={`/${sport.toLowerCase()}`}>{sport}</Link>
              <div className="hover-content">
                {sportSubCategories.map((subCategory) => {
                  return (
                    <>
                      <Link
                        to={`/${sport.toLowerCase()}/${subCategory.toLowerCase()}`}
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
                  <a href="">{sport}</a>;
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
