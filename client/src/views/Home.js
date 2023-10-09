import Navbar from '../components/Navbar';
import TopHeadlines from '../components/TopHeadlines';
import VideoCard from '../components/VideoCard';
import GameCard from '../components/GameCard';

function Home() {
  return (
    <div className="home-container">
      <Navbar />
      <div className="home-content-container">
        <GameCard nameForClass={'home-gameCard-container'} />
        <VideoCard />
        <TopHeadlines nameForClass={'home-headlines-container'} />
      </div>
    </div>
  );
}

export default Home;
