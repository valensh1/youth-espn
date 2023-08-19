import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ErrorPage from './test/error';
import Hockey from './views/Hockey/hockeyHome';
import Teams from './views/Teams';
import Rosters from './views/Rosters';
import HockeyScores from './views/Hockey/Scores';
import HockeyBoxScore from './views/Hockey/BoxScore';
import HockeyStandings from './views/Hockey/Standings';
import { globalVariables } from './model/globalVariables';
import PlayerPage from './views/PlayerPage';
import PlayerHighlightVideos from './views/PlayerHighlightVideos';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/hockey',
    element: <Hockey />,
  },
  {
    path: '/hockey/home',
    element: <Hockey />,
  },
  {
    path: 'hockey/teams',
    element: <Teams />,
  },
  {
    path: 'hockey/scores',
    element: <HockeyScores />,
  },
  {
    path: 'hockey/standings',
    element: <HockeyStandings />,
  },

  {
    path: 'hockey/scores/boxscore',
    element: <HockeyBoxScore />,
  },
  {
    path: 'hockey/player/:playerId',
    element: <PlayerPage />,
  },
  {
    path: 'hockey/player/:playerId/highlights',
    element: <PlayerHighlightVideos />,
  },
  {
    path: 'hockey/teams/:teamName/roster',
    element: <Rosters currentSeason={globalVariables.currentSeason} />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
