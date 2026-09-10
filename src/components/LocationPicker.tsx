import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon (Leaflet's default paths break with bundlers like Vite)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LocationPickerProps {
  onLocationSelect: (data: {
    lat: number;
    lng: number;
    address: string;
  }) => void;
}

const DEFAULT_CENTER: [number, number] = [27.7172, 85.324]; // Kathmandu, adjust as needed

function ClickHandler({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  const handleSelect = async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    setLoadingAddress(true);

    try {
      // Reverse geocode via Nominatim (OpenStreetMap's free geocoding service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      const data = await response.json();
      const address =
        data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      onLocationSelect({ lat, lng, address });
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      onLocationSelect({
        lat,
        lng,
        address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      });
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => handleSelect(pos.coords.latitude, pos.coords.longitude),
      (err) => console.error("Geolocation error:", err),
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-500">Click on the map to drop a pin</p>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="text-xs font-medium text-emerald-600 hover:underline"
        >
          Use my current location
        </button>
      </div>

      <div className="h-64 w-full overflow-hidden rounded-lg border border-slate-300">
        <MapContainer
          center={position ?? DEFAULT_CENTER}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <ClickHandler onSelect={handleSelect} />
          {position && <Marker position={position} />}
        </MapContainer>
      </div>

      {loadingAddress && (
        <p className="mt-1 text-xs text-slate-400">Looking up address...</p>
      )}
    </div>
  );
}

export default LocationPicker;
