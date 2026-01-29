"use client";

import React, { useState, useEffect } from "react";

// Dữ liệu dự phòng (Backup) - Hiện ra khi API lỗi hoặc DB rỗng
const BACKUP_DATA = [
  {
    id: "DH-001 (Demo)",
    diemDi: "Nông trại Xanh", diemDen: "BigC Thăng Long", taiXe: "Nguyễn Văn A", 
    status: "Đang giao",
    details: { vehicle: "29C-123.45", type: "Rau củ", weight: "500kg", qrCode: "QR_DH001_SECURE" }
  },
  {
    id: "DH-002 (Demo)",
    diemDi: "Green Farm", diemDen: "VinMart", taiXe: "Chưa phân công", 
    status: "Chờ lấy",
    details: { vehicle: "---", type: "Dâu tây", weight: "200kg", qrCode: "QR_DH002_PENDING" }
  }
];

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // --- KẾT NỐI API THẬT ---
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        // Gọi API thật
        const res = await fetch("http://localhost:5001/api/shipments");
        
        if (!res.ok) throw new Error("Kết nối API thất bại");
        
        const data = await res.json();
        
        // Nếu DB rỗng hoặc lỗi, dùng backup để không bị trắng trang
        if (!data || data.length === 0) {
            console.warn("DB rỗng, dùng dữ liệu mẫu.");
            setShipments(BACKUP_DATA);
        } else {
            // Map dữ liệu từ API sang chuẩn hiển thị (đề phòng API trả về tên trường khác)
            const mappedData = data.map((item: any) => ({
                id: item.id || "DH-???",
                diemDi: item.diemDi || item.pickupLocation || "Kho đi",
                diemDen: item.diemDen || item.deliveryLocation || "Kho đến",
                taiXe: item.taiXe || item.driver?.fullName || "Chưa phân công",
                status: item.status === 'assigned' ? 'Đang giao' 
                      : item.status === 'created' ? 'Chờ lấy' 
                      : item.status || 'Chờ xử lý',
                details: {
                    qrCode: item.pickupQRCode || `SHIPMENT_${item.id}`,
                    vehicle: "Xe tải 1.5 Tấn", // Giả lập nếu thiếu
                    type: "Hàng hóa",
                    weight: "---"
                }
            }));
            setShipments(mappedData);
        }
      } catch (err) {
        console.error("Lỗi API, chuyển sang chế độ Demo:", err);
        setShipments(BACKUP_DATA); // Fallback về backup an toàn
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("đang") || s.includes("assigned")) return "bg-blue-100 text-blue-600 border-blue-200";
    if (s.includes("chờ") || s.includes("created")) return "bg-orange-100 text-orange-600 border-orange-200";
    if (s.includes("hoàn") || s.includes("delivered")) return "bg-green-100 text-green-600 border-green-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  const handleScanQR = (action: string) => {
    alert(`⚡ [Server Log] Đang gửi yêu cầu: ${action}\nĐơn hàng: ${selectedOrder.id}`);
  };

  if (loading) return (
      <div className="flex justify-center items-center h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          📦 Quản lý Đơn hàng Vận chuyển
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 text-xs font-bold uppercase border-b bg-gray-50">
                <th className="py-4 px-4">Mã đơn</th>
                <th className="py-4 px-4">Điểm đi</th>
                <th className="py-4 px-4">Điểm đến</th>
                <th className="py-4 px-4">Tài xế</th>
                <th className="py-4 px-4 text-center">Trạng thái</th>
                <th className="py-4 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shipments.map((order, index) => (
                <tr key={index} className="hover:bg-blue-50/50 transition">
                  <td className="py-4 px-4 font-bold text-blue-600">{order.id}</td>
                  <td className="py-4 px-4">{order.diemDi}</td>
                  <td className="py-4 px-4">{order.diemDen}</td>
                  <td className="py-4 px-4 font-medium">{order.taiXe}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm hover:underline cursor-pointer"
                    >
                      Xem & Quét QR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL QUÉT QR --- */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg">Mã Vận Đơn: {selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="hover:bg-blue-700 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
            </div>

            <div className="p-6 flex flex-col items-center gap-4">
                <div className="bg-white p-2 rounded shadow border border-gray-200">
                    {/* QR Code hiển thị ở đây */}
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${selectedOrder.details?.qrCode || selectedOrder.id}`} 
                        alt="QR Code"
                        className="w-40 h-40"
                    />
                </div>
                <p className="font-mono text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
                    {selectedOrder.details?.qrCode || selectedOrder.id}
                </p>

                <div className="w-full grid grid-cols-2 gap-3 mt-2">
                    <button 
                        onClick={() => handleScanQR("CONFIRM_PICKUP")}
                        className="bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 shadow-lg flex items-center justify-center gap-2"
                    >
                        📸 Nhận hàng
                    </button>
                    <button 
                        onClick={() => handleScanQR("CONFIRM_DELIVERY")}
                        className="bg-green-600 text-white py-2.5 rounded-lg font-bold hover:bg-green-700 shadow-lg flex items-center justify-center gap-2"
                    >
                        📸 Giao hàng
                    </button>
                </div>
                
                {/* Thông tin phụ */}
                <div className="w-full text-sm text-gray-600 border-t pt-4 mt-2">
                    <div className="flex justify-between mb-1">
                        <span>Phương tiện:</span>
                        <span className="font-bold">{selectedOrder.details?.vehicle}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Loại hàng:</span>
                        <span className="font-bold">{selectedOrder.details?.type}</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}