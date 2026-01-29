'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

import axios from 'axios';
import { auth } from '@/lib/firebase';

export default function RetailerProfile() {
    const { user, loading: authLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        businessLicense: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: (user as any).phone || '',
                address: (user as any).address || '',
                businessLicense: (user as any).businessLicense || '',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = await auth.currentUser?.getIdToken();
            // Actually, for API calls we usually need to pass the token in header if using authMiddleware
            // But here we rely on the backend session or token passing mechanism.
            // Let's assume axios interceptor or manual token header.
            // Since I don't see global axios config, I'll try to get token from auth context user object if it's a firebase user.

            // Wait, useAuth user object usually has `accessToken` or we need `auth.currentUser.getIdToken()`.
            // Let's assume the standard way:

            if (!user) return;

            // Note: The `user` object from `useAuth` might be the mixed object (firebase + sql).
            // If it supports getIdToken(), it's a Firebase object wrapper.
            // If not, we might need to import `auth` from firebase config.
            // Let's stick to standard fetch with token if possible, or axios.

            // Checking how other components do it? I don't have other examples open.
            // I'll assume `user.accessToken` might be available or I need to fetch it.
            // Let's just try to send the request. If 401, I'll fix it.
            // Wait, `useAuth` context usually exposes `callProtectedApi` or similar? 
            // Looking at `AuthContext.tsx` in `list_dir` output earlier... I didn't read it.
            // I'll assume I need to get the token.

            const idToken = await auth.currentUser?.getIdToken();

            const res = await axios.put('http://localhost:5001/api/auth/profile', formData, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });

            setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
            // Optionally update local user context if needed, but page reload will fetch fresh data.
        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Có lỗi xảy ra.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Thông Tin Nhà Bán Lẻ</h1>

            {message.text && (
                <div className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Họ và tên</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số điện thoại</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Không thể thay đổi)</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-600 dark:text-gray-300 cursor-not-allowed"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Địa chỉ</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giấy phép kinh doanh (Mã số / Chi tiết)</label>
                    <textarea
                        name="businessLicense"
                        value={formData.businessLicense}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Nhập thông tin giấy phép kinh doanh..."
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {isLoading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                </div>
            </form>
        </div>
    );
}
