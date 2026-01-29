'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';

interface EnvData {
    temperature: number;
    humidity: number;
    ph: number;
    timestamp: string;
}

interface Farm {
    id: number;
    name: string;
}

export default function FarmMonitoringPage() {
    const { user } = useAuth();
    const [currentData, setCurrentData] = useState<EnvData | null>(null);
    const [history, setHistory] = useState<EnvData[]>([]);
    const [loading, setLoading] = useState(true);

    // Farm Selection
    const [farms, setFarms] = useState<Farm[]>([]);
    const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);

    // 1. Fetch Farms first
    useEffect(() => {
        if (!user) return;
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
                    setLoading(false); // No farms
                }
            } catch (error) {
                console.error("Error fetching farms:", error);
                setLoading(false);
            }
        };
        fetchFarms();
    }, [user]);

    // 2. Fetch Data when farm selected
    useEffect(() => {
        if (!selectedFarmId) return;

        const fetchData = async () => {
            try {
                const token = await auth.currentUser?.getIdToken();
                const resCurrent = await axios.get(`http://localhost:5001/api/monitoring/current/${selectedFarmId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCurrentData(resCurrent.data.data);

                const resHistory = await axios.get(`http://localhost:5001/api/monitoring/history/${selectedFarmId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistory(resHistory.data.history);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000); // 5s refresh

        return () => clearInterval(interval);
    }, [selectedFarmId]);

    if (loading && farms.length === 0) return <div className="p-8">Đang tải dữ liệu...</div>;

    const getStatusColor = (val: number, type: 'temp' | 'hum' | 'ph') => {
        if (type === 'temp') return val > 35 ? 'text-red-600' : 'text-green-600';
        if (type === 'hum') return val < 50 ? 'text-yellow-600' : 'text-blue-600';
        return 'text-purple-600';
    };

    // --- Custom SVG Chart Component ---
    const SimpleLineChart = ({ data, dataKey, color, height = 200 }: { data: EnvData[], dataKey: keyof EnvData, color: string, height?: number }) => {
        if (!data || data.length < 2) return <div className="h-full flex items-center justify-center text-gray-400">Đang thu thập dữ liệu...</div>;

        const maxVal = Math.max(...data.map(d => Number(d[dataKey]))) * 1.1; // +10% padding
        const minVal = Math.min(...data.map(d => Number(d[dataKey]))) * 0.9;
        const range = maxVal - minVal;

        // SVG Dimensions
        const width = 800; // viewBox width
        const h = height;

        // Calculate points
        const points = data.map((d, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = h - ((Number(d[dataKey]) - minVal) / range) * h;
            return { x, y, val: d[dataKey], time: d.timestamp };
        });

        // Generate Path Command (Smooth curve using cubic bezier would be complex, using polyline for simplicity or basic smoothing)
        // Let's do a simple straight line first for robustness, or simple Catmull-Rom if needed.
        // For "SimpleLineChart", straight line segments L x y is enough for "Monitoring" look.
        const pathData = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');

        // Gradient Area
        const areaPathData = `${pathData} L ${width} ${h} L 0 ${h} Z`;

        return (
            <div className="w-full h-full relative group">
                <svg viewBox={`0 0 ${width} ${h}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    {/* Area under curve */}
                    <path d={areaPathData} fill={`url(#grad-${dataKey})`} className="transition-all duration-300" />
                    {/* Line */}
                    <path d={pathData} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm" />

                    {/* Data Points (visible on hover) */}
                    {points.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke={color} strokeWidth="2"
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:r-6 cursor-pointer"
                        >
                            <title>{`${new Date(p.time).getHours()}h: ${p.val}`}</title>
                        </circle>
                    ))}
                </svg>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        Giám Sát Môi Trường
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Dữ liệu thời gian thực từ các cảm biến IoT</p>
                </div>

                {/* Farm Selector */}
                {farms.length > 0 && (
                    <div className="relative">
                        <select
                            className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 font-medium cursor-pointer"
                            value={selectedFarmId || ''}
                            onChange={(e) => setSelectedFarmId(Number(e.target.value))}
                        >
                            {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                )}
            </div>

            {farms.length === 0 && (
                <div className="p-6 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200 flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Bạn chưa có trang trại nào. Vui lòng tạo trang trại trước.
                </div>
            )}

            {selectedFarmId && (
                <>
                    {/* Current Status Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Temperature */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <svg className="w-24 h-24 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"></path></svg>
                            </div>
                            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wider">Nhiệt Độ Không Khí</h3>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className={`text-5xl font-extrabold ${getStatusColor(currentData?.temperature || 0, 'temp')}`}>
                                    {currentData?.temperature}
                                </span>
                                <span className="text-xl text-gray-500 font-medium">°C</span>
                            </div>
                            <div className="mt-4 text-sm text-gray-400 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Cập nhật: {new Date(currentData?.timestamp || Date.now()).toLocaleTimeString()}
                            </div>
                        </div>

                        {/* Humidity */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <svg className="w-24 h-24 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                            </div>
                            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wider">Độ Ẩm Tương Đối</h3>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className={`text-5xl font-extrabold ${getStatusColor(currentData?.humidity || 0, 'hum')}`}>
                                    {currentData?.humidity}
                                </span>
                                <span className="text-xl text-gray-500 font-medium">%</span>
                            </div>
                            <div className="mt-4 text-sm text-gray-400 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Trạng thái: Ổn định
                            </div>
                        </div>

                        {/* pH */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <svg className="w-24 h-24 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.761 2.165 17.5 5 17.5h10c2.835 0 4.183-2.739 2.293-4.621l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a4 4 0 00-2.172-.102l1.027-1.028A3 3 0 009 8.172z" clipRule="evenodd"></path></svg>
                            </div>
                            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wider">Độ pH Đất</h3>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className={`text-5xl font-extrabold ${getStatusColor(currentData?.ph || 0, 'ph')}`}>
                                    {currentData?.ph}
                                </span>
                                <span className="text-xl text-gray-500 font-medium">pH</span>
                            </div>
                            <div className="mt-4 text-sm text-gray-400 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                Mức độ: Trung tính
                            </div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-red-500 rounded-full"></span>
                                Biểu đồ Nhiệt độ (24h)
                            </h3>
                            <div className="h-64">
                                <SimpleLineChart data={history} dataKey="temperature" color="#EF4444" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                Biểu đồ Độ ẩm (24h)
                            </h3>
                            <div className="h-64">
                                <SimpleLineChart data={history} dataKey="humidity" color="#3B82F6" />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
