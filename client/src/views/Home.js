import Navbar from '../components/Navbar';
import TopHeadlines from '../components/TopHeadlines';
import VideoCard from '../components/VideoCard';
import GameCard from '../components/GameCard';

function Home() {
  return (
    <div className="home-container">
      <Navbar />
      <TopHeadlines nameforClass={'home-headlines-container'} />
      <VideoCard />
      <GameCard />
    </div>
  );
}

export default Home;
