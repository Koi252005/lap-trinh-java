'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface ServicePackage {
    id: string;
    name: string;
    price: number;
    durationMonths: number;
    features: string[];
}

export default function ServicePage() {
    const [packages, setPackages] = useState<ServicePackage[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Fetch packages (public endpoint)
        axios.get('http://localhost:5001/api/subscriptions/packages')
            .then(res => setPackages(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleBuy = (pkgId: string) => {
        router.push(`/farm/services/payment?package=${pkgId}`);
    };

    if (loading) return <div className="p-8">Đang tải gói dịch vụ...</div>;

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">Gói Dịch Vụ Nông Nghiệp</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {packages.map((pkg) => (
                    <div key={pkg.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col">
                        <div className="p-8 flex-grow">
                            <h2 className="text-2xl font-bold text-center text-green-600 mb-4">{pkg.name}</h2>
                            <div className="text-center mb-6">
                                <span className="text-4xl font-extrabold text-gray-800 dark:text-white">
                                    {pkg.price.toLocaleString('vi-VN')}đ
                                </span>
                                <span className="text-gray-500"> / {pkg.durationMonths} tháng</span>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {pkg.features.map((feature, index) => (
                                    <li key={index} className="flex items-center text-gray-600 dark:text-gray-300">
                                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-8 pt-0 mt-auto">
                            <button
                                onClick={() => handleBuy(pkg.id)}
                                className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-colors duration-200 ${pkg.price === 0
                                        ? 'bg-gray-500 hover:bg-gray-600'
                                        : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'
                                    }`}
                            >
                                {pkg.price === 0 ? 'Đã bao gồm' : 'Đăng Ký Ngay'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
