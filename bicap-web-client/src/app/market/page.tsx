'use client';

import { useState, useMemo } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { API_BASE } from '@/lib/api';
import { getProductIcon } from '@/lib/productIcons';
import {
  DEMO_FARMS,
  getProductsByFarmId,
  type ProductWithFarm,
} from '@/lib/demoMarketData';

const CATEGORIES = ['Tất cả', 'Rau củ', 'Trái cây', 'Củ quả'];

function matchesCategory(productName: string, category: string): boolean {
  if (category === 'Tất cả') return true;
  const n = productName.toLowerCase();
  if (category === 'Rau củ') {
    return /rau|cải|cà|đậu|bí|mướp|hành|ngò/.test(n);
  }
  if (category === 'Trái cây') {
    return /dưa|dâu|cam|chuối|xoài|bưởi|chôm|nấm/.test(n) || n.includes('ổi') || n.includes('nhãn');
  }
  if (category === 'Củ quả') {
    return /khoai|sắn|củ|tỏi|gừng|hành tây|ớt|bắp/.test(n);
  }
  return true;
}

export default function MarketPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedProduct, setSelectedProduct] = useState<ProductWithFarm | null>(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [buying, setBuying] = useState(false);

  // Dữ liệu 100% từ file demo - không gọi API khi load trang
  const filteredFarmsWithProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return DEMO_FARMS.map((farm) => {
      const products = getProductsByFarmId(farm.id).filter((p) => {
        const matchSearch =
          !search ||
          p.name.toLowerCase().includes(search) ||
          farm.name.toLowerCase().includes(search) ||
          farm.address.toLowerCase().includes(search);
        return matchSearch && matchesCategory(p.name, selectedCategory);
      });
      return { farm, products };
    }).filter(({ products }) => products.length > 0);
  }, [searchTerm, selectedCategory]);

  const handleBuyClick = (product: ProductWithFarm) => {
    if (!user) {
      if (confirm('Bạn cần đăng nhập để mua hàng. Đến trang đăng nhập?')) {
        router.push('/login');
      }
      return;
    }
    setSelectedProduct(product);
    setBuyQuantity(1);
    setShowModal(true);
  };

  const submitOrder = async () => {
    if (!selectedProduct) return;
    setBuying(true);
    try {
      if (auth) {
        const token = await auth.currentUser?.getIdToken();
        if (token) {
          await axios.post(
            `${API_BASE}/orders`,
            { productId: selectedProduct.id, quantity: buyQuantity },
            { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
          );
          alert('Đặt hàng thành công! Chủ trại sẽ liên hệ với bạn.');
          setShowModal(false);
          setBuying(false);
          return;
        }
      }
    } catch (_) {
      // Bỏ qua lỗi API - dùng chế độ demo
    }
    // Chế độ demo: luôn báo thành công để demo tính năng blockchain/đơn hàng
    alert(
      'Đơn hàng demo đã ghi nhận.\n\nBạn có thể xem đơn tại trang "Đơn hàng" khi đã kết nối backend. Tính năng blockchain sẽ ghi nhận giao dịch khi backend hoạt động.'
    );
    setShowModal(false);
    setBuying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 font-sans pb-32">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--green-dark)] via-[var(--green-fresh)] to-[var(--green-emerald)] text-white py-16 px-4 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <span className="absolute top-10 left-10 text-6xl opacity-30">🥬</span>
          <span className="absolute top-20 right-20 text-7xl opacity-30">🍅</span>
          <span className="absolute bottom-10 left-1/4 text-8xl opacity-30">🥕</span>
        </div>
        <Link
          href="/guest"
          className="absolute top-6 left-6 flex items-center gap-2 font-semibold z-10 bg-white/20 px-4 py-2 hover:bg-white/30 text-white border border-white rounded"
        >
          ← Quay lại
        </Link>
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-white">
            Chợ Nông Sản Sạch
          </h1>
          <p className="text-green-100 mb-6 max-w-2xl mx-auto">
            Kết nối trực tiếp từ Nông trại đến Bàn ăn. Minh bạch - An toàn - Chất lượng
          </p>
          <input
            type="text"
            placeholder="Tìm sản phẩm hoặc tên trang trại..."
            className="w-full max-w-xl mx-auto py-3 px-4 rounded border-2 border-white/30 bg-white/10 text-white placeholder-green-200 focus:bg-white/20 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Lọc danh mục */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 justify-center flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap border-2 transition-colors ${
                selectedCategory === cat
                  ? 'bg-[var(--green-dark)] text-white border-[var(--green-dark)]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[var(--green-fresh)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Danh sách theo từng Trang trại / Nông trại */}
        {filteredFarmsWithProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-gray-200">
            <p className="text-xl text-gray-600">Không tìm thấy sản phẩm nào phù hợp.</p>
            <p className="text-gray-500 mt-2">Thử đổi từ khóa hoặc danh mục.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredFarmsWithProducts.map(({ farm, products }) => (
              <section key={farm.id} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                {/* Tên trang trại / nông trại */}
                <div className="bg-[var(--beige-cream)] px-6 py-4 border-b-2 border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-2xl">🏠</span>
                    {farm.name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{farm.address}</p>
                  <span className="inline-block mt-2 text-xs font-semibold text-[var(--green-dark)] bg-white px-2 py-1 rounded border border-[var(--green-dark)]">
                    {farm.certification}
                  </span>
                </div>
                {/* Sản phẩm của trang trại */}
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="border-2 border-gray-200 rounded-lg overflow-hidden flex flex-col hover:border-[var(--green-fresh)] hover:shadow-md transition-all"
                    >
                      <div className="h-36 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center border-b border-gray-200">
                        <span className="text-6xl">{getProductIcon(product.name)}</span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                        <p className="text-[var(--green-dark)] font-extrabold text-lg mb-1">
                          {product.price.toLocaleString('vi-VN')}đ
                        </p>
                        <p className="text-xs text-gray-500 mb-3">Còn: {product.quantity} kg</p>
                        <button
                          onClick={() => handleBuyClick(product)}
                          disabled={product.quantity <= 0}
                          className="mt-auto w-full py-2 rounded-lg font-semibold bg-[var(--green-fresh)] text-white hover:bg-[var(--green-dark)] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          {product.quantity > 0 ? 'Đặt mua' : 'Hết hàng'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Giới thiệu ngắn */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[var(--beige-cream)] rounded-xl p-6 text-center border-2 border-gray-200">
            <span className="text-4xl block mb-2">🌾</span>
            <h3 className="font-bold text-gray-800 mb-1">Nông sản sạch</h3>
            <p className="text-sm text-gray-600">Tiêu chuẩn VietGAP, an toàn thực phẩm</p>
          </div>
          <div className="bg-[var(--beige-cream)] rounded-xl p-6 text-center border-2 border-gray-200">
            <span className="text-4xl block mb-2">📋</span>
            <h3 className="font-bold text-gray-800 mb-1">Truy xuất nguồn gốc</h3>
            <p className="text-sm text-gray-600">Quét mã QR xem quy trình canh tác</p>
          </div>
          <div className="bg-[var(--beige-cream)] rounded-xl p-6 text-center border-2 border-gray-200">
            <span className="text-4xl block mb-2">🚚</span>
            <h3 className="font-bold text-gray-800 mb-1">Giao hàng tận nơi</h3>
            <p className="text-sm text-gray-600">Vận chuyển chuyên nghiệp, tươi đến tay</p>
          </div>
        </div>
      </div>

      {/* Modal đặt hàng */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"
            >
              ✕
            </button>
            <div className="text-center mb-4">
              <span className="text-5xl block mb-2">{getProductIcon(selectedProduct.name)}</span>
              <h2 className="text-xl font-bold text-gray-800">Đặt mua nông sản</h2>
              <p className="font-semibold text-[var(--green-dark)] mt-1">{selectedProduct.name}</p>
              <p className="text-sm text-gray-500 mt-1">{selectedProduct.farm.name}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Số lượng (kg)</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBuyQuantity((q) => Math.max(1, q - 1))}
                  disabled={buyQuantity <= 1}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 font-bold disabled:opacity-50 hover:bg-gray-100"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={selectedProduct.quantity}
                  value={buyQuantity}
                  onChange={(e) =>
                    setBuyQuantity(
                      Math.max(1, Math.min(selectedProduct.quantity, Number(e.target.value) || 1))
                    )
                  }
                  className="flex-1 py-2 px-3 text-center border-2 border-gray-300 rounded-lg font-semibold"
                />
                <button
                  type="button"
                  onClick={() =>
                    setBuyQuantity((q) => Math.min(selectedProduct.quantity, q + 1))
                  }
                  disabled={buyQuantity >= selectedProduct.quantity}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 font-bold disabled:opacity-50 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Tối đa: {selectedProduct.quantity} kg</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 mb-6 flex justify-between items-center">
              <span className="font-semibold text-gray-700">Tổng thanh toán:</span>
              <span className="text-xl font-bold text-[var(--green-dark)]">
                {(selectedProduct.price * buyQuantity).toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={submitOrder}
                disabled={
                  buying ||
                  buyQuantity <= 0 ||
                  buyQuantity > selectedProduct.quantity
                }
                className="flex-1 py-3 rounded-lg font-semibold bg-[var(--green-fresh)] text-white hover:bg-[var(--green-dark)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {buying ? (
                  <>
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Xác nhận mua'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
