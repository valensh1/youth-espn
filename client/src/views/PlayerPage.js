import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

function PlayerPage() {
  const sportToQuery = window.location.pathname.split('/')[1];
  const playerID = window.location.pathname.split('/')[3];
  console.log(playerID);

  const goalieStatCategories = [
    'Season',
    'Team',
    'Division',
    'Level',
    'GP',
    'W',
    'L',
    'SA',
    'GA',
    'GAA',
    'Saves',
    'Save%',
    'SO',
  ];

  //?----------------------------------------------------------------- USE STATE HOOKS ------------------------------------------------------------------------
  const [stats, setStats] = useState([]);
  const [highlightVideos, setHighlightVideos] = useState([]);

  //?----------------------------------------------------------------- USE EFFECT HOOKS ------------------------------------------------------------------------
  useEffect(() => {
    window.scrollTo(0, 0); // Ensure page loads with user at top of page

    const fetchPlayerStats = async () => {
      const data = await fetch(`/api/${sportToQuery}/player/${playerID}`);
      const response = await data.json();
      console.log(response);
      setStats(response);
    };
    fetchPlayerStats();

    const fetchPlayerHighlights = async () => {
      const data = await fetch(
        `/api/${sportToQuery}/player/${playerID}/highlights`
      );
      const response = await data.json();
      console.log(response);
      setHighlightVideos(response);
    };
    fetchPlayerHighlights();
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

  const inchesToFeetConversion = (heightInInches) => {
    const feetConversion = heightInInches / 12;
    const feet = Math.trunc(feetConversion);
    const inches = heightInInches - feet * 12;
    return `${feet}'${inches}"`;
  };

  //?----------------------------------------------------------------- JSX ------------------------------------------------------------------------

  return (
    <div id="player-profile-container">
      <Navbar />
      <div id="player-profile-content">
        <div id="player-images">
          <img src={stats?.images?.[0].action_img_1} id="action-img" />
          <img src={stats?.images?.[0].profile_img_1} id="profile-img" />
        </div>

        {stats?.playerAttributes?.map((el) => {
          return (
            <div id="player-attribute-container">
              <div id="player-name-number">
                <span>{el.player_name}</span>
                <span>{el.jersey_number}</span>
              </div>

              <div id="player-attributes">
                <span>{el.player_position}</span>
                <span>{inchesToFeetConversion(el.height_inches)}</span>
                <span>{`${el.weight_lbs} lbs`}</span>
                <span>{`Age: ${el.age}`}</span>
                <span>{el.actual_team_name}</span>
              </div>
            </div>
          );
        })}

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
                {goalieStatCategories.map((stat) => {
                  return <th>{stat}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {stats?.stats?.map((el) => {
                return (
                  <tr>
                    <td className="shade">{el.season}</td>
                    <td>{el.team_name}</td>
                    <td>{el.division}</td>
                    <td>{el.team_level}</td>
                    <td>{el.stat_games_played}</td>
                    <td>{el.stat_wins}</td>
                    <td>{el.stat_losses}</td>
                    <td>{el.stat_shots_against}</td>
                    <td>{el.stat_goals_against}</td>
                    <td>{el.stat_goals_against_avg}</td>
                    <td>{el.stat_saves}</td>
                    <td>{el.stat_save_percentage}</td>
                    <td>{el.stat_shutouts}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div id="player-highlight-videos-container">
            <h1 id="highlights-heading">Highlights</h1>
            <div id="player-highlight-videos">
              {highlightVideos?.[0]?.highlight_videos?.map((video, index) => {
                return (
                  <div key={index} id="video-container">
                    <iframe
                      id={`iframe-video`}
                      src={video?.url}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                    <div>
                      <span>{`53K views`}</span>
                      <span>{video?.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerPage;
