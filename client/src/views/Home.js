import { useState } from 'react';
import Navbar from '../components/navbar';
import { headlines } from '../model/headlines';
import Video from '../components/videoCard';
import GameCard from '../components/gameCard';

function Home() {
  const [topHeadlines, setTopHeadlines] = useState(headlines);
  return (
    <div className="home-container">
      <Navbar />
      <div className="headlines-container">
        <h1>Top Headlines</h1>
        <hr />
        {topHeadlines.map((story) => {
          return (
            <div key={story.title} className="headlines">
              <li>
                <a href={story.url}>{story.title}</a>
              </li>
            </div>
          );
        })}
      </div>
      <Video />
      <GameCard />
    </div>
  );
}

export default Home;
