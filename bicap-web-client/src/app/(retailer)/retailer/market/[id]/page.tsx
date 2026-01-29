'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';

interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
    farm: {
        name: string;
        address: string;
        certification: string;
        ownerId: number;
    };
    season: {
        id: number;
        name: string;
    } | null;
    batchCode: string;
    status: string;
    description?: string;
}

export default function ProductDetailPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams(); // Use useParams hook
    const id = params?.id; // Access id safely

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [buyQuantity, setBuyQuantity] = useState<number | ''>(1);
    const [buying, setBuying] = useState(false);

    useEffect(() => {
        if (!id) return; // Wait for id

        // ... existing logic ...
        // Since we don't have a direct getProductById public endpoint documented in plan, 
        // we might need to filter from list or check if getAllProducts returns detail or if there is /api/products/:id.
        // Assuming /api/products/:id exists or we filter.
        // Let's assume /api/products does NOT support /:id based on routes file I saw earlier (it only had getProductsByFarm).
        // Wait, route file had: `router.get('/', productController.getAllProducts);`
        // It did NOT have `router.get('/:id', ...)`
        // So I must fetch all and find, OR add the endpoint.
        // Fetching all is inefficient bit fine for now.
        // BUT, I should add the endpoint to backend for better practice if I can.
        // For now, to be safe and quick without backend restart if avoid, I'll fetch all.
        // Actually, user might have thousands. I should really add `getOne`.
        // But let's check `productController` first? No, I only checked routes.
        // Let's just fetch all and filter client side for now to minimize backend changes risk, 
        // or I can try to access logic if I add endpoint.
        // I will fetch all for now.

        axios.get('http://localhost:5001/api/products')
            .then(res => {
                const found = res.data.find((p: Product) => p.id === Number(id));
                setProduct(found || null);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [id]);

    const handleBuy = async () => {
        if (!user || user.role !== 'retailer') {
            alert('Chỉ tài khoản Nhà Bán Lẻ mới có thể đặt hàng.');
            return;
        }
        setBuying(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            await axios.post('http://localhost:5001/api/orders', {
                productId: product?.id,
                quantity: Number(buyQuantity),
                contractTerms: 'Mua qua sàn giao dịch' // Default terms
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Gửi yêu cầu đặt hàng thành công! Vui lòng chờ xác nhận.');
            router.push('/retailer/orders');
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
        } finally {
            setBuying(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!product) return <div className="p-8 text-center text-red-500">Sản phẩm không tồn tại.</div>;

    const totalPrice = product.price * (Number(buyQuantity) || 0);

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <Link href="/retailer/market" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Quay lại sàn</Link>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="md:flex">
                    <div className="md:w-1/2 bg-gray-200 dark:bg-gray-700 min-h-[300px] flex items-center justify-center p-8">
                        <span className="text-9xl">🌾</span>
                    </div>
                    <div className="p-8 md:w-1/2">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{product.name}</h1>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mb-4 inline-block">
                            {product.farm.certification}
                        </span>

                        <div className="space-y-4 mb-6 text-gray-600 dark:text-gray-300">
                            <p><strong className="text-gray-900 dark:text-white">Trang trại:</strong> {product.farm.name}</p>
                            <p><strong className="text-gray-900 dark:text-white">Địa chỉ:</strong> {product.farm.address}</p>
                            <p><strong className="text-gray-900 dark:text-white">Mã lô:</strong> {product.batchCode}</p>
                            <p><strong className="text-gray-900 dark:text-white">Tình trạng:</strong> {product.status}</p>
                            {product.season && (
                                <div>
                                    <strong className="text-gray-900 dark:text-white">Được trồng từ vụ mùa:</strong><br />
                                    <span className="text-green-600 font-medium">{product.season.name}</span>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-2xl font-bold text-green-600">{product.price.toLocaleString('vi-VN')} đ/kg</span>
                                <span className="text-sm">Sẵn có: {product.quantity} kg</span>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1 dark:text-white">Số lượng đặt mua (kg)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={product.quantity}
                                    value={buyQuantity}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setBuyQuantity(val === '' ? '' : Number(val));
                                    }}
                                    className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            <div className="flex items-center justify-between mb-6 bg-gray-50 dark:bg-gray-900 p-4 rounded">
                                <span className="font-semibold dark:text-white">Tổng tiền tạm tính:</span>
                                <span className="text-xl font-bold text-green-700">{totalPrice.toLocaleString('vi-VN')} đ</span>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleBuy}
                                    disabled={buying || product.quantity === 0 || Number(buyQuantity) <= 0}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                                >
                                    {buying ? 'Đang xử lý...' : 'Gửi Yêu Cầu Đặt Hàng'}
                                </button>

                                {product.season && (
                                    <Link
                                        href={`/traceability/${product.season.id}`}
                                        className="block w-full text-center border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 font-bold py-3 rounded-lg transition"
                                    >
                                        🔍 Quét QR / Truy xuất quy trình
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
