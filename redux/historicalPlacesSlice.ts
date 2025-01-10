import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface HistoricalPlace {
  id: string;
  name: string;
  description: string;
  rating: number;
  imageUrl: string;
  visited: boolean;
}

interface HistoricalPlacesState {
  places: HistoricalPlace[];
  loading: boolean;
  error: string | null;
  nextPageToken: string | null;
  currentPlace: HistoricalPlace | null;
}

const getVisitedPlaces = (): string[] => {
  if (typeof window !== 'undefined') {
    const visited = localStorage.getItem('visitedPlaces');
    return visited ? JSON.parse(visited) : [];
  }
  return [];
};

const setVisitedPlaces = (visitedPlaces: string[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('visitedPlaces', JSON.stringify(visitedPlaces));
  }
};

const initialState: HistoricalPlacesState = {
  places: [],
  loading: false,
  error: null,
  nextPageToken: null,
  currentPlace: null,
};

const historicalPlacesSlice = createSlice({
  name: 'historicalPlaces',
  initialState,
  reducers: {
    fetchPlacesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchPlacesSuccess(state, action: PayloadAction<{ places: HistoricalPlace[], nextPageToken: string | null }>) {
      const visitedPlaces = getVisitedPlaces();
      state.places = [
        ...state.places,
        ...action.payload.places.map(place => ({
          ...place,
          visited: visitedPlaces.includes(place.id)
        }))
      ];
      state.nextPageToken = action.payload.nextPageToken;
      state.loading = false;
    },
    fetchPlacesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    toggleVisited(state, action: PayloadAction<string>) {
      const place = state.places.find(p => p.id === action.payload);
      if (place) {
        place.visited = !place.visited;
        const visitedPlaces = getVisitedPlaces();
        if (place.visited) {
          setVisitedPlaces([...visitedPlaces, place.id]);
        } else {
          setVisitedPlaces(visitedPlaces.filter(id => id !== place.id));
        }
      }
      if (state.currentPlace && state.currentPlace.id === action.payload) {
        state.currentPlace.visited = !state.currentPlace.visited;
      }
    },
    resetPlaces(state) {
      state.places = [];
      state.nextPageToken = null;
    },
    fetchPlaceStart(state, action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
    },
    fetchPlaceSuccess(state, action: PayloadAction<HistoricalPlace>) {
      const visitedPlaces = getVisitedPlaces();
      state.currentPlace = {
        ...action.payload,
        visited: visitedPlaces.includes(action.payload.id)
      };
      state.loading = false;
    },
    fetchPlaceFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    syncVisitedState(state) {
      const visitedPlaces = getVisitedPlaces();
      if (state.currentPlace) {
        state.currentPlace.visited = visitedPlaces.includes(state.currentPlace.id);
      }
      state.places = state.places.map(place => ({
        ...place,
        visited: visitedPlaces.includes(place.id)
      }));
    },
  },
});

export const { 
  fetchPlacesStart, 
  fetchPlacesSuccess, 
  fetchPlacesFailure, 
  toggleVisited, 
  resetPlaces,
  fetchPlaceStart,
  fetchPlaceSuccess,
  fetchPlaceFailure,
  syncVisitedState
} = historicalPlacesSlice.actions;
export default historicalPlacesSlice.reducer;

