import { useState } from 'react';
import { Link } from 'react-router-dom';
import { headlines } from '../model/headlines';

function TopHeadlines({ nameforClass }) {
  const [topHeadlines, setTopHeadlines] = useState(headlines);
  return (
    <div className={nameforClass}>
      <div className="topHeadlines-container">
        <h1>Top Headlines</h1>
        <hr />
        {topHeadlines.map((story) => {
          return (
            <div key={story.title} className="topHeadlines">
              <li>
                <Link to={story.url}>{story.title}</Link>
              </li>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TopHeadlines;
