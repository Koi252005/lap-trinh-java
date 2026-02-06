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

function tryGetStoredProduct(id: number): Product | null {
  if (typeof window === 'undefined' || !id || id < 1) return null;
  try {
    const raw = sessionStorage.getItem('bicap_selected_product');
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (p && Number(p.id) === id) return p as Product;
  } catch (_) {}
  return null;
}

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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const idNum = Number(id);
    axios
      .get<{ product: Product }>(`${API_BASE}/public/products/${id}`, { validateStatus: () => true })
      .then((res) => {
        if (res.status === 200 && res.data?.product) {
          setProduct({ ...res.data.product, isSample: !!res.data.isSample });
          return;
        }
        const stored = tryGetStoredProduct(idNum);
        if (stored) setProduct(stored);
        else setProduct(null);
      })
      .catch(() => {
        const stored = tryGetStoredProduct(idNum);
        if (stored) setProduct(stored);
        else setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleBuy = async () => {
    setMessage(null);
    if (!user) {
      setMessage({ type: 'error', text: 'Vui lòng đăng nhập để đặt hàng.' });
      router.push('/login');
      return;
    }
    if (!product) {
      setMessage({ type: 'error', text: 'Không có thông tin sản phẩm.' });
      return;
    }
    setBuying(true);
    try {
      const token = await auth?.currentUser?.getIdToken?.();
      if (!token) {
        setMessage({ type: 'error', text: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' });
        setBuying(false);
        return;
      }
      const payload = {
        productId: Number(product.id),
        quantity: Math.max(1, Number(buyQuantity) || 1),
        contractTerms: 'Mua qua sàn nông sản sạch - BICAP',
      };
      console.log('[Order] Sending:', payload);
      const url = `${API_BASE}/orders`;
      const res = await axios.post(
        url,
        payload,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, timeout: 20000, validateStatus: () => true }
      );
      console.log('[Order] Response:', res.status, res.data);
      if (res.status === 201 || res.status === 200) {
        setMessage({ type: 'success', text: 'Gửi yêu cầu đặt hàng thành công! Đang chuyển...' });
        setTimeout(() => router.push('/retailer/orders'), 800);
        return;
      }
      const data = res.data || {};
      let text = data.message || data.error || `Đặt hàng thất bại (${res.status}). Vui lòng thử lại.`;
      if (data.error && data.message !== data.error) text += '\n' + data.error;
      if (data.code === 'USER_SYNC' || text.includes('đăng xuất')) text += '\n\nGợi ý: Đăng xuất rồi đăng nhập lại, sau đó thử đặt hàng.';
      setMessage({ type: 'error', text });
      if (data.needsSeed || text.includes('không tồn tại')) {
        setTimeout(() => router.push('/retailer/market'), 2500);
      }
    } catch (err: any) {
      console.error('[Order] Error:', err);
      const data = err.response?.data;
      const msg = data?.message || data?.error || err.message || 'Lỗi kết nối. Kiểm tra backend đang chạy và CORS.';
      const extra = (data?.message && data?.error && data.message !== data.error) ? `\n${data.error}` : '';
      setMessage({ type: 'error', text: msg + extra });
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
          <p className="text-red-500 dark:text-red-400 font-medium">Sản phẩm không tồn tại hoặc đã hết.</p>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">Vui lòng quay lại Sàn và bấm &quot;Tạo sản phẩm mẫu&quot; nếu chưa có sản phẩm.</p>
          <Link href="/retailer/market" className="inline-block mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">Về trang Sàn</Link>
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
                {message && (
                  <div
                    className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'}`}
                  >
                    {message.text}
                  </div>
                )}
                {product.isSample && (
                  <p className="text-amber-600 dark:text-amber-400 text-sm mb-3">
                    ⚠️ Sản phẩm mẫu (DB chưa kết nối). Chạy: cd bicap-backend && node scripts/addSampleProducts.js
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => handleBuy()}
                  disabled={buying || product.isSample || (Number(product.quantity) || 0) < 1 || (Number(buyQuantity) || 0) < 1}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {buying ? 'Đang xử lý...' : product.isSample ? 'Không thể đặt (sản phẩm mẫu)' : 'Gửi Yêu Cầu Đặt Hàng'}
                </button>
                {(Number(product.quantity) || 0) < 1 && !product.isSample && (
                  <p className="text-sm text-amber-600">Sản phẩm tạm hết hàng. Vui lòng chọn sản phẩm khác.</p>
                )}

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
