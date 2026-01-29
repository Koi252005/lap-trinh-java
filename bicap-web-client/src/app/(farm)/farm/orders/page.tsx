'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Order {
    id: number;
    quantity: number;
    totalPrice: number;
    status: string;
    createdAt: string;
    product: {
        name: string;
        price: number;
        batchCode: string;
    };
    retailer: {
        id: number;
        fullName: string;
        email: string;
        phone: string;
    };
}

interface Farm {
    id: number;
    name: string;
}

export default function FarmOrderManager() {
    const { user } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [farms, setFarms] = useState<Farm[]>([]);
    const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    // Shipment Creation State REMOVED
    // Retailer Info State
    const [showRetailerModal, setShowRetailerModal] = useState(false);
    const [selectedRetailer, setSelectedRetailer] = useState<Order['retailer'] | null>(null);

    useEffect(() => {
        if (user) fetchFarms();
    }, [user]);

    useEffect(() => {
        if (selectedFarmId) fetchOrders(selectedFarmId);
    }, [selectedFarmId]);

    const fetchFarms = async () => {
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await axios.get('http://localhost:5001/api/farms/my-farms', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.farms?.length > 0) {
                setFarms(res.data.farms);
                setSelectedFarmId(res.data.farms[0].id);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const fetchOrders = async (farmId: number) => {
        setLoading(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await axios.get(`http://localhost:5001/api/orders/farm/${farmId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data.orders);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId: number, newStatus: string) => {
        // Only confirm for specific statuses if needed
        if (newStatus === 'confirmed' || newStatus === 'cancelled') {
            if (!confirm(`Bạn có chắc muốn chuyển trạng thái thành "${newStatus}"?`)) return;
        }

        try {
            const token = await auth.currentUser?.getIdToken();
            await axios.put(`http://localhost:5001/api/orders/${orderId}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Cập nhật thành công!');
            fetchOrders(selectedFarmId!);
        } catch (error) {
            console.error(error);
            alert('Lỗi cập nhật');
        }
    };

    const handleRequestShipping = async (orderId: number) => {
        if (!confirm('Bạn có muốn liên hệ đơn vị vận chuyển đến lấy hàng?')) return;

        try {
            const token = await auth.currentUser?.getIdToken();
            // Call API with minimal data (just orderId)
            await axios.post('http://localhost:5001/api/shipments', {
                orderId: orderId,
                pickupTime: new Date() // Hint to backend "Pickup now/soon"
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Đã gửi yêu cầu vận chuyển! Shipper sẽ liên hệ sớm.');
            // Update UI/Order Status
            updateStatus(orderId, 'shipping');
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Lỗi tạo yêu cầu vận chuyển');
        }
    };

    if (loading && farms.length === 0) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Quản Lý Đơn Hàng</h1>
                <Link href="/farm/shipments" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    🚚 Xem Danh Sách Vận Chuyển
                </Link>
            </div>

            {farms.length > 1 && (
                <div className="mb-4">
                    <label className="mr-2 font-semibold">Chọn trang trại:</label>
                    <select
                        className="border p-2 rounded"
                        value={selectedFarmId || ''}
                        onChange={(e) => setSelectedFarmId(Number(e.target.value))}
                    >
                        {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã Đơn</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản Phẩm</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách Hàng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng Tiền</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành Động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Chưa có đơn hàng nào.</td>
                            </tr>
                        ) : (
                            orders.map(order => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{order.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{order.product.name}</div>
                                        <div className="text-sm text-gray-500">x {order.quantity} kg</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white font-medium">{order.retailer.fullName}</div>
                                        <div className="text-xs text-blue-600 cursor-pointer hover:underline"
                                            onClick={() => {
                                                setSelectedRetailer(order.retailer);
                                                setShowRetailerModal(true);
                                            }}
                                        >
                                            Xem chi tiết
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                                        {Number(order.totalPrice).toLocaleString()} đ
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        order.status === 'shipping' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {order.status === 'shipping' ? 'Đã yêu cầu VC' : order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        {order.status === 'pending' && (
                                            <>
                                                <button onClick={() => updateStatus(order.id, 'confirmed')} className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded">Duyệt</button>
                                                <button onClick={() => updateStatus(order.id, 'cancelled')} className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded">Hủy</button>
                                            </>
                                        )}
                                        {order.status === 'confirmed' && (
                                            <button onClick={() => handleRequestShipping(order.id)} className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded flex items-center gap-1">
                                                <span>📞</span> Liên hệ Vận Chuyển
                                            </button>
                                        )}
                                        {order.status === 'shipping' && (
                                            <span className="text-gray-400 italic">Đang chờ shipper...</span>
                                        )}
                                        {order.status === 'delivered' && (
                                            <span className="text-green-600 font-bold">✓ Đã giao</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* View Retailer Modal */}
            {showRetailerModal && selectedRetailer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setShowRetailerModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                            🏬 Thông Tin Nhà Bán Lẻ
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                                    {selectedRetailer.fullName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedRetailer.fullName}</h3>
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Đối tác tin cậy</span>
                                </div>
                            </div>

                            <div className="border-t pt-4 space-y-3">
                                <div>
                                    <label className="text-sm text-gray-500 block">Email</label>
                                    <p className="font-medium">{selectedRetailer.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 block">Số điện thoại</label>
                                    <p className="font-medium">{selectedRetailer.phone}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 block">Lịch sử giao dịch</label>
                                    <p className="text-sm text-gray-600">Đã hoàn tất 15 đơn hàng trong 6 tháng qua.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-2">
                            <button
                                onClick={() => setShowRetailerModal(false)}
                                className="bg-gray-800 text-white font-bold py-2 px-6 rounded hover:bg-gray-900"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
