'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
    farm: {
        name: string;
        address: string;
        certification: string;
    };
    season: {
        name: string;
    } | null;
    batchCode: string;
}

export default function RetailerMarketPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            setLoading(true);
            axios.get(`http://localhost:5001/api/products${search ? `?search=${search}` : ''}`)
                .then(res => setProducts(res.data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [search]);

    const handleBuyClick = (product: Product) => {
        // Navigate to the detail page for functionality
        router.push(`/retailer/market/${product.id}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-green-600 to-green-800 text-white py-12 px-4 text-center rounded-b-[3rem] shadow-lg mb-8 overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight drop-shadow-md">
                        Sàn Nông Sản Sạch
                    </h1>
                    <p className="text-green-100 max-w-2xl mx-auto text-lg mb-8 font-light">
                        Kết nối trực tiếp Nhà bán lẻ với các Nông trại uy tín hàng đầu.
                        <br />Nguồn hàng minh bạch, chất lượng đảm bảo.
                    </p>

                    <div className="max-w-xl mx-auto relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-6 w-6 text-green-600/50 group-focus-within:text-green-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm, trang trại..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-20 py-4 rounded-full bg-white/95 backdrop-blur-sm border-2 border-white/20 focus:border-green-400 focus:bg-white focus:ring-4 focus:ring-green-400/30 text-green-900 shadow-xl placeholder-green-700/50 text-lg transition-all"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-16 top-1/2 -translate-y-1/2 text-green-700/50 hover:text-green-700 transition-colors"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                        <button
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all hover:scale-105 active:scale-95"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-96 h-96 bg-green-400/20 rounded-full blur-3xl"></div>
            </div>

            {/* Product List */}
            <div className="container mx-auto p-4">
                {loading ? (
                    <div className="text-center py-10">Đang tải sản phẩm...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map(product => (
                            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition hover:-translate-y-1">
                                <div
                                    className="h-48 bg-gray-200 flex items-center justify-center relative cursor-pointer"
                                    onClick={() => handleBuyClick(product)}
                                >
                                    <span className="text-4xl">🌾</span>
                                    {/* Badge for certification */}
                                    <span className="absolute top-2 right-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full shadow-sm font-medium">
                                        {product.farm.certification}
                                    </span>
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3
                                            className="text-lg font-bold text-gray-800 dark:text-white truncate cursor-pointer hover:text-green-600"
                                            title={product.name}
                                            onClick={() => handleBuyClick(product)}
                                        >
                                            {product.name}
                                        </h3>
                                    </div>
                                    <p className="text-gray-500 text-sm mb-4 truncate" title={product.farm.address}>
                                        🏠 {product.farm.name}
                                    </p>

                                    <div className="flex justify-between items-center mb-4 bg-gray-50 p-2 rounded-lg">
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-semibold">Giá bán</p>
                                            <p className="text-lg font-bold text-green-600">{product.price.toLocaleString('vi-VN')} đ/kg</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 uppercase font-semibold">Còn lại</p>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{product.quantity} kg</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2">
                                        <button
                                            onClick={() => handleBuyClick(product)}
                                            disabled={product.quantity === 0}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                                        >
                                            {product.quantity === 0 ? 'Hết hàng' : 'Xem Chi Tiết & Đặt Mua'}
                                        </button>

                                        {product.season && (
                                            <Link href={`/traceability/${(product as any).seasonId || '#'}`} className="text-xs text-blue-500 hover:underline flex items-center justify-center gap-1 py-1">
                                                🔍 Truy xuất nguồn gốc
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
