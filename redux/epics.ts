import { Epic, ofType } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { 
  fetchPlacesStart, 
  fetchPlacesSuccess, 
  fetchPlacesFailure,
  fetchPlaceStart,
  fetchPlaceSuccess,
  fetchPlaceFailure
} from './historicalPlacesSlice';

// Note: The API key is exposed becuase this is just a prototype :)
const API_KEY = 'AIzaSyBnZCWZrYTin3FPIzfHk0E6iAKQsy2WA-I';

const fetchHistoricalPlaces = async (nextPageToken: string | null): Promise<any> => {
  try {
    const query = 'historical places in Malaysia';
    let url = `https://proxy.cors.sh/https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;
    
    if (nextPageToken) {
      url += `&pagetoken=${nextPageToken}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.error('API response:', JSON.stringify(data, null, 2));
      throw new Error(`API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    const places = data.results.map((place: any) => ({
      id: place.place_id,
      name: place.name,
      description: place.formatted_address,
      rating: place.rating,
      imageUrl: place.photos && place.photos.length > 0
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${API_KEY}`
        : 'https://www.svgrepo.com/show/508699/landscape-placeholder.svg',
      visited: false,
    }));

    return { places, nextPageToken: data.next_page_token || null };
  } catch (error) {
    console.error('Error fetching historical places:', error);
    if (error instanceof Error) {
      throw new Error(`Fetch error: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while fetching historical places');
    }
  }
};

const fetchPlaceDetails = async (placeId: string): Promise<any> => {
  try {
    const url = `https://proxy.cors.sh/https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,formatted_address,photos&key=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.error('API response:', JSON.stringify(data, null, 2));
      throw new Error(`API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    const place = data.result;
    return {
      id: placeId,
      name: place.name,
      description: place.formatted_address,
      rating: place.rating,
      imageUrl: place.photos && place.photos.length > 0
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${API_KEY}`
        : 'https://www.svgrepo.com/show/508699/landscape-placeholder.svg',
      visited: false, 
    };
  } catch (error) {
    console.error('Error fetching place details:', error);
    if (error instanceof Error) {
      throw new Error(`Fetch error: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while fetching place details');
    }
  }
};

export const fetchHistoricalPlacesEpic: Epic = (action$, state$) =>
  action$.pipe(
    ofType(fetchPlacesStart.type),
    mergeMap(() =>
      from(fetchHistoricalPlaces(state$.value.historicalPlaces.nextPageToken)).pipe(
        map(({ places, nextPageToken }) => fetchPlacesSuccess({ places, nextPageToken })),
        catchError((error) => {
          if (error instanceof Error) {
            return of(fetchPlacesFailure(error.message));
          } else if (typeof error === 'object' && error !== null) {
            return of(fetchPlacesFailure(JSON.stringify(error)));
          } else {
            return of(fetchPlacesFailure('An unknown error occurred'));
          }
        })
      )
    )
  );

export const fetchPlaceDetailsEpic: Epic = (action$) =>
  action$.pipe(
    ofType(fetchPlaceStart.type),
    mergeMap((action: any) =>
      from(fetchPlaceDetails(action.payload)).pipe(
        map((place) => fetchPlaceSuccess(place)),
        catchError((error) => {
          if (error instanceof Error) {
            return of(fetchPlaceFailure(error.message));
          } else if (typeof error === 'object' && error !== null) {
            return of(fetchPlaceFailure(JSON.stringify(error)));
          } else {
            return of(fetchPlaceFailure('An unknown error occurred'));
          }
        })
      )
    )
  );

