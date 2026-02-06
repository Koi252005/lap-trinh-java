'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { auth } from '@/lib/firebase';
import { API_BASE } from '@/lib/api';
import Link from 'next/link';

interface ProfileUser {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
    address?: string;
    businessLicense?: string;
    role?: string;
    status?: string;
}

export default function RetailerProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const [profileLoading, setProfileLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        businessLicense: '',
    });

    // Lấy hồ sơ đầy đủ từ API (có phone, address, businessLicense từ DB)
    const fetchProfile = async () => {
        if (!auth?.currentUser) return;
        try {
            const token = await auth.currentUser.getIdToken();
            const res = await axios.get<ProfileUser>(`${API_BASE}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const u = res.data;
            setFormData({
                fullName: u.fullName || '',
                email: u.email || '',
                phone: u.phone || '',
                address: u.address || '',
                businessLicense: u.businessLicense || '',
            });
        } catch (err) {
            // Fallback: dùng user từ context nếu chưa có trong DB hoặc lỗi
            if (user) {
                setFormData({
                    fullName: user.fullName || '',
                    email: user.email || '',
                    phone: (user as ProfileUser).phone || '',
                    address: (user as ProfileUser).address || '',
                    businessLicense: (user as ProfileUser).businessLicense || '',
                });
            }
        } finally {
            setProfileLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && user) {
            fetchProfile();
        } else if (!authLoading && !user) {
            setProfileLoading(false);
        }
    }, [authLoading, user?.id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            const token = await auth?.currentUser?.getIdToken();
            if (!token) {
                setMessage({ type: 'error', text: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' });
                setSaving(false);
                return;
            }
            await axios.put(
                `${API_BASE}/auth/profile`,
                {
                    fullName: formData.fullName,
                    phone: formData.phone,
                    address: formData.address,
                    businessLicense: formData.businessLicense,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage({ type: 'success', text: 'Đã lưu thay đổi.' });
            fetchProfile();
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err) ? err.response?.data?.message : null;
            setMessage({ type: 'error', text: msg || 'Có lỗi khi lưu. Thử lại sau.' });
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || profileLoading) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800 h-64" />
                <div className="mt-4 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-2xl mx-auto p-6 text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">Bạn cần đăng nhập để xem hồ sơ.</p>
                <Link href="/login" className="text-green-600 hover:underline font-medium">Đăng nhập</Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-6">
            <Link href="/retailer" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-green-600 mb-6">
                ← Quay lại
            </Link>

            {/* Header hồ sơ */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-8 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
                            👤
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{formData.fullName || 'Chưa cập nhật tên'}</h1>
                            <p className="text-green-100 text-sm mt-0.5">{formData.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-white/20 text-xs font-medium">
                                Nhà bán lẻ
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form chỉnh sửa */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Chỉnh sửa hồ sơ</h2>

                {message && (
                    <div
                        className={`mb-4 p-3 rounded-lg text-sm ${
                            message.type === 'success'
                                ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                                : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Họ và tên
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Nguyễn Văn A"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 dark:text-gray-300 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email đăng nhập không thể thay đổi.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Số điện thoại
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                            placeholder="0901234567"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Địa chỉ
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Giấy phép kinh doanh (tùy chọn)
                        </label>
                        <textarea
                            name="businessLicense"
                            value={formData.businessLicense}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white resize-none"
                            placeholder="Mã số hoặc mô tả giấy phép kinh doanh..."
                        />
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
