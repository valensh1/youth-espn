import React from 'react';

function PlayerPage() {
  const bioClick = (condition) => {
    const bio = document.querySelector('.bio-hide');
    const playerBioBtn = document.querySelector('#player-bio button');
    if (condition === 'more') {
      console.log('You clicked to see more bio');
      bio.style.visibility = 'visible';
      playerBioBtn.style.display = 'none';
    } else {
      bio.style.visibility = 'hidden';
      playerBioBtn.style.display = '';
    }
  };
  //?----------------------------------------------------------------- JSX ------------------------------------------------------------------------

  return (
    <div id="player-profile-container">
      <div id="player-images">
        <img src="https://i.imgur.com/WDXWE0I.png" id="action-img" />
        <img src="https://i.imgur.com/9JeHwnS.jpg" id="profile-img" />
      </div>

      <div id="player-attribute-container">
        <div id="player-name-number">
          <span>Hunter Valentine</span>
          <span>36</span>
        </div>

        <div id="player-attributes">
          <span>Goalie</span>
          <span>5'4"</span>
          <span>87 lb</span>
          <span>Age: 12</span>
          <span>OCHC</span>
        </div>
      </div>

      <div id="player-bio">
        <p>
          Hunter has been playing goalie since he was 6 years old. Known for his
          calm demeanor in net, Hunter provides his team with a chance to
          contend for a title every year. He most recently led his AA OCHC team
          to the California state championship.
          <button onClick={() => bioClick('more')}>See More...</button>
          <span className="bio-hide">
            &nbsp;This year Hunter plans to play AAA for the same OCHC team he
            led to the championship. At 5'4" Hunter is not the tallest goalie
            but has incredible natural sense for how to play the position and
            has great athleticism to get from post to post.
          </span>
          <button onClick={() => bioClick()}>See Less...</button>
        </p>
      </div>
    </div>
  );
}

export default PlayerPage;
