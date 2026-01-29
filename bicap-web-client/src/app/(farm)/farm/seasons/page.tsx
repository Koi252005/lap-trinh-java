'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

interface Season {
    id: number;
    name: string;
    startDate: string;
    endDate: string | null;
    status: string;
    txHash: string | null;
}

interface Farm {
    id: number;
    name: string;
}

export default function SeasonListPage() {
    const { user } = useAuth();
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [farms, setFarms] = useState<Farm[]>([]);
    const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    // 1. Fetch Farms when user is ready
    useEffect(() => {
        if (user) {
            fetchFarms();
        }
    }, [user]);

    // 2. Fetch Seasons when selectedFarmId changes
    useEffect(() => {
        if (selectedFarmId) {
            fetchSeasons(selectedFarmId);
        }
    }, [selectedFarmId]);

    const fetchFarms = async () => {
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await axios.get('http://localhost:5001/api/farms/my-farms', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.farms && res.data.farms.length > 0) {
                setFarms(res.data.farms);
                // Auto-select first farm
                setSelectedFarmId(res.data.farms[0].id);
            } else {
                setLoading(false); // No farms, stop loading
            }
        } catch (error) {
            console.error("Error fetching farms:", error);
            setLoading(false);
        }
    };

    const fetchSeasons = async (farmId: number) => {
        setLoading(true);
        try {
            // Public endpoint for reading seasons (or private, both work with token)
            // Ideally we use token for everything in dashboard
            const token = await auth.currentUser?.getIdToken();
            const res = await axios.get(`http://localhost:5001/api/seasons/farm/${farmId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSeasons(res.data);
        } catch (error) {
            console.error("Error fetching seasons:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && farms.length === 0) return <div className="p-8">Đang tải...</div>;

    if (farms.length === 0) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-600 mb-4">Bạn chưa có trang trại nào.</p>
                <Link href="/farm/info" className="text-green-600 hover:underline">Tạo trang trại ngay</Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">Quản Lý Vụ Mùa</h1>

                <div className="flex gap-4 items-center">
                    {/* Farm Selector */}
                    {farms.length > 1 && (
                        <select
                            className="border p-2 rounded"
                            value={selectedFarmId || ''}
                            onChange={(e) => setSelectedFarmId(Number(e.target.value))}
                        >
                            {farms.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    )}

                    <Link
                        href={`/farm/seasons/create?farmId=${selectedFarmId}`}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow"
                    >
                        + Tạo Vụ Mùa Mới
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {seasons.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded shadow text-center text-gray-500">
                        Chưa có vụ mùa nào cho trang trại này.
                    </div>
                ) : (
                    seasons.map((season) => (
                        <Link key={season.id} href={`/farm/seasons/${season.id}`}>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition flex justify-between items-center border border-gray-100 dark:border-gray-700 cursor-pointer">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                        {season.name}
                                        {season.status === 'active'
                                            ? <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Đang diễn ra</span>
                                            : <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Đã kết thúc</span>
                                        }
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Bắt đầu: {new Date(season.startDate).toLocaleDateString()}
                                        {season.endDate && ` - Kết thúc: ${new Date(season.endDate).toLocaleDateString()}`}
                                    </p>
                                </div>
                                <div className="text-right">
                                    {season.txHash && (
                                        <div className="mb-2">
                                            <span className="text-xs font-mono bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100" title={season.txHash}>
                                                Blockchain Verified 🔗
                                            </span>
                                        </div>
                                    )}
                                    <span className="text-gray-400 text-sm">Xem chi tiết &rarr;</span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
