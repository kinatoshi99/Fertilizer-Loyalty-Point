import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

interface CustomerMapProps {
  lat: number;
  lng: number;
  address: string;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

// Use a placeholder constant for the API Key.
// process.env is not available in this browser-based environment without a specific build tool.
// FIX: Explicitly type as string to allow comparison with another string literal without a type error.
const API_KEY: string = 'AIzaSyDEPSsry9S9zLAUWY6auIPaQcexZt48Zro'; // IMPORTANT: Replace with your actual Google Maps API Key

export const CustomerMap: React.FC<CustomerMapProps> = ({ lat, lng, address }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: API_KEY,
  });

  const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(false);

  const center = { lat, lng };

  // Map options to enable zoom/pan but keep a clean UI
  const mapOptions = {
    panControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    zoomControl: true,
    clickableIcons: false,
  };
  
  const handleMarkerClick = () => {
    setIsInfoWindowOpen(!isInfoWindowOpen);
  };

  if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    return (
      <div className="w-full h-full bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center">
        <p className="text-slate-500 text-center p-4">Google Maps API Key is missing.</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-slate-200 dark:bg-slate-700 animate-pulse rounded-xl" />
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      options={mapOptions}
    >
      <Marker position={center} onClick={handleMarkerClick}>
        {isInfoWindowOpen && (
          <InfoWindow
            position={center}
            onCloseClick={() => setIsInfoWindowOpen(false)}
          >
            <div className="p-1 font-inter">
              <p className="font-semibold text-charcoal">{address}</p>
            </div>
          </InfoWindow>
        )}
      </Marker>
    </GoogleMap>
  );
};