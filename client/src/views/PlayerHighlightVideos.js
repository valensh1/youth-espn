import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import YouTube, { YouTubeProps } from 'react-youtube';

function PlayerHighlightVideos() {
  const sportToQuery = window.location.pathname.split('/')[1];
  const playerID = window.location.pathname.split('/')[3];
  const key = process.env.REACT_APP_YOUTUBE_API_KEY;
  const videoModal = document.querySelector('.video-modal');
  const videoThumbnails = document.querySelector('.thumbnails');
  console.log(window.innerWidth);
  console.log(window.innerHeight);

  const opts = {
    height: window.innerHeight * 0.7,
    width: window.innerWidth * 0.7,
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
    },
  };

  //?-----------------------------------------------------------------USE STATE HOOKS ------------------------------------------------------------------------

  const [highlightVideos, setHighlightVideos] = useState([]);
  const [thumbnails, setThumbnails] = useState([]);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  //?-----------------------------------------------------------------USE EFFECT HOOKS ------------------------------------------------------------------------
  useEffect(() => {
    const fetchPlayerHighlights = async () => {
      const response = await fetch(
        `/api/${sportToQuery}/player/${playerID}/highlights`
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
          const videoData = await fetchVideoStats(videoID);
          const stats = videoData.stats;
          const videoThumbnail = videoData.thumbnails;
          return { ...video, stats, videoThumbnail };
        })
      );
      console.log(videoArray);
      data[0].highlight_videos = videoArray;
      console.log(data);
      setHighlightVideos(data);
      console.log(data);
    };
    fetchPlayerHighlights();
  }, []);

  //?----------------------------------------------------------------- FUNCTIONS ------------------------------------------------------------------------

  const fetchVideoStats = async (videoID) => {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?key=${key}&id=${videoID}&part=statistics, contentDetails, player, snippet, topicDetails`
    );

    const data = await response.json();
    console.log(data);
    const newThumbnail = await data.items[0].snippet.thumbnails.standard.url;
    console.log(newThumbnail);
    setThumbnails((prev) => [...prev, newThumbnail]);
    console.log(thumbnails);
    console.log(data.items[0].snippet.thumbnails.maxres.url);
    console.log(data.items[0].statistics.viewCount);
    // return data.items[0].statistics;
    return { stats: data.items[0].statistics, thumbnails: newThumbnail };
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
    console.log(event.target.tagname);
    if (event.target.nodeName === 'IMG') console.log('tagname is equal to img');
    if (event.target.nodeName !== 'IMG' && videoModalOpen === false) {
      return;
    } else {
      setVideoModalOpen(!videoModalOpen);
      toggleVideoPlayer();
      window.scrollTo({
        top: 50,
        left: 25,
        behavior: 'smooth',
      });
    }
  };

  const onPlayerReady = (event) => {
    console.log(event);
  };

  const onPlayerStateChange = (event) => {
    console.log(event);
  };

  //?----------------------------------------------------------------- JSX ------------------------------------------------------------------------
  return (
    <div id="player-highlights-page-container" onClick={videoControls}>
      <div id="video-highlight-thumbnails" className="thumbnails">
        {highlightVideos?.[0]?.highlight_videos?.map((video, index) => {
          return (
            <div key={index} id="video-container">
              <img
                src={thumbnails[index]}
                alt="pic"
                // onClick={() => playVideo(video)}
              />
              <div id="video-attributes">
                <span>{`${video?.stats?.viewCount} views`}</span>
                <span>{video?.date}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div id="video-modal" className="video-modal hidden">
        <YouTube
          id="iframe-video"
          videoId={'XRqillceNJ4'}
          opts={opts}
          autoplay
          controls={true}
          volume={0}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
        />
        <span id="close-icon" onClick={videoControls}>
          X
        </span>
      </div>
    </div>
  );
}

export default PlayerHighlightVideos;
