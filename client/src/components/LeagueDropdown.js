import { useEffect, useState } from 'react';

function LeagueDropdown({ sport }) {
  const [league, setLeague] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      console.log(sport);
      const response = await fetch(`/api/hockey/leagues?sport=${sport}`);
      const leagueData = await response.json();
      setLeague(leagueData);
      console.log(leagueData);
    };
    fetchData();
  }, []);

  console.log(league);
  return (
    <div className="dropdown-container" id="league-dropdown-container">
      <label htmlFor="league-dropdown">League</label>
      <select name="league-dropdown" id="league-dropdown">
        {league.map((el) => {
          return <option value={el.league_age}>{el.league_age}</option>;
        })}
      </select>
    </div>
  );
}

export default LeagueDropdown;
