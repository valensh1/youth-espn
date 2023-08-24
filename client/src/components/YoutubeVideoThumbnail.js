import React from 'react';

function YoutubeVideoThumbnail({ video, index }) {
  return (
    <div key={index} id="video-container">
      <img src={video.videoThumbnail} alt="pic" video-id={video?.videoID} />
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
}

export default YoutubeVideoThumbnail;
