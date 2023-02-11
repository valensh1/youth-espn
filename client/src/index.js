import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Test from './test/test';
import ErrorPage from './test/error';
import Teams from './views/Teams';
import Hockey from './views/Hockey/hockeyHome';

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
    path: 'hockey/teams/ochc',
    element: <Teams />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
