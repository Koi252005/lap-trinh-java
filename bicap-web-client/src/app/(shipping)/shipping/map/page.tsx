"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// --- IMPORT MAP DYNAMIC (QUAN TRỌNG) ---
// ssr: false nghĩa là chỉ render ở phía client
const ShippingMap = dynamic(() => import("@/components/ShippingMap"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
      <p className="text-gray-500 animate-pulse">Đang tải bản đồ vệ tinh...</p>
    </div>
  )
});

export default function LiveMapPage() {
  // Dữ liệu giả lập vị trí xe (Sau này bạn có thể gọi API để lấy tọa độ thực)
  // Vì API driver ở bước trước chưa có trường lat/lng, nên mình mock tạm ở đây nhé.
  const [vehicles, setVehicles] = useState([
    {
      id: "29C-123.45",
      name: "Xe tải 1.5 Tấn - Tài xế A",
      lat: 21.0285,
      lng: 105.8542, // Hồ Gươm, Hà Nội
      status: "Đang chạy",
      speed: "45 km/h"
    },
    {
      id: "51D-999.88",
      name: "Xe bán tải - Tài xế B",
      lat: 21.033, 
      lng: 105.840, // Gần Lăng Bác
      status: "Đang dừng",
      speed: "0 km/h"
    },
    {
      id: "29H1-567.89",
      name: "Xe máy - Tài xế C",
      lat: 21.015,
      lng: 105.820, // Khu Đống Đa
      status: "Đang chạy",
      speed: "30 km/h"
    }
  ]);

  // Giả lập xe di chuyển (Cứ 3 giây cập nhật vị trí 1 chút cho sinh động)
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prevs => prevs.map(v => {
        if (v.status === "Đang dừng") return v;
        return {
          ...v,
          lat: v.lat + (Math.random() - 0.5) * 0.001, // Nhích nhẹ tọa độ
          lng: v.lng + (Math.random() - 0.5) * 0.001
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 h-[calc(100vh-64px)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🗺️ Bản đồ Giám sát Thời gian thực
          </h2>
          <p className="text-sm text-gray-500">Theo dõi vị trí đội xe trên toàn quốc</p>
        </div>
        <div className="flex gap-4">
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-sm font-medium">Đang hoạt động: 2</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <span className="text-sm font-medium">Đang dừng: 1</span>
            </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 bg-white p-2 rounded-xl shadow-sm border border-gray-100 relative">
        {/* Gọi Component Map */}
        <ShippingMap vehicles={vehicles} />
        
        {/* Chú thích nổi trên Map */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-lg z-[400] text-xs">
            <p className="font-bold mb-1">Trạng thái kết nối GPS</p>
            <div className="flex items-center gap-2 text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Ổn định (Ping: 24ms)
            </div>
        </div>
      </div>
    </div>
  );
}