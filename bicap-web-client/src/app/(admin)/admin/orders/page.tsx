'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '@/lib/firebase';
import { API_BASE } from '@/lib/api';

interface OrderRow {
  id: number;
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  product: {
    name: string;
    farm?: { name: string };
  };
  retailer: {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
  };
}

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  deposited: 'Đã cọc',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    if (!auth?.currentUser) {
      setLoading(false);
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      const url = `${API_BASE}/admin/orders${statusFilter ? `?status=${statusFilter}` : ''}`;
      const res = await axios.get<{ orders: OrderRow[]; pagination?: any }>(url, {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: () => true,
      });
      if (res.status === 200) {
        const orderList = Array.isArray(res.data.orders) ? res.data.orders : [];
        setOrders(orderList);
        if (orderList.length === 0 && res.status === 200) {
          console.log('Admin orders: API trả về empty - có thể chưa có đơn hàng trong DB');
        }
      } else {
        console.warn('Admin orders API error:', res.status, res.data);
        setOrders([]);
      }
    } catch (e: any) {
      console.error('Admin orders fetch error:', e.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const updateStatus = async (orderId: number, newStatus: string) => {
    if (!confirm(`Chuyển đơn #${orderId} sang "${STATUS_LABELS[newStatus] || newStatus}"?`)) return;
    if (!auth?.currentUser) return;
    setUpdatingId(orderId);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.put(
        `${API_BASE}/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }, validateStatus: () => true }
      );
      if (res.status === 200) {
        fetchOrders();
      } else {
        alert(res.data?.message || 'Cập nhật thất bại');
      }
    } catch (e) {
      alert('Lỗi kết nối');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-gray-500">Đang tải đơn hàng...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Quản lý đơn hàng</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Admin có thể xác nhận hoặc hủy đơn từ phía retailer. Chủ trại (farmer) cũng có thể duyệt đơn tại trang Quản lý đơn hàng của Farm.
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <label className="font-medium text-gray-700 dark:text-gray-300">Lọc trạng thái:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Mã ĐH</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Sản phẩm</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Trang trại</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Khách hàng</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tổng tiền</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ngày tạo</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <div className="text-gray-500">
                      <p className="font-medium mb-2">Chưa có đơn hàng nào trong database.</p>
                      <p className="text-sm text-gray-400">
                        Lưu ý: Đơn hàng demo (từ localStorage) không hiển thị ở đây. Chỉ đơn hàng được tạo qua API và lưu trong database mới hiển thị.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">#{order.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                      {order.product?.name} <span className="text-gray-500">x{order.quantity}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {order.product?.farm?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                      {order.retailer?.fullName}
                      {order.retailer?.email && (
                        <div className="text-xs text-gray-500">{order.retailer.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">
                      {Number(order.totalPrice).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(order.id, 'confirmed')}
                            disabled={updatingId === order.id}
                            className="text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                          >
                            {updatingId === order.id ? '...' : 'Xác nhận'}
                          </button>
                          <button
                            onClick={() => updateStatus(order.id, 'cancelled')}
                            disabled={updatingId === order.id}
                            className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                          >
                            Hủy
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
