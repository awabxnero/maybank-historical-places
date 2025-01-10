'use client'

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import historicalPlacesReducer from '../redux/historicalPlacesSlice';
import { fetchHistoricalPlacesEpic, fetchPlaceDetailsEpic } from '../redux/epics';
import '../styles/globals.css';

const epicMiddleware = createEpicMiddleware();

const store = configureStore({
  reducer: {
    historicalPlaces: historicalPlacesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(epicMiddleware),
});

epicMiddleware.run((action$, state$) => {
  return combineEpics(fetchHistoricalPlacesEpic, fetchPlaceDetailsEpic)(action$, state$);
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900 font-sans">
        <Provider store={store}>
          {children}
        </Provider>
      </body>
    </html>
  )
}

