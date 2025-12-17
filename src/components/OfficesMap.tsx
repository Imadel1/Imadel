import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon paths for Leaflet in bundlers like Vite
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

export interface OfficeMarker {
  id: string;
  country?: string;
  city?: string;
  address?: string;
  lat: number;
  lng: number;
}

interface OfficesMapProps {
  offices: OfficeMarker[];
}

const OfficesMap: React.FC<OfficesMapProps> = ({ offices }) => {
  // Default to Bamako if no coordinates yet
  const defaultCenter: [number, number] = [12.65, -8.0];

  const center = useMemo<[number, number]>(() => {
    if (!offices.length) return defaultCenter;
    const valid = offices.filter(o => typeof o.lat === 'number' && typeof o.lng === 'number');
    if (!valid.length) return defaultCenter;

    const avgLat = valid.reduce((sum, o) => sum + o.lat, 0) / valid.length;
    const avgLng = valid.reduce((sum, o) => sum + o.lng, 0) / valid.length;
    return [avgLat, avgLng];
  }, [offices]);

  if (!offices.length) {
    return (
      <div style={{ width: '100%', height: '100%', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <p style={{ color: 'var(--text-secondary, #616161)', textAlign: 'center' }}>
          Les bureaux seront affichés sur la carte dès que leurs coordonnées seront ajoutées dans le panneau d&apos;administration.
        </p>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={5}
      style={{ width: '100%', height: '100%', minHeight: '400px' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        // French OpenStreetMap tiles so labels and UI are primarily in French
        attribution='&copy; les contributeurs d’<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
      />
      {offices.map((office) => (
        <Marker key={office.id} position={[office.lat, office.lng]}>
          <Popup>
            <div style={{ maxWidth: '220px' }}>
              <strong>{office.country || 'Bureau'}</strong>
              {office.city && <div>{office.city}</div>}
              {office.address && <div style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}>{office.address}</div>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default OfficesMap;


