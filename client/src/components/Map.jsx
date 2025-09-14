import { useSearchParams, useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  useMap,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useState } from "react";
import styles from "./Map.module.css";
import { useCities } from "../hooks/useCities";
import { useGeolocation } from "../hooks/useGeolocation";
import { useUrlLocation } from "../hooks/useUrlLocation";
import Button from "./Button";

function Map() {
  // Hooks
  // cities data
  const { cities } = useCities();
  // browser location
  const {
    isLoading: isLoadingPostition,
    position: browserPosition,
    getPosition: getBrowserPosition,
  } = useGeolocation();
  // url location
  const [currentLat, currentLng] = useUrlLocation();

  // Map position
  const defaultPosition = [51.505, -0.09];
  const [MapPosition, setMapPosition] = useState(defaultPosition);

  // Sync currentCity position with map position
  useEffect(() => {
    if (currentLat && currentLng) {
      setMapPosition([currentLat, currentLng]);
    }
  }, [currentLat, currentLng]);

  // Sync browser position with map position
  useEffect(() => {
    if (browserPosition) {
      setMapPosition(browserPosition);
    }
  }, [browserPosition]);

  // RENDER CITIES MARKERS
  const renderedCitiesMarkers = cities.map((city) => {
    return (
      <Marker position={[city.position.lat, city.position.lng]} key={city.id}>
        <Popup>
          <span>{city.emoji}</span>
          <span>{city.cityName}</span>
        </Popup>
      </Marker>
    );
  });

  // BUTTON TO GET BROWSER LOCATION
  const buttonLocation = !browserPosition && (
    <Button
      type="position"
      onClick={() => {
        getBrowserPosition();
        console.log(browserPosition);
      }}
    >
      {isLoadingPostition ? "Loading..." : "Use your location"}
    </Button>
  );

  // MAP
  return (
    <div className={styles.mapContainer}>
      {buttonLocation}
      <MapContainer
        center={MapPosition}
        zoom={6}
        scrollWheelZoom={true}
        className={styles.map}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
        />

        {renderedCitiesMarkers}

        <LocateCurrent position={MapPosition} />
        <DetectLocation />
      </MapContainer>
    </div>
  );
}

// Map Components
function LocateCurrent({ position }) {
  const map = useMap();
  map.flyTo(position, 6, {
    animate: true,
    duration: 1,
  });

  return null;
}

function DetectLocation() {
  const navigate = useNavigate();

  useMapEvents({
    click: (event) => {
      navigate(`form?lat=${event.latlng.lat}&lng=${event.latlng.lng}`);
    },
  });

  return null;
}

export default Map;
