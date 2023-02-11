import React from 'react';
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

  return (
    <div id="navbar-container">
      <div id="navbar-content">
        {navbarList.map((sport) => {
          return (
            <div className="drop-down">
              <Link to={`/${sport}`}>{sport}</Link>
              <div className="hover-content">
                {sportSubCategories.map((subCategory) => {
                  return (
                    <>
                      <a href="">{subCategory}</a>;
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
