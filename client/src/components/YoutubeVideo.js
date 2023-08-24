import React from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';

function YoutubeVideo({ videoID, opts }) {
  console.log(videoID);
  console.log(opts);

  return (
    <div id="video-modal" className="video-modal hidden">
      <YouTube id="iframe-video" videoId={videoID} opts={opts} />
      <span id="close-icon">X</span>
    </div>
  );
}

export default YoutubeVideo;
