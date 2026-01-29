"use client";
import React, { useState, useEffect } from "react";

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/shipments");
        if (!res.ok) throw new Error("API lỗi");
        
        const data = await res.json();
        console.log("Dữ liệu nhận được:", data); // Xem log để debug

        // --- MAPPING QUAN TRỌNG: Chuyển đổi dữ liệu Backend -> Frontend ---
        const mappedData = data.map((item: any) => ({
          id: item.id || item.trackingNumber,
          // Ưu tiên lấy diemDi/diemDen nếu backend trả về, nếu không thì lấy pickupLocation/deliveryLocation
          diemDi: item.diemDi || item.pickupLocation || "Kho không xác định",
          diemDen: item.diemDen || item.deliveryLocation || "Khách không xác định",
          // Xử lý tên tài xế (nếu null thì báo chưa có)
          taiXe: item.taiXe || item.driver?.fullName || "Chưa phân công",
          // Dịch trạng thái sang tiếng Việt
          status: item.status === 'assigned' ? 'Đang giao' 
                : item.status === 'shipping' ? 'Đang vận chuyển'
                : item.status === 'delivered' ? 'Hoàn thành'
                : item.status === 'created' ? 'Chờ lấy hàng'
                : item.status,
          // Giữ lại raw data để dùng cho QR Code
          details: {
            qrCode: item.pickupQRCode || `SHIP_${item.id}`,
            vehicle: item.vehicleInfo || "Xe tải",
            type: "Hàng hóa"
          }
        }));

        setShipments(mappedData);
      } catch (err) {
        console.error("Lỗi tải đơn:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("đang") || s.includes("shipping")) return "bg-blue-100 text-blue-700 border-blue-200";
    if (s.includes("chờ") || s.includes("created")) return "bg-orange-100 text-orange-700 border-orange-200";
    if (s.includes("hoàn") || s.includes("delivered")) return "bg-green-100 text-green-700 border-green-200";
    return "bg-gray-100 text-gray-600";
  };

  if (loading) return <div className="p-10 text-center">⏳ Đang tải dữ liệu...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          📦 Quản lý Đội Xe & Vận Đơn
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 text-xs font-bold uppercase border-b bg-gray-50">
                <th className="py-4 px-4">Mã vận đơn</th>
                <th className="py-4 px-4">Điểm đi</th>
                <th className="py-4 px-4">Điểm đến</th>
                <th className="py-4 px-4">Tài xế</th>
                <th className="py-4 px-4 text-center">Trạng thái</th>
                <th className="py-4 px-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shipments.map((order, index) => (
                <tr key={index} className="hover:bg-blue-50/50 transition">
                  <td className="py-4 px-4 font-bold text-blue-600">#{order.id}</td>
                  <td className="py-4 px-4 text-gray-700">{order.diemDi}</td>
                  <td className="py-4 px-4 text-gray-700">{order.diemDen}</td>
                  <td className="py-4 px-4 font-medium text-gray-800">{order.taiXe}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-blue-700 shadow-sm transition"
                    >
                      Xem & Quét QR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shipments.length === 0 && (
            <div className="text-center py-10 text-gray-400">Chưa có đơn hàng nào</div>
          )}
        </div>
      </div>

      {/* MODAL QR CODE */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
            <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
            
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-center text-white">
              <h3 className="font-bold text-lg">Mã Vận Đơn: #{selectedOrder.id}</h3>
              <p className="text-blue-100 text-sm opacity-90">Quét mã để cập nhật trạng thái</p>
            </div>

            <div className="p-8 flex flex-col items-center gap-6">
                <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${selectedOrder.details?.qrCode}`} 
                        alt="QR Code"
                        className="w-48 h-48"
                    />
                </div>
                
                <div className="w-full space-y-2">
                    <div className="flex justify-between text-sm border-b pb-2">
                        <span className="text-gray-500">Tài xế:</span>
                        <span className="font-bold text-gray-800">{selectedOrder.taiXe}</span>
                    </div>
                    <div className="flex justify-between text-sm border-b pb-2">
                        <span className="text-gray-500">Xe vận chuyển:</span>
                        <span className="font-bold text-gray-800">{selectedOrder.details?.vehicle}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full">
                    <button className="py-3 rounded-lg bg-gray-100 text-gray-700 font-bold hover:bg-gray-200">Đóng</button>
                    <button className="py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">
                        📸 Xác nhận
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}