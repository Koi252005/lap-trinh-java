'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { API_BASE } from '@/lib/api';

interface Driver {
  id: number;
  fullName?: string;
  name?: string;
  phone?: string;
}

interface PendingOrder {
  id: number;
  status: string;
  quantity: number;
  totalPrice: number;
  pickupAddress?: string | null;
  deliveryAddress?: string | null;
  product?: { name: string; farm?: { name: string; address?: string } };
}

interface ShipmentRow {
  id: number;
  diemDi: string;
  diemDen: string;
  taiXe: string;
  status: string;
  details?: { qrCode?: string; vehicle?: string };
}

export default function ShipmentsPage() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<ShipmentRow[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentRow | null>(null);
  const [approveModal, setApproveModal] = useState<PendingOrder | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!auth?.currentUser) {
      setLoading(false);
      return;
    }
    setError(null);
    const token = await auth.currentUser.getIdToken();
    try {
      const [shipRes, ordersRes, driversRes] = await Promise.all([
        axios.get(`${API_BASE}/shipments`, { validateStatus: () => true }),
        axios.get(`${API_BASE}/orders/pending-shipment`, { headers: { Authorization: `Bearer ${token}` }, validateStatus: () => true }),
        axios.get(`${API_BASE}/drivers`, { validateStatus: () => true }),
      ]);

      if (Array.isArray(shipRes.data)) {
        setShipments(shipRes.data.map((item: any) => ({
          id: item.id,
          diemDi: item.diemDi || item.pickupLocation || 'Chưa cập nhật',
          diemDen: item.diemDen || item.deliveryLocation || 'Chưa cập nhật',
          taiXe: item.taiXe || item.driver?.fullName || 'Chưa phân công',
          status: item.status || 'created',
          details: item.details || { qrCode: `SHIP_${item.id}`, vehicle: item.vehicleInfo || 'Xe tải' },
        })));
      } else {
        setShipments([]);
      }

      if (ordersRes.status === 200 && ordersRes.data?.orders && Array.isArray(ordersRes.data.orders)) {
        setPendingOrders(ordersRes.data.orders);
      } else {
        setPendingOrders([]);
        if (ordersRes.status === 401) setError('Vui lòng đăng nhập với tài khoản Shipping.');
        else if (ordersRes.status === 403) setError('Tài khoản không có quyền xem đơn chờ giao.');
      }

      if (driversRes.status === 200 && Array.isArray(driversRes.data)) {
        setDrivers(driversRes.data.map((d: any) => ({
          id: d.id,
          fullName: d.fullName || d.name || '',
          name: d.fullName || d.name || '',
          phone: d.phone || '',
        })));
      } else {
        setDrivers([]);
      }
    } catch (e) {
      console.error(e);
      setError('Không tải được dữ liệu. Kiểm tra kết nối và backend.');
      setShipments([]);
      setPendingOrders([]);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [user?.id, fetchData]);

  const handleApproveShipment = async () => {
    if (!approveModal || !selectedDriverId) {
      alert('Vui lòng chọn tài xế.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const token = await auth?.currentUser?.getIdToken();
      if (!token) {
        alert('Phiên đăng nhập hết hạn.');
        setSubmitting(false);
        return;
      }
      await axios.post(
        `${API_BASE}/shipments`,
        {
          orderId: approveModal.id,
          driverId: Number(selectedDriverId),
          vehicleInfo: vehicleInfo.trim() || 'Xe tải',
          pickupLocation: (approveModal.pickupAddress && approveModal.pickupAddress.trim()) || approveModal.product?.farm?.address || '',
          deliveryLocation: (approveModal.deliveryAddress && approveModal.deliveryAddress.trim()) || '',
        },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      setApproveModal(null);
      setSelectedDriverId('');
      setVehicleInfo('');
      await fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Tạo vận đơn thất bại.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      created: 'Chờ phân công',
      pending_pickup: 'Chờ lấy hàng',
      assigned: 'Đã phân công',
      picked_up: 'Đã lấy hàng',
      delivering: 'Đang giao',
      delivered: 'Hoàn thành',
      failed: 'Thất bại',
      shipping: 'Đang giao',
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 'bg-green-100 text-green-700';
    if (['assigned', 'picked_up', 'delivering', 'shipping'].includes(s)) return 'bg-blue-100 text-blue-700';
    if (['created', 'pending_pickup'].includes(s)) return 'bg-amber-100 text-amber-700';
    if (s === 'failed') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return <div className="p-10 text-center">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {error && <div className="p-3 rounded bg-red-100 text-red-800 text-sm">{error}</div>}

      <section className="bg-white rounded-lg border p-4">
        <h2 className="text-lg font-bold mb-4">Đơn hàng chờ giao (đã xác nhận, chưa có vận đơn)</h2>
        {pendingOrders.length === 0 ? (
          <p className="text-gray-500 py-4">Chưa có đơn nào chờ giao.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="py-2 px-2">Mã đơn</th>
                  <th className="py-2 px-2">Sản phẩm</th>
                  <th className="py-2 px-2">Điểm lấy hàng</th>
                  <th className="py-2 px-2">Điểm đến</th>
                  <th className="py-2 px-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="py-2 px-2 font-medium">#{order.id}</td>
                    <td className="py-2 px-2">{order.product?.name || '—'}</td>
                    <td className="py-2 px-2 max-w-[200px] truncate" title={order.pickupAddress || ''}>{order.pickupAddress || order.product?.farm?.address || 'Chưa có'}</td>
                    <td className="py-2 px-2 max-w-[200px] truncate" title={order.deliveryAddress || ''}>{order.deliveryAddress || 'Chưa có'}</td>
                    <td className="py-2 px-2">
                      <button
                        type="button"
                        onClick={() => { setApproveModal(order); setSelectedDriverId(''); setVehicleInfo(''); setError(null); }}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium"
                      >
                        Duyệt đơn giao
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white rounded-lg border p-4">
        <h2 className="text-lg font-bold mb-4">Vận đơn đã tạo</h2>
        {shipments.length === 0 ? (
          <p className="text-gray-500 py-4">Chưa có vận đơn nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="py-2 px-2">Mã vận đơn</th>
                  <th className="py-2 px-2">Điểm đi (lấy hàng)</th>
                  <th className="py-2 px-2">Điểm đến (giao hàng)</th>
                  <th className="py-2 px-2">Tài xế</th>
                  <th className="py-2 px-2">Trạng thái</th>
                  <th className="py-2 px-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="py-2 px-2 font-medium">#{s.id}</td>
                    <td className="py-2 px-2 max-w-[180px] truncate" title={s.diemDi}>{s.diemDi}</td>
                    <td className="py-2 px-2 max-w-[180px] truncate" title={s.diemDen}>{s.diemDen}</td>
                    <td className="py-2 px-2">{s.taiXe}</td>
                    <td className="py-2 px-2"><span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(s.status)}`}>{getStatusLabel(s.status)}</span></td>
                    <td className="py-2 px-2">
                      <button type="button" onClick={() => setSelectedShipment(s)} className="text-blue-600 text-sm font-medium">Xem QR</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {approveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="font-bold">Duyệt đơn giao – Đơn #{approveModal.id}</h3>
              <p className="text-sm text-gray-500">{approveModal.product?.name}</p>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500">Điểm lấy hàng</label>
                <p className="text-sm text-gray-800">{approveModal.pickupAddress?.trim() || approveModal.product?.farm?.address || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Điểm đến (giao khách)</label>
                <p className="text-sm text-gray-800">{approveModal.deliveryAddress?.trim() || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Chọn tài xế *</label>
                <select value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)} className="w-full border rounded p-2 text-sm">
                  <option value="">-- Chọn tài xế --</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>{d.fullName || d.name} {d.phone ? ` – ${d.phone}` : ''}</option>
                  ))}
                </select>
                {drivers.length === 0 && <p className="text-amber-600 text-xs mt-1">Không có tài xế. Khởi động lại backend để tạo 8 tài xế mẫu.</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Phương tiện (tùy chọn)</label>
                <input type="text" value={vehicleInfo} onChange={(e) => setVehicleInfo(e.target.value)} placeholder="VD: Xe tải" className="w-full border rounded p-2 text-sm" />
              </div>
            </div>
            <div className="p-4 flex gap-2 justify-end border-t">
              <button type="button" onClick={() => { setApproveModal(null); setError(null); }} className="px-3 py-2 rounded bg-gray-200 text-gray-800 text-sm">Hủy</button>
              <button type="button" onClick={handleApproveShipment} disabled={submitting || !selectedDriverId} className="px-3 py-2 rounded bg-green-600 text-white text-sm disabled:opacity-50">
                {submitting ? 'Đang xử lý...' : 'Xác nhận & Gán tài xế'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedShipment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
            <button type="button" onClick={() => setSelectedShipment(null)} className="absolute top-2 right-2 text-gray-500">✕</button>
            <h3 className="font-bold mb-4">Vận đơn #{selectedShipment.id}</h3>
            <div className="mb-4 flex justify-center">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${selectedShipment.details?.qrCode || selectedShipment.id}`} alt="QR" />
            </div>
            <div className="text-sm space-y-2">
              <p><span className="text-gray-500">Tài xế:</span> {selectedShipment.taiXe}</p>
              <p><span className="text-gray-500">Điểm đi:</span> {selectedShipment.diemDi}</p>
              <p><span className="text-gray-500">Điểm đến:</span> {selectedShipment.diemDen}</p>
            </div>
            <button type="button" onClick={() => setSelectedShipment(null)} className="mt-4 w-full py-2 rounded bg-gray-200 text-gray-800 text-sm">Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
