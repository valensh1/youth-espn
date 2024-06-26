import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import YoutubeVideo from '../components/YoutubeVideo';
import YoutubeVideoThumbnail from '../components/YoutubeVideoThumbnail';
import { BiFilterAlt } from 'react-icons/bi';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

function PlayerHighlightVideos() {
  const sportToQuery = window.location.pathname.split('/')[1];
  const playerID = window.location.pathname.split('/')[3];
  const key = process.env.REACT_APP_YOUTUBE_API_KEY;
  const videoModal = document.querySelector('.video-modal');
  const videoThumbnails = document.querySelector('.thumbnails');
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const opts = {
    height: viewportHeight * 0.7,
    width: viewportWidth * 0.7,
    playerVars: {
      autoplay: 1,
    },
  };

  const selectedFiltersClearedState = {
    season: '',
    team: '',
    opponent: '',
    division: '',
    venue: '',
  };

  //?-----------------------------------------------------------------USE STATE HOOKS ------------------------------------------------------------------------

  const [highlightVideos, setHighlightVideos] = useState([]);
  const [images, setImages] = useState([]);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoToPlay, setVideoToPlay] = useState('');
  const [filters, setFilters] = useState({});
  const [selectedFilters, setSelectedFilters] = useState(
    selectedFiltersClearedState
  );
  const [filtersDisplayed, setFiltersDisplayed] = useState(false);
  const [paginationNumber, setPaginationNumber] = useState('10 per page');

  //?-----------------------------------------------------------------USE EFFECT HOOKS ------------------------------------------------------------------------
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
    // Ensure page loads with user at top of page
    const fetchPageData = async () => {
      let pagination = 0;
      if (paginationNumber === 'View All') {
        pagination = 0;
      } else {
        pagination = parseInt(paginationNumber);
      }

      const data = await apiHighlightVideoCall(
        selectedFilters.season,
        selectedFilters.team,
        selectedFilters.opponent,
        selectedFilters.division,
        selectedFilters.venue,
        pagination
      );

      const imageResponse = await fetch(
        `/api/${sportToQuery}/player/${playerID}/images`
      );
      const playerImages = await imageResponse.json();
      setImages(playerImages);
      console.log(playerImages);
      console.log(playerImages?.[0]?.images?.action_images?.[0]);

      await getVideoStats(data);
      filterDropDownMenus(playerID);
    };
    fetchPageData();
  }, []);

  useEffect(() => {
    console.log(`Filters have been changed`);
    fetchPlayerHighlightVideos();
  }, [selectedFilters]);

  //?----------------------------------------------------------------- FUNCTIONS ------------------------------------------------------------------------

  const fetchPlayerHighlightVideos = async () => {
    try {
      const data = await apiHighlightVideoCall(
        selectedFilters.season,
        selectedFilters.team,
        selectedFilters.opponent,
        selectedFilters.division,
        selectedFilters.venue,
        10
      );

      await getVideoStats(data);
    } catch (error) {
      console.error(error);
      setHighlightVideos([]);
    }
  };

  // Makes call to endpoint to retrieve player highlight videos from database
  const apiHighlightVideoCall = async (
    season = '',
    team = '',
    opponent = '',
    division = '',
    venue = '',
    pagination = 10
  ) => {
    const response = await fetch(
      `/api/${sportToQuery}/player/${playerID}/highlights?season=${season}&team=${team}&opponent=${opponent}&division=${division}&venue=${venue}&number=${pagination}`
    );

    const data = await response.json();
    console.log(data);
    return data;
  };

  // Loops through the data retrieved directly above and for each video it gets the video stats such as view count, likes, etc using the YouTube API and combines that with the data received directly above and sets the playerHighlights state
  const getVideoStats = async (data) => {
    const videoArray = await Promise.all(
      data[0]?.highlight_videos.map(async (video) => {
        const videoID = extractVideoID(video.url);
        const videoData = await fetchVideoStats(videoID);
        const stats = videoData.stats;
        const videoThumbnail = videoData.thumbnails;
        return { ...video, stats, videoThumbnail, videoID };
      })
    );
    data[0].highlight_videos = videoArray;
    setHighlightVideos(data);
  };

  // Retrieves data for dropdown filters based upon player seasons played, teams they have played on, opponents played against, etc. Purpose is so the items in dropdown are relevant to that player and not showing a team they never played for or a season they never played in
  const filterDropDownMenus = async (playerID) => {
    const response = await fetch(
      `/api/${sportToQuery}/player/${playerID}/highlight-video-filters`
    );
    const filterData = await response.json();
    console.log(filterData);
    setFilters({ ...filters, filters: filterData });
    return filterData;
  };

  // Function that captures the video filter selections by user
  const filterSelections = async (event) => {
    const selection = event.target.value;
    const filter = event.target.name;
    const filterCleared = selection === filter ? true : false;
    if (!filterCleared) {
      setSelectedFilters({ ...selectedFilters, [filter]: selection });
    } else if (filterCleared) {
      setSelectedFilters({ ...selectedFilters, [filter]: '' });
    } else {
      setSelectedFilters(selectedFiltersClearedState);
    }
  };

  // Show Filters when filter icon is clicked and remove when filter icon is clicked again
  const showFilters = () => {
    setFiltersDisplayed(!filtersDisplayed);
    const filters = document.getElementById('video-filters');
    const clearButton = document.getElementById('clear');
    if (filtersDisplayed) {
      filters.style.visibility = 'hidden';
      clearButton.style.visibility = 'hidden';
    } else {
      filters.style.visibility = 'visible';
      clearButton.style.visibility = 'visible';
    }
  };

  const clearFilters = () => {
    const filterDropdowns = document.querySelectorAll('.filter-dropdown');
    filterDropdowns.forEach((filter) => {
      filter.selectedIndex = 0;
    });
    setSelectedFilters(selectedFiltersClearedState);
  };

  const paginationSelection = (eventKey) => {
    console.log('Clicked on pagination');
    console.log(eventKey);
    setPaginationNumber(Number(eventKey.target.value));
  };

  const fetchVideoStats = async (videoID) => {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?key=${key}&id=${videoID}&part=statistics, contentDetails, player, snippet, topicDetails`
    );
    const data = await response.json();
    const newThumbnail = await data.items[0].snippet.thumbnails.standard.url;
    return { stats: data.items[0].statistics, thumbnails: newThumbnail };
  };

  // Function to extract VideoID from video URL passed into function so that video ID can be used elsewhere on page such as to play videos
  const extractVideoID = (videoURL) => {
    const videoURLConvertedToArray = videoURL.split(`/`);
    const lengthOfArray = videoURLConvertedToArray.length;
    const videoID = videoURLConvertedToArray[lengthOfArray - 1];
    return videoID;
  };

  // Function to convert pixels to vw and vw relative to viewport. This function is designed to return the coordinates of the thumbnail clicked in pixels into vw and vh coordinates
  const videoPlacement = (coordinatesArray) => {
    const xCoordinateInVW = (coordinatesArray[0] / viewportWidth) * 100;
    const yCoordinateInVH = (coordinatesArray[1] / viewportHeight) * 100;
    return [xCoordinateInVW, yCoordinateInVH];
  };

  // Toggles video player modal to open/close along with fading the background behind the video player modal
  const toggleVideoPlayer = () => {
    videoModal.classList.toggle('hidden');
    videoThumbnails.classList.toggle('fade');
  };

  // Function that determines where click came from and determines state of video player whether to open or close video modal
  const videoControls = async (event) => {
    console.log(event);
    console.log(event.target);
    console.log(event.target.parentNode);
    console.log(event.target.parentNode.id);
    console.log(event.target.value);
    console.log(event.target.id);
    console.log(event.target.alt);
    console.log(event.target.tagName);
    console.log(event.target.nodeName);

    const coordinates = [event.clientX, event.clientY];
    console.log(coordinates);
    if (event.target.nodeName !== 'IMG' && videoModalOpen === false) {
      return;
    } else if (event.target.nodeName === 'IFRAME' && videoModalOpen === true) {
      return;
    } else if (
      (event.target.id === 'close-icon' && videoModalOpen === true) ||
      (event.target.nodeName !== 'IFRAME' && videoModalOpen === true)
    ) {
      setVideoToPlay('');
      toggleVideoPlayer();
      setVideoModalOpen(!videoModalOpen);
      changeOpacity('show');
    } else {
      changeOpacity('hide');
      toggleVideoPlayer();
      setVideoModalOpen(!videoModalOpen);
      const videoURL = event.target.getAttribute('video-id');
      const videoID = extractVideoID(videoURL);
      setVideoToPlay(videoID);

      // Coordinates of img thumbnail clicked. User will need to be scrolled back to here after watching video
      const positioning = videoPlacement(coordinates);
      console.log(positioning);

      // Displays video at top of screen
      window.scrollTo({
        top: 0,
        behavior: 'instant',
      });
    }
  };

  const changeOpacity = (status) => {
    const container = document.getElementById('video-highlight-thumbnails');
    const filters = document.getElementById('filters-container');
    const filterIcon = document.getElementById('filter-icon');
    const backgroundSides = document.querySelectorAll('.background-img-sides');
    if (status === 'hide') {
      container.style.opacity = 0;
      filters.style.opacity = 0;
      filterIcon.style.opacity = 0;

      backgroundSides.forEach((el) => {
        el.style.opacity = 0;
      });
    } else {
      container.style.opacity = 1;
      filters.style.opacity = 1;
      filterIcon.style.opacity = 1;

      backgroundSides.forEach((el) => {
        el.style.opacity = 1;
      });
    }
  };

  const removeDivisionDuplicates = (array) => {
    console.log(array);
    let divisions = array?.filters?.seasonAndTeamFilter?.map((el) => {
      return el.division_level_fk;
    });
    divisions = [...new Set(divisions)];
    console.log(divisions);

    return (
      <select
        name="division"
        id="division-filter"
        className="filter-dropdown"
        onChange={filterSelections}
      >
        <option value="division" selected>
          Filter By Division
        </option>
        ;
        {divisions.map((filter) => {
          return (
            <option value={filter} key={filter} className="dropdown-options">
              {filter}
            </option>
          );
        })}
      </select>
    );
  };

  const videoCountToDisplay = () => {
    const highlights = highlightVideos[0]?.highlight_videos?.length;
    console.log(highlights);
    if (highlights) {
      switch (highlights) {
        case 1:
          return <span id="video-count">{`${highlights} Video`}</span>;
        default:
          return <span id="video-count">{`${highlights} Videos`}</span>;
      }
    } else {
      return <span id="video-count">{`0 Videos`}</span>;
    }
  };

  //? Some methods that can be used -- DELETE IF NOT USED
  //   const onPlayerReady = (event) => {};

  //   const onPlayerStateChange = (event) => {
  //     console.log(event);
  //   };
  //   const onVideoEnd = (event) => {
  //     console.log(event);
  //   };

  //?----------------------------------------------------------------- JSX ------------------------------------------------------------------------
  return (
    <div id="player-highlights-page-container" onClick={videoControls}>
      <Navbar />
      <div id="filters-container">
        <div className="filters video-filters" id="video-filters">
          <select
            name="season"
            id="seasons-filter"
            className="filter-dropdown"
            onChange={filterSelections}
          >
            <option value="season" selected>
              Filter By Season
            </option>
            ;
            {filters?.filters?.seasonAndTeamFilter?.map((filter) => {
              return (
                <option
                  value={filter.season}
                  key={filter.season}
                  className="dropdown-options"
                >
                  {filter.season}
                </option>
              );
            })}
          </select>

          <select
            name="team"
            id="team-filter"
            className="filter-dropdown"
            onChange={filterSelections}
          >
            <option value="team" selected>
              Filter By Teams
            </option>
            ;
            {filters?.filters?.seasonAndTeamFilter?.map((filter) => {
              return (
                <option
                  value={filter.actual_team_name}
                  key={filter.actual_team_name}
                  className="dropdown-options"
                >
                  {filter.actual_team_name}
                </option>
              );
            })}
          </select>

          <select
            name="opponent"
            id="opponent-filter"
            className="filter-dropdown"
            onChange={filterSelections}
          >
            <option value="opponent" selected>
              Filter By Opponent
            </option>
            ;
            {filters?.filters?.opponentFilter?.map((filter) => {
              return (
                <option
                  value={filter.opponent}
                  key={filter.opponent}
                  className="dropdown-options"
                >
                  {filter.opponent}
                </option>
              );
            })}
          </select>

          {removeDivisionDuplicates(filters)}

          <select
            name="venue"
            id="venue-filter"
            className="filter-dropdown"
            onChange={filterSelections}
          >
            <option value="venue" selected>
              Filter By Venue
            </option>
            ;
            {filters?.filters?.venueFilter?.map((filter) => {
              return (
                <option
                  value={filter.venue}
                  key={filter.venue}
                  className="dropdown-options"
                >
                  {filter.venue}
                </option>
              );
            })}
          </select>
        </div>
        <button id="clear" className="button" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>
      <BiFilterAlt id="filter-icon" onClick={showFilters} />

      <DropdownButton
        id="dropdown-basic-button"
        title={paginationNumber} // This drives what displays in dropdown
        onSelect={paginationSelection}
      >
        <Dropdown.Item href="#/action-1" eventKey="10">
          10 per page
        </Dropdown.Item>
        <Dropdown.Item href="#/action-2" eventKey="25">
          25 per page
        </Dropdown.Item>
        <Dropdown.Item href="#/action-3" eventKey="view all">
          View All
        </Dropdown.Item>
      </DropdownButton>

      <h1 id="no-search-results" style={{ display: 'block' }}>
        {highlightVideos.length ? '' : 'No videos met your search criteria'}
      </h1>

      <div className="background-img-sides background-img-left">
        <img
          src={images?.[0]?.images?.action_images?.[0]?.img}
          alt=""
          id="image-left"
        />
      </div>
      <div className="background-img-sides background-img-right">
        <img
          src={
            images?.[0]?.images?.profile_images_no_background?.[0] ||
            images?.[0]?.images?.profile_images_background?.[0]
          }
          alt=""
          id="image-right"
        />
      </div>
      <YoutubeVideo videoID={videoToPlay} opts={opts} />
      <div id="video-content-container">
        <div id="video-heading-count">
          <h1>
            {highlightVideos?.[0]?.player_name
              ? `${highlightVideos?.[0]?.player_name} Highlight Videos`
              : `Highlight Videos`}
          </h1>

          {videoCountToDisplay()}
        </div>
        <div id="video-highlight-thumbnails" className="thumbnails">
          {highlightVideos?.[0]?.highlight_videos?.map((video, index) => {
            return <YoutubeVideoThumbnail video={video} index={index} />;
          })}
        </div>
      </div>
      <div id="extra-space"></div>
    </div>
  );
}

export default PlayerHighlightVideos;
