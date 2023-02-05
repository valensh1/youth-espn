import React from 'react';
import { homePageVideos } from '../model/homePageVideos';

function video() {
  const currentDate = new Date();

  const dateDiff = (date1, date2) => {
    const hours = Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60))); // Conversion to hours
    if (hours < 24) {
      return `${Math.round(hours)}h`; // If less than 24 hours then return the number of hours such as 18h
    } else {
      return `${Math.round(hours / 24)}d`; // If more than 23 hours then return 1d for 1 day
    }
  };

  return (
    <div className="video-container">
      {homePageVideos.map((video) => {
        return (
          <div className="outer-container" key={video.title}>
            <div className="video-card-space"></div>
            <div className="video-card">
              <div className="video-content">{video.url}</div>
              <h1>{video.title}</h1>
              <h3>{dateDiff(video.date, currentDate)}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default video;
