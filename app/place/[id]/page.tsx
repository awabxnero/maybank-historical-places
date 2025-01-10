'use client'

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { Star, MapPin, ArrowLeft, Check } from 'lucide-react';
import { toggleVisited, fetchPlaceStart, syncVisitedState } from '../../../redux/historicalPlacesSlice';

export default function PlaceDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentPlace: place, loading, error } = useSelector((state: any) => state.historicalPlaces);

  useEffect(() => {
    if (typeof id === 'string') {
      dispatch(fetchPlaceStart(id));
    }
    dispatch(syncVisitedState());
  }, [dispatch, id]);

  const handleToggleVisited = () => {
    if (place) {
      dispatch(toggleVisited(place.id));
    }
  };

  if (loading || !place) return <div className="container mx-auto p-4">Loading...</div>;
  if (error) return <div className="container mx-auto p-4">Error: {error}</div>;

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
        <Link href="/">
          <Button variant="outline" className="mb-6 border-[#FEC83D] text-[#FEC83D] hover:bg-[#FEC83D] hover:text-white rounded">
            <ArrowLeft size={16} className="mr-2" /> Back to List
          </Button>
        </Link>
        <Card className="overflow-hidden shadow-lg rounded-lg">
          <Image src={place.imageUrl} alt={place.name} width={800} height={400} className="w-full h-64 object-cover" />
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">{place.name}</CardTitle>
            <CardDescription className="flex items-center text-sm text-gray-500">
              <MapPin size={16} className="mr-1" /> {place.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <Star className="text-[#FEC83D] mr-1" />
              <span className="font-semibold">{place.rating || 'N/A'}</span>
              <span className="text-gray-500 text-sm ml-1">({place.rating ? 'Rating' : 'No rating available'})</span>
            </div>
            <p className="text-gray-700">Status: {place.visited ? 'Visited' : 'Not visited'}</p>
          </CardContent>
          <CardFooter className="bg-gray-50 pt-4">
            <Button
              onClick={handleToggleVisited}
              variant={place.visited ? "secondary" : "default"}
              className={`${place.visited ? ' bg-green-500 hover:bg-green-600' : 'bg-[#FEC83D] hover:bg-[#FDB81D]'} text-black flex items-center rounded`}
            >
              {place.visited ? (
                <>
                  <Check size={16} className="mr-2" />
                  Visited
                </>
              ) : (
                'Mark as Visited'
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

