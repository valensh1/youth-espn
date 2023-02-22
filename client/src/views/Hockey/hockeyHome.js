import React from 'react';
import TopHeadlines from '../../components/topHeadlines';
import HeadlineGame from '../../components/headlineGame';
import Navbar from '../../components/navbar';

function hockeyHome() {
  return (
    <div id="hockey-home-container">
      <Navbar />
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
