import React from 'react';
import Navbar from '../../components/Navbar';
import TopHeadlines from '../../components/TopHeadlines';
import HeadlineGame from '../../components/HeadlineGame';
import GameCard from '../../components/GameCard';

function hockeyHome() {
  return (
    <div className="hockey-home-container">
      <Navbar />
      <GameCard nameforClass={'hockey-home-gameCard-container'} />
      <div className="headline-game-container">
        <HeadlineGame nameForClass={'hockey-home-headlineGame-container'} />
        <HeadlineGame nameForClass={'hockey-home-headlineGame-container'} />
        <HeadlineGame nameForClass={'hockey-home-headlineGame-container'} />
        <HeadlineGame nameForClass={'hockey-home-headlineGame-container'} />
        <HeadlineGame nameForClass={'hockey-home-headlineGame-container'} />
      </div>

      <TopHeadlines nameforClass={'hockey-home-topHeadlines-container'} />
    </div>
  );
}

export default hockeyHome;
