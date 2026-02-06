'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { API_BASE } from '@/lib/api';

interface DashboardData {
  overview: {
    totalUsers: number;
    totalFarms: number;
    totalOrders: number;
    totalProducts: number;
    activeSubscriptions: number;
    totalRevenue: number;
    pendingReports: number;
    activeShipments: number;
  };
  usersByRole: Record<string, number>;
  ordersByStatus: Record<string, number>;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  deposited: 'Đã cọc',
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!auth?.currentUser) {
        setLoading(false);
        return;
      }
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await axios.get<DashboardData>(`${API_BASE}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: () => true,
        });
        if (res.status === 200) {
          setData(res.data);
        } else {
          // Nếu API lỗi, dùng dữ liệu mặc định (0) thay vì hiển thị lỗi
          setData({
            overview: {
              totalUsers: 0,
              totalFarms: 0,
              totalOrders: 0,
              totalProducts: 0,
              activeSubscriptions: 0,
              totalRevenue: 0,
              pendingReports: 0,
              activeShipments: 0,
            },
            usersByRole: {},
            ordersByStatus: {},
            monthlyRevenue: [],
          });
        }
      } catch (e) {
        // Dùng dữ liệu mặc định khi lỗi kết nối
        setData({
          overview: {
            totalUsers: 0,
            totalFarms: 0,
            totalOrders: 0,
            totalProducts: 0,
            activeSubscriptions: 0,
            totalRevenue: 0,
            pendingReports: 0,
            activeShipments: 0,
          },
          usersByRole: {},
          ordersByStatus: {},
          monthlyRevenue: [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center">
        <p className="text-amber-800 dark:text-amber-200">Đang tải dữ liệu...</p>
      </div>
    );
  }

  const o = data.overview;
  const ordersByStatus = data.ordersByStatus || {};

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Tổng quan hệ thống</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Người dùng</h2>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{o.totalUsers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Trang trại</h2>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{o.totalFarms}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Đơn hàng</h2>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{o.totalOrders}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Doanh thu (VNĐ)</h2>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {o.totalRevenue?.toLocaleString('vi-VN') ?? '0'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Đơn hàng theo trạng thái</h2>
          </div>
          <div className="p-6">
            {Object.keys(ordersByStatus).length === 0 ? (
              <p className="text-gray-500">Chưa có đơn hàng nào.</p>
            ) : (
              <ul className="space-y-2">
                {Object.entries(ordersByStatus).map(([status, count]) => (
                  <li key={status} className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">{STATUS_LABELS[status] || status}</span>
                    <span className="font-semibold">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Người dùng theo vai trò</h2>
          </div>
          <div className="p-6">
            {data.usersByRole && Object.keys(data.usersByRole).length > 0 ? (
              <ul className="space-y-2">
                {Object.entries(data.usersByRole).map(([role, count]) => (
                  <li key={role} className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">{role}</span>
                    <span className="font-semibold">{count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Chưa có dữ liệu.</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700"
        >
          Quản lý đơn hàng
        </Link>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700"
        >
          Quản lý người dùng
        </Link>
      </div>
    </div>
  );
}
