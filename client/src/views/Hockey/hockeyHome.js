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
      <TopHeadlines nameforClass={'hockey-home-topHeadlines-container'} />
      <HeadlineGame nameForClass={'hockey-home-headlineGame-container'} />
      <HeadlineGame nameForClass={'hockey-home-headlineGame-container'} />
      <HeadlineGame nameForClass={'hockey-home-headlineGame-container'} />
      <HeadlineGame nameForClass={'hockey-home-headlineGame-container'} />
      <HeadlineGame nameForClass={'hockey-home-headlineGame-container'} />
    </div>
  );
}

export default hockeyHome;
