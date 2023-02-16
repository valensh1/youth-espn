import { useEffect } from 'react';

function Teams() {
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`/api/hockeyPlayers/teams`);
        const teamsDataPull = await response.json();
        console.log(teamsDataPull);
        console.log('UseEffect is running!!!');
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  return <div>OCHC Hockey Club</div>;
}

export default Teams;
