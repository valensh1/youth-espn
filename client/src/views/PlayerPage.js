import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

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
  const key = process.env.REACT_APP_YOUTUBE_API_KEY;

  //?----------------------------------------------------------------- USE STATE HOOKS ------------------------------------------------------------------------
  const [stats, setStats] = useState([]);
  const [highlightVideos, setHighlightVideos] = useState([]);

  //?----------------------------------------------------------------- USE EFFECT HOOKS ------------------------------------------------------------------------
  useEffect(() => {
    // Ensure page loads with user at top of page
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });

    const fetchPlayerStats = async () => {
      const response = await fetch(`/api/${sportToQuery}/player/${playerID}`);
      const data = await response.json();
      console.log(data);
      setStats(data);
    };
    fetchPlayerStats();

    const fetchPlayerHighlights = async () => {
      const videosToFetch = 6;
      const response = await fetch(
        `/api/${sportToQuery}/player/${playerID}/highlights?number=${videosToFetch}`
      );
      const data = await response.json();
      console.log(data);

      // Loops through the data retrieved directly above and for each video it gets the video stats such as view count, likes, etc using the YouTube API and combines that with the data received directly above and sets the playerHighlights state
      const videoArray = await Promise.all(
        data[0]?.highlight_videos.map(async (video) => {
          const url = video.url;
          const convertUrlToArray = url.split('/');
          const lengthOfUrlArray = convertUrlToArray.length;
          const videoID = convertUrlToArray[lengthOfUrlArray - 1];
          const stats = await fetchVideoStats(videoID);
          return { ...video, stats };
        })
      );
      console.log(videoArray);
      data[0].highlight_videos = videoArray;
      setHighlightVideos(data);
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

  const fetchVideoStats = async (videoID) => {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?key=${key}&id=${videoID}&part=statistics, contentDetails, player, snippet, topicDetails`
    );

    const data = await response.json();
    console.log(data);
    console.log(data.items[0].statistics.viewCount);
    return data.items[0].statistics;
  };

  //?----------------------------------------------------------------- JSX ------------------------------------------------------------------------

  return (
    <div id="player-profile-container">
      <Navbar />
      <div id="player-profile-content">
        <div id="player-images">
          <img
            src={stats?.images?.[0]?.images?.action_images?.[0]?.img}
            id="action-img"
            // alt="action_img"
          />
          <img
            src={
              stats?.images?.[0]?.images?.profile_images_no_background?.[0] ||
              stats?.images?.[0]?.images?.profile_images_background?.[0]
            }
            id="profile-img"
            alt="profile_img"
          />
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
                    <div id="video-attributes">
                      <span>{`${video?.stats?.viewCount} views`}</span>
                      <span>{video?.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <Link to={`highlights`} id="more-highlights-link" className="link">
              {`-> See more ${stats?.playerAttributes?.[0]?.player_name} highlight videos`}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerPage;
