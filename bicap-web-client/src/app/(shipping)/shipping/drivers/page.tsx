"use client";

import React, { useState, useEffect } from "react";

// Định nghĩa kiểu dữ liệu Tài xế (Cập nhật để khớp với Backend mới)
interface Driver {
  id: string | number;
  name: string;
  vehicle: string;
  plate: string;
  status: string;
  phone?: string;
  current_job?: string | number; // ID đơn hàng đang chạy (nếu có)
}

export default function DriversPage() {
  // --- STATE ---
  // Chỉ còn lại state danh sách và loading
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  // --- HÀM LẤY DỮ LIỆU TỪ API (GET) ---
  const fetchDrivers = async () => {
    try {
      // Gọi API (Đường dẫn này khớp với controller getAllDrivers bạn vừa thêm)
      const response = await fetch("http://localhost:5001/api/drivers");
      
      if (!response.ok) {
        // Fallback: Nếu API chưa chạy hoặc lỗi, dùng dữ liệu giả để không trắng trang
        console.warn("API lỗi hoặc chưa bật, dùng dữ liệu mẫu.");
        setDrivers([
             { id: 1, name: "Nguyễn Văn A (Demo)", vehicle: "Xe tải 1.5 Tấn", plate: "29C-123.45", status: "Bận", phone: "0987654321", current_job: "DH-001" },
             { id: 2, name: "Trần Văn B (Demo)", vehicle: "Xe bán tải", plate: "51D-999.88", status: "Rảnh", phone: "0912345678" },
        ]);
        return;
      }

      const rawData = await response.json();
      console.log("Drivers Data:", rawData);

      // Map dữ liệu cẩn thận để tránh lỗi tên trường
      const formattedData = rawData.map((item: any) => ({
        id: item.id || item._id,
        name: item.name || item.fullName || "Tài xế",
        vehicle: item.vehicle || item.vehicleType || "Xe tải",
        plate: item.plate || item.licensePlate || "---",
        status: item.status || "Rảnh", 
        phone: item.phone || item.sdt || "",
        current_job: item.current_job || null
      }));

      setDrivers(formattedData);
    } catch (error) {
      console.error("Lỗi tải danh sách tài xế:", error);
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
      
      {/* HEADER: Đã xóa nút Thêm tài xế */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🚚 Danh sách Tài xế & Phương tiện
          </h2>
          <p className="text-sm text-gray-500 mt-1">Giám sát trạng thái hoạt động của đội xe</p>
        </div>
      </div>

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
            <div className="text-4xl mb-2 opacity-50">📭</div>
            <p className="text-gray-500">Chưa có tài xế nào trong hệ thống.</p>
          </div>
        )}
      </div>
    </div>
  );
}