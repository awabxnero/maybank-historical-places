'use client'

import { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchPlacesStart, toggleVisited, resetPlaces, syncVisitedState } from '../redux/historicalPlacesSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Star, MapPin, Check } from 'lucide-react';

export default function HistoricalPlacesApp() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { places, loading, error, nextPageToken } = useSelector((state: any) => state.historicalPlaces);
  const [retryCount, setRetryCount] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPlaceElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && nextPageToken) {
        dispatch(fetchPlacesStart());
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, nextPageToken, dispatch]);

  useEffect(() => {
    dispatch(resetPlaces());
    dispatch(fetchPlacesStart());
    dispatch(syncVisitedState());
  }, [dispatch, retryCount]);

  const handleToggleVisited = (id: string) => {
    dispatch(toggleVisited(id));
  };

  const handleRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
  };

  const handleSuggestRandomPlace = () => {
    if (places.length > 0) {
      const randomIndex = Math.floor(Math.random() * places.length);
      const randomPlace = places[randomIndex];
      router.push(`/place/${randomPlace.id}`);
    }
  };

  if (error) return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
      <p>{error}</p>
      <p className="mt-4">Please check the console for more detailed error information.</p>
      <Button onClick={handleRetry} className="mt-4 rounded">Retry</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#FEC83D] shadow-md">
        <div className="container mx-auto px-4 py-6 flex items-center">
          <Image 
            src="https://brandlogos.net/wp-content/uploads/2024/04/maybank-logo_brandlogos.net_qz2cj.png" 
            alt="Maybank Logo" 
            width={50} 
            height={50} 
            className="mr-4"
          />
          <h1 className="text-3xl font-bold text-black">Maybank Historical Places</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Button 
            onClick={handleSuggestRandomPlace}
            className="bg-[#FEC83D] hover:bg-[#FDB81D] text-black rounded cursor-pointer hover:cursor-pointer"
          >
            Suggest a Random Place
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((place: any, index: number) => (
            <Card key={`${place.id}-${index}`} ref={index === places.length - 1 ? lastPlaceElementRef : null} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <div className="relative h-48">
                <Image src={place.imageUrl} alt={place.name} layout="fill" objectFit="cover" />
              </div>
              <CardHeader className="flex-grow">
                <CardTitle className="text-xl font-semibold line-clamp-2">{place.name}</CardTitle>
                <CardDescription className="flex items-center text-sm text-gray-500 mt-2">
                  <MapPin size={16} className="mr-2 flex-shrink-0" />
                  <span className="line-clamp-2">{place.description}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Star className="text-[#FEC83D] mr-2 flex-shrink-0" size={16} />
                  <span className="font-semibold">{place.rating || 'N/A'}</span>
                  <span className="text-gray-500 text-sm ml-1">{place.rating ? 'Rating' : 'No rating available'}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between bg-gray-50 p-4">
                <Button
                  onClick={() => handleToggleVisited(place.id)}
                  variant={place.visited ? "secondary" : "default"}
                  className={`${place.visited ? 'bg-green-500 hover:bg-green-600' : 'bg-[#FEC83D] hover:bg-[#FDB81D]'} text-black flex items-center rounded`}
                >
                  {place.visited ? (
                    <>
                      <Check size={16} className="mr-2" />
                      Visited
                    </>
                  ) : (
                    'Mark Visited'
                  )}
                </Button>
                <Link href={`/place/${place.id}`}>
                  <Button variant="outline" className="border-[#FEC83D] text-[#FEC83D] hover:bg-[#FEC83D] hover:text-black rounded">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        {loading && (
          <div className="text-center mt-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#FEC83D] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

