'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { API_BASE } from '@/lib/api';
import Link from 'next/link';

interface Product {
    id: number;
    name: string;
    batchCode: string;
    quantity: number;
    price: number;
    status: string;
    season: {
        name: string;
    } | null;
    txHash: string | null;
}

interface Season {
    id: number;
    name: string;
}

interface Farm {
    id: number;
    name: string;
}

export default function FarmProductManager() {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [farms, setFarms] = useState<Farm[]>([]);
    const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State - vụ mùa có thể chọn để đăng bán (cả đang diễn ra và đã kết thúc)
    const [selectableSeasons, setSelectableSeasons] = useState<Season[]>([]);
    const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [posting, setPosting] = useState(false);

    // 1. Fetch Farms
    useEffect(() => {
        if (user) fetchFarms();
    }, [user]);

    // 2. Fetch Products when Farm changes
    useEffect(() => {
        if (selectedFarmId) {
            fetchProducts(selectedFarmId);
            fetchSelectableSeasons(selectedFarmId);
        }
    }, [selectedFarmId]);

    const fetchFarms = async () => {
        try {
            const token = await auth?.currentUser?.getIdToken();
            const res = await axios.get(`${API_BASE}/farms/my-farms`, {
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

    const fetchProducts = async (farmId: number) => {
        setLoading(true);
        try {
            const token = await auth?.currentUser?.getIdToken();
            const res = await axios.get(`${API_BASE}/products/farm/${farmId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(res.data.products);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSelectableSeasons = async (farmId: number) => {
        try {
            const token = await auth?.currentUser?.getIdToken();
            const res = await axios.get(`${API_BASE}/seasons/farm/${farmId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Hiển thị cả vụ đang diễn ra (active) và đã kết thúc (completed) để chọn đăng bán
            const list = (res.data || []).filter((s: any) => s.status === 'active' || s.status === 'completed');
            setSelectableSeasons(list);
        } catch (error) {
            console.error(error);
        }
    };

    const handlePostProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        const farmId = selectedFarmId != null ? Number(selectedFarmId) : null;
        if (!farmId || !productName?.trim()) {
            alert('Vui lòng nhập tên sản phẩm và chọn trang trại.');
            return;
        }
        setPosting(true);
        try {
            const token = await auth?.currentUser?.getIdToken();
            await axios.post(`${API_BASE}/products`, {
                name: productName.trim(),
                seasonId: selectedSeasonId ? Number(selectedSeasonId) : null,
                farmId,
                price: Math.max(0, Number(price) || 0),
                quantity: Math.max(0, Number(quantity) || 0),
                batchCode: `BATCH-${Date.now()}`,
            }, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });

            setShowModal(false);
            setProductName('');
            setPrice('');
            setQuantity('');
            setSelectedSeasonId('');
            fetchProducts(farmId);
            alert('Đăng bán thành công!');
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || error.response?.data?.error || 'Lỗi đăng bán';
            alert(msg);
        } finally {
            setPosting(false);
        }
    };

    if (loading && farms.length === 0) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Quản Lý Nông Sản</h1>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow"
                >
                    + Đăng Bán Sản Phẩm
                </button>
            </div>

            {/* Farm Selector if multiple */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length === 0 ? (
                    <p className="text-gray-500 col-span-3 text-center py-10 bg-white rounded shadow">Chưa có sản phẩm nào được đăng bán.</p>
                ) : (
                    products.map(product => (
                        <div key={product.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700 relative">
                            <span className="absolute top-4 right-4 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">
                                {product.status === 'available' ? 'Đang bán' : product.status}
                            </span>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{product.name}</h3>
                            
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300 mb-4">
                                <p>📦 Số lượng: <span className="font-semibold">{product.quantity} kg</span></p>
                                <p>💰 Giá bán: <span className="font-semibold text-green-600">{product.price.toLocaleString('vi-VN')} đ/kg</span></p>
                                <p>🌾 Vụ mùa: {product.season ? product.season.name : 'Không xác định'}</p>
                                <p className="font-mono text-xs text-gray-400 truncate" title={product.batchCode}>Mã lô: {product.batchCode}</p>
                            </div>

                            {product.txHash && (
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <p className="text-xs text-blue-500 truncate" title={product.txHash}>Blockchain: {product.txHash}</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Đăng Bán Nông Sản</h2>
                        <form onSubmit={handlePostProduct} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Chọn Vụ Mùa</label>
                                <select 
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                                    required
                                    value={selectedSeasonId}
                                    onChange={e => setSelectedSeasonId(e.target.value)}
                                >
                                    <option value="">-- Chọn vụ mùa --</option>
                                    {selectableSeasons.map((s: any) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} {s.status === 'active' ? '(Đang diễn ra)' : '(Đã kết thúc)'}
                                        </option>
                                    ))}
                                </select>
                                {selectableSeasons.length === 0 && <p className="text-xs text-amber-600 mt-1">Chưa có vụ mùa nào. Hãy tạo vụ mùa tại Mùa vụ trước.</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tên Sản Phẩm</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                                    value={productName}
                                    onChange={e => setProductName(e.target.value)}
                                    placeholder="VD: Gạo ST25 Hữu Cơ"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Số lượng (kg)</label>
                                    <input 
                                        type="number" 
                                        required 
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                                        value={quantity}
                                        onChange={e => setQuantity(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Giá (VND/kg)</label>
                                    <input 
                                        type="number" 
                                        required 
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                                        value={price}
                                        onChange={e => setPrice(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={posting}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                    {posting ? 'Đang đăng...' : 'Đăng Bán'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}