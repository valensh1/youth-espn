import Navbar from '../components/navbar';
import TopHeadlines from '../components/topHeadlines';
import Video from '../components/videoCard';
import GameCard from '../components/gameCard';

function Home() {
  return (
    <div className="home-container">
      <Navbar />
      <TopHeadlines nameforClass={'home-headlines-container'} />
      <Video />
      <GameCard />
    </div>
  );
}

export default Home;
