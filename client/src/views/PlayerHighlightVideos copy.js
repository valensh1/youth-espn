import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import YouTube, { YouTubeProps } from 'react-youtube';

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
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
    },
  };

  //?-----------------------------------------------------------------USE STATE HOOKS ------------------------------------------------------------------------

  const [highlightVideos, setHighlightVideos] = useState([]);
  const [images, setImages] = useState([]);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoToPlay, setVideoToPlay] = useState('');

  //?-----------------------------------------------------------------USE EFFECT HOOKS ------------------------------------------------------------------------
  useEffect(() => {
    window.scrollTo(0, 0); // Ensure page loads with user at top of page
    const fetchPlayerHighlights = async () => {
      const response = await fetch(
        `/api/${sportToQuery}/player/${playerID}/highlights`
      );
      const data = await response.json();
      console.log(data);

      const imageResponse = await fetch(
        `/api/${sportToQuery}/player/${playerID}/images`
      );
      const playerImages = await imageResponse.json();
      setImages(playerImages);
      console.log(playerImages);
      console.log(playerImages?.[0]?.images?.action_images?.[0]);

      // Loops through the data retrieved directly above and for each video it gets the video stats such as view count, likes, etc using the YouTube API and combines that with the data received directly above and sets the playerHighlights state
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
    fetchPlayerHighlights();
  }, []);

  //?----------------------------------------------------------------- FUNCTIONS ------------------------------------------------------------------------

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
    // onPlayerStateChange(event);
    console.log(event);
    console.log(event.target);
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
    } else {
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
      <h1>
        {highlightVideos?.[0]?.player_name
          ? `${highlightVideos?.[0]?.player_name} Highlight Videos`
          : `Highlight Videos`}
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
      <div id="video-modal" className="video-modal hidden">
        <YouTube
          id="iframe-video"
          videoId={videoToPlay}
          opts={opts}
          //   onReady={onPlayerReady}
          //   onStateChange={onPlayerStateChange}
          //   onEnd={onVideoEnd}
        />
        <span id="close-icon">X</span>
      </div>
      <div id="video-highlight-thumbnails" className="thumbnails">
        {highlightVideos?.[0]?.highlight_videos?.map((video, index) => {
          return (
            <div key={index} id="video-container">
              <img
                src={video.videoThumbnail}
                alt="pic"
                video-id={video?.videoID}
              />
              <div id="video-attributes">
                <span id="video-title">{`${video?.title}`}</span>
                <span>{`Game Date: ${video?.date}`}</span>
                <span>{`Game Type: ${video?.game_type}`}</span>
                <span>{`Division/Level: ${video?.division} ${video?.team_level}`}</span>
                <span>{`Opponent: ${video?.opponent_long}`}</span>
                <span>{`Venue: ${video?.venue}`}</span>
                <span>{`Views: ${video?.stats?.viewCount}`}</span>
                <span>{`Likes: ${video?.stats?.likeCount}`}</span>
                <span>{`Tags: [${video?.tags}]`}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PlayerHighlightVideos;
