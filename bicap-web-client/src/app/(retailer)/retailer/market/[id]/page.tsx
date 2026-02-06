'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { QRCodeSVG } from 'qrcode.react';
import { getProductIcon } from '@/lib/productIcons';
import { API_BASE } from '@/lib/api';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  batchCode?: string;
  farm?: { id: number; name: string; address: string; certification: string };
  season?: { name: string } | null;
  isSample?: boolean;
}

export default function RetailerProductDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyQuantity, setBuyQuantity] = useState<number>(1);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    axios
      .get<{ product: Product }>(`${API_BASE}/public/products/${id}`, { validateStatus: () => true })
      .then((res) => {
        if (res.status === 200 && res.data?.product) {
          setProduct({ ...res.data.product, isSample: !!res.data.isSample });
        } else {
          setProduct(null);
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBuy = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để đặt hàng.');
      router.push('/login');
      return;
    }
    if (!product) return;
    setBuying(true);
    try {
      const token = await auth?.currentUser?.getIdToken();
      if (!token) {
        alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        setBuying(false);
        return;
      }
      const res = await axios.post(
        `${API_BASE}/orders`,
        {
          productId: Number(product.id),
          quantity: Number(buyQuantity) || 1,
          contractTerms: 'Mua qua sàn nông sản sạch - BICAP',
        },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 10000, validateStatus: () => true }
      );
      if (res.status === 201 || res.status === 200) {
        alert('Gửi yêu cầu đặt hàng thành công! Vui lòng chờ xác nhận.');
        router.push('/retailer/orders');
      } else {
        const msg = res.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại.';
        if (res.data?.needsSeed || msg.includes('không tồn tại')) {
          alert(msg + '\n\nVào trang Sàn → bấm "Tạo sản phẩm mẫu" rồi thử đặt hàng lại.');
          router.push('/retailer/market');
        } else {
          alert(msg);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi kết nối. Kiểm tra backend và database.');
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Link href="/retailer/market" className="text-green-600 hover:underline mb-4 inline-block">← Quay lại sàn</Link>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-500">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!id || !product) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Link href="/retailer/market" className="text-green-600 hover:underline mb-4 inline-block">← Quay lại sàn</Link>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <p className="text-red-500">Sản phẩm không tồn tại.</p>
        </div>
      </div>
    );
  }

  const totalPrice = product.price * buyQuantity;
  const traceUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/traceability/product/${product.id}`
      : `/traceability/product/${product.id}`;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Link href="/retailer/market" className="text-green-600 dark:text-green-400 hover:underline mb-4 inline-block">
        ← Quay lại sàn
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="md:flex">
          <div className="md:w-1/2 bg-gray-100 dark:bg-gray-700 min-h-[280px] flex flex-col items-center justify-center p-8">
            <span className="text-8xl mb-4">{getProductIcon(product.name)}</span>
            <span className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
              {product.farm?.certification || 'VietGAP'}
            </span>
          </div>
          <div className="p-8 md:w-1/2">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{product.name}</h1>

            <div className="space-y-3 mb-6 text-gray-600 dark:text-gray-300">
              <p><strong className="text-gray-900 dark:text-white">Trang trại:</strong> {product.farm?.name || '—'}</p>
              <p><strong className="text-gray-900 dark:text-white">Địa chỉ:</strong> {product.farm?.address || '—'}</p>
              <p><strong className="text-gray-900 dark:text-white">Mã lô:</strong> {product.batchCode || '—'}</p>
              <p><strong className="text-gray-900 dark:text-white">Tình trạng:</strong> Còn hàng</p>
              {product.season?.name && (
                <p><strong className="text-gray-900 dark:text-white">Vụ mùa:</strong> {product.season.name}</p>
              )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-green-600">{product.price.toLocaleString('vi-VN')} đ/kg</span>
                <span className="text-sm text-gray-500">Sẵn có: {product.quantity ?? 0} kg</span>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Số lượng đặt mua (kg)
                </label>
                <input
                  type="number"
                  min={1}
                  max={product.quantity ?? 0}
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(Math.max(1, Math.min(product.quantity ?? 0, Number(e.target.value) || 1)))}
                  className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-lg p-2 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between mb-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <span className="font-semibold text-gray-800 dark:text-white">Tổng tiền tạm tính:</span>
                <span className="text-xl font-bold text-green-600">{totalPrice.toLocaleString('vi-VN')} đ</span>
              </div>

              <div className="space-y-3">
                {product.isSample && (
                  <p className="text-amber-600 dark:text-amber-400 text-sm mb-3">
                    ⚠️ Sản phẩm mẫu (DB chưa kết nối). Chạy: cd bicap-backend && node scripts/addSampleProducts.js
                  </p>
                )}
                <button
                  onClick={handleBuy}
                  disabled={buying || product.isSample || (product.quantity ?? 0) === 0 || buyQuantity <= 0}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {buying ? 'Đang xử lý...' : product.isSample ? 'Không thể đặt (sản phẩm mẫu)' : 'Gửi Yêu Cầu Đặt Hàng'}
                </button>

                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    🔍 Truy xuất nguồn gốc / Mã QR
                  </p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="bg-white p-2 rounded-lg inline-block">
                      <QRCodeSVG value={traceUrl} size={120} level="M" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Quét mã để mở trang truy xuất nguồn gốc (blockchain).
                      </p>
                      <Link
                        href={traceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                      >
                        {traceUrl}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
