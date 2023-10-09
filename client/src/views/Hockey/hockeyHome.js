import React from 'react';
import Navbar from '../../components/Navbar';
import TopHeadlines from '../../components/TopHeadlines';
import HeadlineGame from '../../components/HeadlineGame';
import GameCard from '../../components/GameCard';

function hockeyHome() {
  return (
    <div className="hockey-home-container">
      <Navbar />
      <div className="hockey-home-content-container">
        <GameCard nameForClass={'hockey-home-gameCard-container'} />
        <div className="headline-game-container">
          <HeadlineGame nameForClass={'hockey-home-headlineGame-container'} />
          <HeadlineGame nameForClass={'hockey-home-headlineGame-container'} />
          <HeadlineGame nameForClass={'hockey-home-headlineGame-container'} />
          <HeadlineGame nameForClass={'hockey-home-headlineGame-container'} />
          <HeadlineGame nameForClass={'hockey-home-headlineGame-container'} />
        </div>

        <TopHeadlines nameForClass={'hockey-home-topHeadlines-container'} />
      </div>
    </div>
  );
}

export default hockeyHome;
