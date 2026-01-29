'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase'; // Direct import for token

function CreateSeasonContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    // Setup state
    const [farmId, setFarmId] = useState<string>('');
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const paramFarmId = searchParams.get('farmId');
        if (paramFarmId) {
            setFarmId(paramFarmId);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        if (!farmId) {
            setError("Chưa chọn trang trại. Vui lòng quay lại danh sách.");
            setSaving(false);
            return;
        }

        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) throw new Error("Vui lòng đăng nhập");

            await axios.post('http://localhost:5001/api/seasons', {
                name,
                startDate,
                farmId: Number(farmId)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Redirect back to list
            router.push('/farm/seasons');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 bg-white dark:bg-gray-800 rounded shadow mt-10">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Tạo Vụ Mùa Mới</h1>

            {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tên Vụ Mùa</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Ví dụ: Lúa Đông Xuân 2025"
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ngày Bắt Đầu</label>
                    <input
                        type="date"
                        required
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                </div>

                <div className="pt-4 flex gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow disabled:opacity-50"
                    >
                        {saving ? 'Đang tạo...' : 'Tạo Vụ Mùa (Blockchain)'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded shadow"
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function CreateSeasonPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CreateSeasonContent />
        </Suspense>
    );
}
