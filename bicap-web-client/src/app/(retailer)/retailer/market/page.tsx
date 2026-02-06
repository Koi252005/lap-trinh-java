'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProductIcon } from '@/lib/productIcons';
import { API_BASE } from '@/lib/api';

function SeedProductsEmpty() {
  const [seeding, setSeeding] = useState(false);
  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await axios.post(`${API_BASE}/seed`, {}, { validateStatus: () => true });
      if (res.status === 200) {
        alert(`Đã tạo ${res.data?.totalAvailable || 0} sản phẩm! Tải lại trang.`);
        window.location.reload();
      } else {
        alert(res.data?.message || res.data?.error || 'Lỗi. Kiểm tra backend và DB.');
      }
    } catch (e: any) {
      alert(e.response?.data?.error || e.message || 'Lỗi kết nối backend');
    } finally {
      setSeeding(false);
    }
  };
  return (
    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <p className="text-gray-600 dark:text-gray-300 mb-4">Chưa có sản phẩm nào.</p>
      <button
        onClick={handleSeed}
        disabled={seeding}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
      >
        {seeding ? 'Đang tạo...' : '🌱 Tạo sản phẩm mẫu'}
      </button>
      <p className="text-sm text-gray-500 mt-4">Hoặc chạy: cd bicap-backend && npm run seed</p>
    </div>
  );
}

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  batchCode?: string;
  farm?: { id: number; name: string; address: string; certification: string };
  season?: { name: string } | null;
}

const CATEGORIES = ['Tất cả', 'Rau củ', 'Trái cây', 'Củ quả'];

function matchesCategory(name: string, category: string): boolean {
  if (category === 'Tất cả') return true;
  const n = name.toLowerCase();
  if (category === 'Rau củ') return /rau|cải|cà|đậu|bí|mướp|hành|ngò/.test(n);
  if (category === 'Trái cây') return /dưa|dâu|cam|chuối|xoài|bưởi|chôm|nấm/.test(n) || n.includes('ổi') || n.includes('nhãn');
  if (category === 'Củ quả') return /khoai|sắn|củ|tỏi|gừng|hành tây|ớt|bắp/.test(n);
  return true;
}

export default function RetailerMarketPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  useEffect(() => {
    axios
      .get<{ products: Product[]; needsSeed?: boolean }>(`${API_BASE}/public/products`, { params: { limit: 100 }, validateStatus: () => true })
      .then((res) => {
        if (res.status === 200 && Array.isArray(res.data?.products)) {
          setProducts(res.data.products);
        } else {
          setProducts([]);
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch = !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.farm?.name || '').toLowerCase().includes(search.toLowerCase());
    return matchSearch && matchesCategory(p.name, selectedCategory);
  });

  const byFarm = filtered.reduce<Record<string, { farm: Product['farm']; products: Product[] }>>((acc, p) => {
    const key = p.farm?.name || 'Khác';
    if (!acc[key]) acc[key] = { farm: p.farm, products: [] };
    acc[key].products.push(p);
    return acc;
  }, {});

  const handleBuyClick = (product: Product) => {
    router.push(`/retailer/market/${product.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500">Đang tải sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="relative bg-gradient-to-r from-green-600 to-green-800 text-white py-12 px-4 text-center rounded-b-[3rem] shadow-lg mb-8 overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight drop-shadow-md">
            Sàn Nông Sản Sạch
          </h1>
          <p className="text-green-100 max-w-2xl mx-auto text-lg mb-8 font-light">
            Kết nối trực tiếp Nhà bán lẻ với các Nông trại uy tín. Nguồn hàng minh bạch, chất lượng đảm bảo.
          </p>
          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="Tìm sản phẩm, trang trại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-4 py-3 rounded-full bg-white/95 text-gray-900 placeholder-gray-500 border-0 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 justify-center flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap border-2 transition-colors ${
                selectedCategory === cat
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <SeedProductsEmpty />
        ) : (
          <div className="space-y-10">
            {Object.entries(byFarm).map(([farmName, { farm, products: farmProducts }]) => (
              <section
                key={farmName}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                <div className="bg-green-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <span className="text-2xl">🏠</span> {farm?.name || farmName}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{farm?.address || ''}</p>
                  <span className="inline-block mt-2 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded">
                    {farm?.certification || 'VietGAP'}
                  </span>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {farmProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden flex flex-col hover:shadow-xl hover:border-green-400 transition-all bg-white dark:bg-gray-800"
                    >
                      <div
                        className="relative h-40 bg-gray-100 dark:bg-gray-700 flex items-center justify-center cursor-pointer"
                        onClick={() => handleBuyClick(product)}
                      >
                        <span className="text-5xl">{getProductIcon(product.name)}</span>
                        <span className="absolute top-2 right-2 text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-1 rounded-full font-medium">
                          {farm?.certification || 'VietGAP'}
                        </span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3
                          className="text-lg font-bold text-gray-800 dark:text-white line-clamp-2 cursor-pointer hover:text-green-600"
                          onClick={() => handleBuyClick(product)}
                        >
                          {product.name}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2 mt-1">
                          🏠 {farm?.name || farmName}
                        </p>
                        <div className="flex justify-between items-center mb-4 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">Giá</p>
                            <p className="text-lg font-bold text-green-600">{product.price?.toLocaleString('vi-VN')} đ/kg</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Còn</p>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{product.quantity ?? 0} kg</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleBuyClick(product)}
                          disabled={(product.quantity ?? 0) === 0}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {(product.quantity ?? 0) === 0 ? 'Hết hàng' : 'Xem Chi Tiết & Đặt Mua'}
                        </button>
                        <Link
                          href={`/traceability/product/${product.id}`}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1 py-2 mt-1"
                        >
                          🔍 Truy xuất nguồn gốc
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
