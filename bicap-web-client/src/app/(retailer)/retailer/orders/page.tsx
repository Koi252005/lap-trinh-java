'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { auth } from '@/lib/firebase';

interface Order {
    id: number;
    product: {
        name: string;
        price: number;
        farm: {
            name: string;
        };
    };
    quantity: number;
    totalPrice: number;
    status: string;
    createdAt: string;
}

export default function RetailerOrders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchOrders = async () => {
            try {
                const token = await auth.currentUser?.getIdToken();
                const res = await axios.get('http://localhost:5001/api/orders/my-orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(res.data.orders);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [user]);

    const getStatusBadge = (status: string) => {
        const colors: any = {
            pending: 'bg-yellow-100 text-yellow-800',
            deposited: 'bg-blue-100 text-blue-800',
            confirmed: 'bg-indigo-100 text-indigo-800',
            shipping: 'bg-purple-100 text-purple-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        const labels: any = {
            pending: 'Chờ xác nhận',
            deposited: 'Đã đặt cọc',
            confirmed: 'Đã xác nhận',
            shipping: 'Đang vận chuyển',
            completed: 'Hoàn thành',
            cancelled: 'Đã hủy',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (loading) return <div className="p-8 text-center">Loading orders...</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Đơn Hàng Của Tôi</h1>

            {orders.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <p className="mb-4">Bạn chưa có đơn hàng nào.</p>
                    <Link href="/retailer/market" className="text-blue-600 hover:underline">
                        Đến sàn giao dịch để mua hàng
                    </Link>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mã ĐH</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sản phẩm</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trang trại</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tổng tiền</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ngày tạo</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {orders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">#{order.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {order.product.name}<br />
                                            <span className="text-xs text-gray-500">x{order.quantity}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.product.farm?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                            {Number(order.totalPrice).toLocaleString('vi-VN')} đ
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link href={`/retailer/orders/${order.id}`} className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400">
                                                Chi tiết
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
