import React from 'react';

function headlineGame() {
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
    <div className="news-card-container">
      <div className="score-section">
        <div className="visiting-team team">
          <li className="team-name loser">Goldrush</li>
          <img className="logos" src="https://i.imgur.com/TfJ4Gqd.png" alt="" />
          <li className="scores loser">5</li>
        </div>
        <div className="game-status-clock"></div>
        <div className="home-team team">
          <li className="team-name">Bears</li>
          <img className="logos" src="https://i.imgur.com/DgIwxpm.png" alt="" />
          <li className="scores winner">7</li>
        </div>
      </div>
      <a href="">
        <img
          id="headline-img"
          src="https://a2.espncdn.com/combiner/i?img=%2Fphoto%2F2023%2F0206%2Fr1127642_1296x518_5%2D2.jpg&w=1256&h=502&scale=crop&cquality=40&location=center&format=jpg"
          alt=""
        />
      </a>
      <div className="news-card-headline">
        <h1 className="news-card-story">
          Can anyone keep pace with Connor McDavid in the MVP race?
        </h1>
        <p></p>
        <div className="timestamp-author">
          <span>1d</span>
          <span id="author">Ryan S. Clark</span>
        </div>
      </div>
    </div>
  );
}

export default headlineGame;
