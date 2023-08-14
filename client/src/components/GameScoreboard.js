import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';

function GameScoreboard({ dateForHeader, dateOfGames }) {
  const { hockey } = useParams(); // Dynamic url path variable created in index.js file
  console.log(hockey);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  console.log(queryParams.get('date'));
  console.log(dateOfGames);

  const [scores, setScores] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchTeams = await fetch(`/api/hockey/teams`);
        const teamData = await fetchTeams.json();
        console.log(teamData);

        const fetchLevels = await fetch(`/api/hockey/levels`);
        const levels = await fetchLevels.json();
        console.log(levels);

        const fetchScores = await fetch(
          `/api/hockey/scores?date=10-10-2021&season=2021-2022`
        );
        const scoresData = await fetchScores.json();
        console.log(scoresData);
        setScores(scoresData);
      } catch (error) {
        console.error(error);
        console.log('Error retrieving data');
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1>{dateForHeader}</h1>
      <p>FINAL</p>
      <img src="" alt="" />
      <div>
        {scores.map((game) => {
          return (
            <>
              <div>
                <p>{game.home_team_short}</p>
              </div>
              <div>
                <p>{game.visitor_team_short}</p>
              </div>
            </>
          );
        })}
      </div>
    </div>
  );
}

export default GameScoreboard;
