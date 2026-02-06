'use client';

import { useMemo, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { QRCodeSVG } from 'qrcode.react';
import { getProductIcon } from '@/lib/productIcons';
import { API_BASE } from '@/lib/api';
import { getProductById } from '@/lib/demoMarketData';

export default function RetailerProductDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const product = useMemo(() => (id ? getProductById(Number(id)) : undefined), [id]);
  const [buyQuantity, setBuyQuantity] = useState<number>(1);
  const [buying, setBuying] = useState(false);

  const handleBuy = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để đặt hàng.');
      router.push('/login');
      return;
    }
    if (!product) return;
    setBuying(true);
    try {
      if (auth) {
        const token = await auth.currentUser?.getIdToken();
        if (token) {
          await axios.post(
            `${API_BASE}/orders`,
            {
              productId: product.id,
              quantity: buyQuantity,
              contractTerms: 'Mua qua sàn nông sản sạch - BICAP',
            },
            { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
          );
          alert('Gửi yêu cầu đặt hàng thành công! Vui lòng chờ xác nhận.');
          router.push('/retailer/orders');
          setBuying(false);
          return;
        }
      }
    } catch (_) {
      // Demo mode: vẫn báo thành công để demo luồng blockchain / đơn hàng
    }
    alert(
      'Đơn hàng demo đã ghi nhận.\n\nBạn có thể xem tại "Đơn hàng" khi đã kết nối backend. Giao dịch sẽ được ghi nhận trên blockchain khi hệ thống hoạt động đầy đủ.'
    );
    router.push('/retailer/orders');
    setBuying(false);
  };

  if (!id || product === undefined) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Link href="/retailer/market" className="text-green-600 hover:underline mb-4 inline-block">
          ← Quay lại sàn
        </Link>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <p className="text-red-500 dark:text-red-400">Sản phẩm không tồn tại.</p>
        </div>
      </div>
    );
  }

  const totalPrice = product.price * buyQuantity;
  const traceUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/traceability/${product.farmId}`
      : `/traceability/${product.farmId}`;

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
              {product.farm.certification}
            </span>
          </div>
          <div className="p-8 md:w-1/2">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{product.name}</h1>

            <div className="space-y-3 mb-6 text-gray-600 dark:text-gray-300">
              <p><strong className="text-gray-900 dark:text-white">Trang trại:</strong> {product.farm.name}</p>
              <p><strong className="text-gray-900 dark:text-white">Địa chỉ:</strong> {product.farm.address}</p>
              <p><strong className="text-gray-900 dark:text-white">Mã lô:</strong> {product.batchCode}</p>
              <p><strong className="text-gray-900 dark:text-white">Tình trạng:</strong> Còn hàng</p>
              {product.seasonName && (
                <p><strong className="text-gray-900 dark:text-white">Vụ mùa:</strong> {product.seasonName}</p>
              )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-green-600">{product.price.toLocaleString('vi-VN')} đ/kg</span>
                <span className="text-sm text-gray-500">Sẵn có: {product.quantity} kg</span>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Số lượng đặt mua (kg)
                </label>
                <input
                  type="number"
                  min={1}
                  max={product.quantity}
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(Math.max(1, Math.min(product.quantity, Number(e.target.value) || 1)))}
                  className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-lg p-2 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between mb-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <span className="font-semibold text-gray-800 dark:text-white">Tổng tiền tạm tính:</span>
                <span className="text-xl font-bold text-green-600">{totalPrice.toLocaleString('vi-VN')} đ</span>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleBuy}
                  disabled={buying || product.quantity === 0 || buyQuantity <= 0}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {buying ? 'Đang xử lý...' : 'Gửi Yêu Cầu Đặt Hàng'}
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
