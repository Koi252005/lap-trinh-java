'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

export default function ProfilePage() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        address: '',
        businessLicense: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                address: (user as any).address || '',
                businessLicense: (user as any).businessLicense || ''
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const token = await auth?.currentUser?.getIdToken();
            if (!token) throw new Error("No token found");

            await axios.put('http://localhost:5001/api/auth/profile', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage('Cập nhật thông tin thành công!');
        } catch (error: any) {
            console.error(error);
            setMessage('Lỗi cập nhật: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Helper to get auth instance since it's not exported from context directly but available in firebase.ts
    // We need to import auth from firebase config
    const { auth } = require('@/lib/firebase');

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Hồ Sơ Cá Nhân (Profile)</h1>

            {message && (
                <div className={`p-4 mb-4 rounded ${message.includes('thành công') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Họ và Tên</label>
                    <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Địa chỉ</label>
                    <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Giấy Phép Kinh Doanh</label>
                    <input
                        type="text"
                        value={formData.businessLicense}
                        onChange={(e) => setFormData({ ...formData, businessLicense: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                        placeholder="Số GPHĐKD..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input
                        type="text"
                        value={user?.email || ''}
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 shadow-sm sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vai Trò</label>
                    <input
                        type="text"
                        value={user?.role || ''}
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 shadow-sm sm:text-sm p-2 border"
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                        {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                </div>
            </form>
        </div>
    );
}
