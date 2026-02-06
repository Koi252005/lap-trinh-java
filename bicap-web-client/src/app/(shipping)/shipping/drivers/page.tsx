"use client";

import React, { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api";

interface Driver {
  id: string | number;
  name: string;
  vehicle: string;
  plate: string;
  status: string;
  phone?: string;
  current_job?: string | number | null;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = async () => {
    setError(null);
    try {
      const base = typeof API_BASE === "string" ? API_BASE : "http://localhost:5001/api";
      const response = await fetch(`${base}/drivers`, { method: "GET" });
      let rawData: unknown;
      try {
        rawData = await response.json();
      } catch {
        rawData = [];
      }
      const list = Array.isArray(rawData) ? rawData : (rawData && typeof rawData === "object" && "drivers" in (rawData as object) ? (rawData as { drivers: unknown[] }).drivers : []);
      const safeList = Array.isArray(list) ? list : [];

      const formattedData: Driver[] = safeList.map((item: any) => ({
        id: item.id ?? item._id,
        name: item.name || item.fullName || "Tài xế",
        vehicle: item.vehicle || item.vehicleType || "Xe tải",
        plate: item.plate || item.licensePlate || "---",
        status: item.status === "Bận" || item.status === "Rảnh" ? item.status : "Rảnh",
        phone: item.phone || item.sdt || "",
        current_job: item.current_job ?? null,
      }));

      setDrivers(formattedData);
      if (!response.ok) {
        setError("Không tải được danh sách tài xế. Mã phản hồi: " + response.status);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách tài xế:", err);
      setError("Không kết nối được tới server. Kiểm tra backend đã chạy tại đúng cổng chưa.");
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi vào trang
  useEffect(() => {
    fetchDrivers();
  }, []);

  // --- UI COMPONENTS ---

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🚚 Danh sách Tài xế & Phương tiện
          </h2>
          <p className="text-sm text-gray-500 mt-1">Giám sát trạng thái hoạt động của đội xe</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {/* GRID DANH SÁCH TÀI XẾ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.length > 0 ? (
          drivers.map((driver) => (
            <div key={driver.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition relative overflow-hidden group">
               {/* Dải màu trang trí bên phải */}
               <div className={`absolute top-0 right-0 w-20 h-20 opacity-10 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110
                ${driver.status === 'Bận' ? 'bg-red-500' : 'bg-green-500'}`}></div>

              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-3xl shadow-inner">
                  🧑‍✈️
                </div>
                
                <div className="flex-1 z-10">
                  <h3 className="font-bold text-gray-800 text-lg">{driver.name}</h3>
                  <div className="text-sm text-gray-500 mt-2 space-y-2">
                    <p className="flex items-center gap-2">
                        <span className="text-lg">🚛</span> 
                        <span className="font-medium text-gray-700">{driver.vehicle}</span>
                    </p>
                    <p className="flex items-center gap-2">
                        <span className="text-lg">🔢</span> 
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono font-bold text-gray-800 border">
                            {driver.plate}
                        </span>
                    </p>
                    {driver.phone && (
                        <p className="flex items-center gap-2">
                            <span className="text-lg">📞</span> 
                            <span className="font-mono text-gray-600">{driver.phone}</span>
                        </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Footer Card: Trạng thái */}
              <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                <div>
                    {driver.status === 'Bận' && driver.current_job ? (
                        <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                            Đang giao đơn #{driver.current_job}
                        </span>
                    ) : (
                        <span className="text-[10px] uppercase font-bold text-gray-400">
                            Sẵn sàng
                        </span>
                    )}
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm
                  ${driver.status === 'Bận' 
                    ? 'bg-red-50 text-red-600 border border-red-100' 
                    : 'bg-green-50 text-green-600 border border-green-100'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${driver.status === 'Bận' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                  {driver.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="text-4xl mb-2 opacity-50">🚚</div>
            <p className="text-gray-500">Chưa có tài xế nào trong hệ thống.</p>
            <p className="text-sm text-gray-400 mt-2 text-center max-w-md">
              Backend tự tạo 8 tài xế mẫu khi khởi động. Nếu vẫn trống, hãy khởi động lại backend.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}