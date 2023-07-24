import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

function PlayerPage() {
  const sportToQuery = window.location.pathname.split('/')[1];
  const playerID = window.location.pathname.split('/')[3];
  console.log(playerID);

  //?----------------------------------------------------------------- USE EFFECT HOOKS ------------------------------------------------------------------------
  useEffect(() => {
    window.scrollTo(0, 0); // Ensure page loads with user at top of page

    const fetchPlayerStats = async () => {
      const data = await fetch(`/api/${sportToQuery}/player/${playerID}`);
      const response = await data.json();
      console.log(response);
    };
    fetchPlayerStats();
  }, []);

  //?----------------------------------------------------------------- FUNCTIONS ------------------------------------------------------------------------
  const bioClick = (condition) => {
    const bio = document.querySelector('.bio-hide');
    const seeMoreBtn = document.querySelector('#player-bio #see-more-btn');
    const seeLessBtn = document.querySelector('#player-bio #see-less-btn');
    if (condition === 'more') {
      console.log('You clicked to see more bio');
      bio.style.visibility = 'visible';
      seeLessBtn.style.visibility = 'visible';
      seeMoreBtn.style.display = 'none';
    } else {
      bio.style.visibility = 'hidden';
      seeMoreBtn.style.display = '';
      seeLessBtn.style.visibility = 'hidden';
    }
  };

  //?----------------------------------------------------------------- JSX ------------------------------------------------------------------------

  return (
    <div id="player-profile-container">
      <Navbar />
      <div id="player-profile-content">
        <div id="player-images">
          <img src="https://i.imgur.com/WDXWE0I.png" id="action-img" />
          <img src="https://i.imgur.com/9JeHwnS.jpg" id="profile-img" />
        </div>

        <div id="player-attribute-container">
          <div id="player-name-number">
            <span>Hunter Valentine</span>
            <span>36</span>
          </div>

          <div id="player-attributes">
            <span>Goalie</span>
            <span>5'4"</span>
            <span>87 lb</span>
            <span>Age: 12</span>
            <span>OCHC</span>
          </div>
        </div>

        <div id="player-bio">
          <p>
            Hunter has been playing goalie since he was 6 years old. Known for
            his calm demeanor in net, Hunter provides his team with a chance to
            contend for a state championship every year. He most recently led
            his AA OCHC team to the California state championship in the
            2022-2023 season.
            <button onClick={() => bioClick('more')} id="see-more-btn">
              See More...
            </button>
            <span className="bio-hide">
              &nbsp;This year Hunter plans to play AAA for the same OCHC team he
              led to the championship. At 5'4" Hunter is not the tallest goalie
              but has incredible natural sense for how to play the position and
              has great athleticism to get from post to post.
            </span>
            <button
              onClick={() => bioClick()}
              id="see-less-btn"
              className="bio-hide"
            >
              See Less...
            </button>
          </p>
        </div>

        <div id="player-stats-container">
          <h1>Career Stats</h1>
          <table id="player-stats-table">
            <thead>
              <tr>
                <th>Season</th>
                <th>Team</th>
                <th>GP</th>
                <th>W</th>
                <th>L</th>
                <th>OT</th>
                <th>SA</th>
                <th>GA</th>
                <th>GAA</th>
                <th>Saves</th>
                <th>Save %</th>
                <th>SO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="shade">2021-2022</td>
                <td>Ducks(2)</td>
                <td>30</td>
                <td>29</td>
                <td>1</td>
                <td>1</td>
                <td>500</td>
                <td>50</td>
                <td>2.5</td>
                <td>450</td>
                <td>.900</td>
                <td>8</td>
              </tr>
              <tr>
                <td className="shade">2022-2023</td>
                <td>OCHC</td>
                <td>50</td>
                <td>47</td>
                <td>5</td>
                <td>3</td>
                <td>1000</td>
                <td>95</td>
                <td>2.0</td>
                <td>905</td>
                <td>.920</td>
                <td>12</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PlayerPage;
