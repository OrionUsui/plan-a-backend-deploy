import React, { useEffect, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'];

const containerStyle = {
  width: '100%',
  height: '60vh',
  maxWidth: '800px',
  borderRadius: '12px',
  boxShadow: '0 0 20px rgba(0,0,0,0.3)',
};

function Map({ location }) {
  const [mapCenter, setMapCenter] = useState({ lat: 35.6762, lng: 139.6503 }); // Default: Tokyo
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
  };

  // Update center when location prop changes
  useEffect(() => {
    if (!location || !isLoaded) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: location }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const { lat, lng } = results[0].geometry.location;
        setMapCenter({ lat: lat(), lng: lng() });
      }
    });
  }, [location, isLoaded]);

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMapCenter({ lat, lng });
      }
    }
  };

  if (loadError) return <div>❌ Error loading maps</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#121212',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '3rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '800px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0 1rem',
        }}
      >
        <h2 style={{ color: 'white', marginBottom: '1rem', textAlign: 'center' }}>
          🗺️ MapA
        </h2>
  
        <Autocomplete onLoad={(auto) => (autocompleteRef.current = auto)} onPlaceChanged={onPlaceChanged}>
          <input
            type="text"
            placeholder="Search a place..."
            ref={inputRef}
            style={{
              width: '100%',
              padding: '0.6rem 1rem',
              fontSize: '1rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              border: '1px solid #ccc',
            }}
          />
        </Autocomplete>
  
        <div style={{ width: '100%' }}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={12}
            options={mapOptions}
          />
        </div>
      </div>
    </div>
  );
  
}

export default Map;
