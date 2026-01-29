"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// --- FIX LỖI ICON CỦA LEAFLET TRONG NEXT.JS ---
// (Mặc định Leaflet bị lỗi mất hình icon khi chạy với Webpack/Nextjs)
const iconUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png";

const customIcon = L.icon({
  iconUrl: iconUrl,
  iconRetinaUrl: iconRetinaUrl,
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Kiểu dữ liệu cho xe trên bản đồ
interface VehicleLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: string;
  speed: string;
}

interface MapProps {
  vehicles: VehicleLocation[];
}

export default function ShippingMap({ vehicles }: MapProps) {
  // Tọa độ trung tâm (Ví dụ: Hà Nội)
  const centerPosition: [number, number] = [21.0285, 105.8542]; 

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-200 z-0">
      <MapContainer 
        center={centerPosition} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%" }}
      >
        {/* Lớp bản đồ OpenStreetMap (Miễn phí) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Hiển thị các xe */}
        {vehicles.map((vehicle) => (
          <Marker 
            key={vehicle.id} 
            position={[vehicle.lat, vehicle.lng]}
            icon={customIcon}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-blue-600 text-sm">{vehicle.name}</h3>
                <p className="text-xs font-bold text-gray-700 mt-1">Biển số: {vehicle.id}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${vehicle.status === 'Đang chạy' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                    <span className="text-xs">{vehicle.status}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Tốc độ: {vehicle.speed}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}