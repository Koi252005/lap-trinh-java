'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

interface Farm {
    id: number;
    name: string;
    address: string;
    description: string;
    certification: string;
    location_coords: string;
}

export default function FarmInfoPage() {
    const { user } = useAuth();
    const [farms, setFarms] = useState<Farm[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingFarm, setEditingFarm] = useState<Farm | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        description: '',
        certification: '',
        location_coords: ''
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            fetchFarms();
        } else {
            // If auth is still loading, we might want to wait, or if no user, stop loading
            // But AuthContext handles 'loading' state.
        }
    }, [user]);

    const fetchFarms = async () => {
        setLoading(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) return;

            const res = await axios.get('http://localhost:5001/api/farms/my-farms', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.farms) {
                setFarms(res.data.farms);
            }
        } catch (err) {
            console.error("Fetch farm error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        setEditingFarm(null);
        setFormData({
            name: '',
            address: '',
            description: '',
            certification: '',
            location_coords: ''
        });
        setMessage('');
        setError('');
        setView('form');
    };

    const handleEdit = (farm: Farm) => {
        setEditingFarm(farm);
        setFormData({
            name: farm.name || '',
            address: farm.address || '',
            description: farm.description || '',
            certification: farm.certification || '',
            location_coords: farm.location_coords || ''
        });
        setMessage('');
        setError('');
        setView('form');
    };

    const handleCancel = () => {
        setView('list');
        setEditingFarm(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');

        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) throw new Error("Vui lòng đăng nhập lại");

            if (editingFarm) {
                // Update
                await axios.put(`http://localhost:5001/api/farms/${editingFarm.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage('Cập nhật trang trại thành công!');
            } else {
                // Create
                await axios.post('http://localhost:5001/api/farms', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage('Tạo trang trại mới thành công!');
            }

            // Refresh list and go back
            await fetchFarms();
            setView('list');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Lỗi xử lý');
        } finally {
            setSaving(false);
        }
    };

    if (loading && farms.length === 0) return <div className="p-8">Đang tải...</div>;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {view === 'list' ? 'Danh Sách Trang Trại' : (editingFarm ? 'Cập Nhật Trang Trại' : 'Tạo Trang Trại Mới')}
                </h1>
                {view === 'list' && (
                    <button
                        onClick={handleAddNew}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow"
                    >
                        + Thêm Trang Trại
                    </button>
                )}
                {view === 'form' && (
                    <button
                        onClick={handleCancel}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded shadow"
                    >
                        Quay lại
                    </button>
                )}
            </div>

            {message && <div className="p-4 mb-4 bg-green-100 text-green-700 rounded">{message}</div>}
            {error && <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">{error}</div>}

            {view === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {farms.length === 0 ? (
                        <div className="col-span-full text-center py-10 bg-white dark:bg-gray-800 rounded shadow">
                            <p className="text-gray-500">Bạn chưa có trang trại nào.</p>
                            <button onClick={handleAddNew} className="mt-4 text-green-600 font-medium hover:underline">
                                Tạo ngay trang trại đầu tiên
                            </button>
                        </div>
                    ) : (
                        farms.map((farm) => (
                            <div key={farm.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden border border-gray-100 dark:border-gray-700">
                                <div className="p-5">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{farm.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 h-10 overflow-hidden text-ellipsis line-clamp-2">
                                        {farm.address}
                                    </p>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => handleEdit(farm)}
                                            className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 font-medium"
                                        >
                                            Chỉnh sửa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tên Trang Trại *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Địa chỉ *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mô tả</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Chứng Nhận (VietGAP, GlobalGAP...)</label>
                                <input
                                    type="text"
                                    value={formData.certification}
                                    onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tọa độ (Location Coords)</label>
                                <input
                                    type="text"
                                    value={formData.location_coords}
                                    onChange={(e) => setFormData({ ...formData, location_coords: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2"
                                    placeholder="Vd: 10.762622, 106.660172"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                                {saving ? 'Đang lưu...' : (editingFarm ? 'Cập Nhật' : 'Tạo Mới')}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                                Hủy Bỏ
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
