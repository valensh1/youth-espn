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
import { globalVariables } from './model/globalVariables';

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
