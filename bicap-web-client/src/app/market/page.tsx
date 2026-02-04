'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { API_BASE } from '@/lib/api';

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

// Hàm lấy icon tự động - Sắp xếp chính xác hơn với nhiều loại rau củ
const getProductIcon = (name: string) => {
    const n = name.toLowerCase().trim();
    
    // === TRÁI CÂY ===
    if (n.includes('dâu tây') || n.includes('dâu tây')) return '🍓';
    if (n.includes('dưa hấu')) return '🍉';
    if (n.includes('dưa chuột') || n.includes('dưa leo')) return '🥒';
    if (n.includes('dưa lưới') || n.includes('dưa vàng')) return '🍈';
    if (n.includes('dưa') || n.includes('melon')) return '🍈';
    if (n.includes('cam')) return '🍊';
    if (n.includes('chanh')) return '🍋';
    if (n.includes('táo')) return '🍎';
    if (n.includes('chuối')) return '🍌';
    if (n.includes('nho')) return '🍇';
    if (n.includes('xoài')) return '🥭';
    if (n.includes('đào')) return '🍑';
    if (n.includes('lê')) return '🍐';
    if (n.includes('dứa') || n.includes('thơm')) return '🍍';
    if (n.includes('dừa')) return '🥥';
    if (n.includes('kiwi')) return '🥝';
    if (n.includes('cherry') || n.includes('anh đào')) return '🍒';
    
    // === RAU XANH ===
    if (n.includes('xà lách') || n.includes('rau diếp')) return '🥬';
    if (n.includes('rau muống')) return '🥬';
    if (n.includes('rau cải') || n.includes('cải bẹ')) return '🥬';
    if (n.includes('cải thảo')) return '🥬';
    if (n.includes('cải ngọt')) return '🥬';
    if (n.includes('cải xoong')) return '🥬';
    if (n.includes('cải thìa')) return '🥬';
    if (n.includes('cải bắp') || n.includes('bắp cải')) return '🥬';
    if (n.includes('rau cần')) return '🥬';
    if (n.includes('rau ngót')) return '🥬';
    if (n.includes('rau đay')) return '🥬';
    if (n.includes('rau mồng tơi')) return '🥬';
    if (n.includes('rau dền')) return '🥬';
    if (n.includes('rau lang')) return '🥬';
    if (n.includes('rau má')) return '🌿';
    if (n.includes('rau thơm') || n.includes('rau mùi')) return '🌿';
    if (n.includes('húng') || n.includes('basil')) return '🌿';
    if (n.includes('rau') || n.includes('cải')) return '🥬';
    
    // === CỦ QUẢ ===
    if (n.includes('cà chua')) return '🍅';
    if (n.includes('cà tím') || n.includes('cà pháo')) return '🍆';
    if (n.includes('cà rốt')) return '🥕';
    if (n.includes('khoai tây')) return '🥔';
    if (n.includes('khoai lang')) return '🍠';
    if (n.includes('khoai môn')) return '🍠';
    if (n.includes('khoai sọ')) return '🍠';
    if (n.includes('khoai')) return '🥔';
    if (n.includes('củ cải')) return '🥕';
    if (n.includes('củ dền')) return '🥕';
    if (n.includes('củ cà rốt')) return '🥕';
    if (n.includes('hành tây')) return '🧅';
    if (n.includes('hành lá') || n.includes('hành ta')) return '🧅';
    if (n.includes('hành')) return '🧅';
    if (n.includes('tỏi')) return '🧄';
    if (n.includes('gừng')) return '🫚';
    if (n.includes('ớt')) return '🌶️';
    if (n.includes('ớt chuông') || n.includes('ớt ngọt')) return '🫑';
    
    // === BẮP VÀ NGÔ ===
    if (n.includes('bắp') || n.includes('ngô')) return '🌽';
    if (n.includes('corn')) return '🌽';
    
    // === NẤM ===
    if (n.includes('nấm')) return '🍄';
    if (n.includes('mushroom')) return '🍄';
    
    // === BÔNG CẢI ===
    if (n.includes('bông cải') || n.includes('súp lơ')) return '🥦';
    if (n.includes('broccoli')) return '🥦';
    if (n.includes('cauliflower')) return '🥦';
    
    // === ĐẬU VÀ HẠT ===
    if (n.includes('đậu phụ') || n.includes('đậu hũ')) return '🫘';
    if (n.includes('đậu xanh')) return '🫘';
    if (n.includes('đậu đỏ')) return '🫘';
    if (n.includes('đậu đen')) return '🫘';
    if (n.includes('đậu nành')) return '🫘';
    if (n.includes('đậu')) return '🫘';
    if (n.includes('đậu phộng') || n.includes('lạc')) return '🥜';
    
    // === LÚA GẠO ===
    if (n.includes('gạo') || n.includes('lúa')) return '🍚';
    if (n.includes('rice')) return '🍚';
    if (n.includes('lúa mì') || n.includes('wheat')) return '🌾';
    
    // === BƠ VÀ DẦU ===
    if (n.includes('bơ')) return '🥑';
    if (n.includes('avocado')) return '🥑';
    
    // === SALAD VÀ MIX ===
    if (n.includes('salad') || n.includes('xà lách trộn')) return '🥗';
    
    // === CÁC LOẠI KHÁC ===
    if (n.includes('bí đỏ') || n.includes('bí ngô')) return '🎃';
    if (n.includes('bí xanh') || n.includes('bí đao')) return '🥒';
    if (n.includes('bí')) return '🎃';
    if (n.includes('mướp')) return '🥒';
    if (n.includes('khổ qua') || n.includes('mướp đắng')) return '🥒';
    if (n.includes('đậu bắp') || n.includes('okra')) return '🥒';
    if (n.includes('cà phê')) return '☕';
    if (n.includes('chè') || n.includes('trà')) return '🍵';
    
    // Mặc định
    return '🌾';
};

export default function MarketplacePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [buyQuantity, setBuyQuantity] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [buying, setBuying] = useState(false);

    useEffect(() => {
        axios.get(`${API_BASE}/public/products`)
            .then(res => {
                // API trả về { products: [...], pagination: {...} }
                if (res.data && res.data.products) {
                    setProducts(res.data.products);
                } else if (Array.isArray(res.data)) {
                    // Fallback nếu API trả về array trực tiếp
                    setProducts(res.data);
                } else {
                    console.warn('Unexpected API response format:', res.data);
                    setProducts([]);
                }
            })
            .catch(err => {
                console.error('Error fetching products:', err);
                setProducts([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              p.farm.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchesCategory = true;
        const productName = p.name.toLowerCase();
        
        if (selectedCategory === 'Rau củ') {
            matchesCategory = productName.includes('rau') || 
                             productName.includes('cải') || 
                             productName.includes('cà') ||
                             productName.includes('đậu') ||
                             productName.includes('bí') ||
                             productName.includes('mướp') ||
                             productName.includes('hành') ||
                             productName.includes('ngò');
        }
        if (selectedCategory === 'Trái cây') {
            matchesCategory = productName.includes('dưa') || 
                             productName.includes('dâu') || 
                             productName.includes('cam') ||
                             productName.includes('chuối') ||
                             productName.includes('xoài') ||
                             productName.includes('ổi') ||
                             productName.includes('thanh long') ||
                             productName.includes('bưởi') ||
                             productName.includes('dứa') ||
                             productName.includes('sầu riêng') ||
                             productName.includes('nhãn') ||
                             productName.includes('chôm chôm') ||
                             productName.includes('bơ');
        }
        if (selectedCategory === 'Củ quả') {
            matchesCategory = productName.includes('khoai') || 
                             productName.includes('sắn') ||
                             productName.includes('củ') ||
                             productName.includes('tỏi') ||
                             productName.includes('gừng') ||
                             productName.includes('nghệ') ||
                             productName.includes('hành tây');
        }

        return matchesSearch && matchesCategory;
    });

    const handleBuyClick = (product: Product) => {
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
            const token = await auth.currentUser?.getIdToken();
            await axios.post(`${API_BASE}/orders`, {
                productId: selectedProduct.id,
                quantity: buyQuantity
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Đặt hàng thành công! Chủ trại sẽ liên hệ với bạn.');
            setShowModal(false);
            const res = await axios.get(`${API_BASE}/products`);
            setProducts(res.data);

        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
        } finally {
            setBuying(false);
        }
    };

    const categories = ["Tất cả", "Rau củ", "Trái cây", "Củ quả"];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 font-sans pb-32">
            
            {/* HEADER BANNER – pixel theme */}
            <div className="pixel-nav bg-gradient-to-r from-[var(--green-dark)] via-[var(--green-fresh)] to-[var(--green-emerald)] text-white py-20 px-4 mb-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-10 left-10 text-6xl opacity-30">🥬</div>
                    <div className="absolute top-20 right-20 text-7xl opacity-30">🍅</div>
                    <div className="absolute bottom-10 left-1/4 text-8xl opacity-30">🥕</div>
                    <div className="absolute bottom-20 right-1/3 text-6xl opacity-30">🌽</div>
                </div>

                <Link href="/guest" className="pixel-btn absolute top-6 left-6 flex items-center gap-2 font-semibold z-10 bg-white/20 px-4 py-2 hover:bg-white/30 transition-colors text-white border-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Quay lại</span>
                </Link>

                <div className="container mx-auto text-center relative z-10">
                    <div className="pixel-badge inline-block mb-6 px-6 py-3 bg-white/20 border-white text-white">
                        <span className="text-base font-bold flex items-center gap-2">
                            <span className="pixel-icon w-8 h-8 text-lg flex items-center justify-center bg-white/30">🏪</span>
                            Chợ Nông Sản
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-white drop-shadow-lg">
                        <span className="block">Chợ Nông Sản Sạch</span>
                        <span className="block text-2xl md:text-3xl mt-2 text-green-100">BICAP</span>
                    </h1>
                    <p className="text-green-50 mb-12 text-xl max-w-3xl mx-auto font-medium">
                        Kết nối trực tiếp từ <span className="font-bold">Nông trại</span> đến <span className="font-bold">Bàn ăn</span>. Minh bạch - An toàn - Chất lượng
                    </p>
                    
                    <div className="max-w-3xl mx-auto relative">
                        <div className="relative group">
                            <input 
                                type="text" 
                                placeholder="🔍 Tìm kiếm nông sản, tên trang trại..."
                                className="pixel-input w-full py-5 pl-8 pr-16 text-gray-800 bg-white text-lg" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="pixel-btn absolute right-2 top-2 bg-[var(--green-dark)] text-white p-3 hover:bg-[var(--gray-800)] transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </div>
                        {searchTerm && (
                            <div className="pixel-card absolute top-full left-0 right-0 mt-2 bg-white p-4 z-20">
                                <p className="text-sm text-gray-600">Đang tìm: <span className="font-bold text-[var(--green-dark)]">{searchTerm}</span></p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* NỘI DUNG CHÍNH */}
            <div className="container mx-auto px-4">
                
                {/* BỘ LỌC - Enhanced */}
                <div className="flex gap-3 overflow-x-auto pb-4 mb-8 justify-center scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`pixel-btn px-6 py-3 font-bold whitespace-nowrap transition-colors
                                ${selectedCategory === cat 
                                    ? "bg-[var(--green-dark)] text-white hover:bg-[var(--gray-800)]" 
                                    : "bg-[var(--beige-cream)] text-gray-800 hover:bg-[var(--gray-100)]"}`}
                        >
                            <span className="flex items-center gap-2">
                                <span className="pixel-icon w-7 h-7 text-sm flex items-center justify-center bg-white/80">{cat === 'Rau củ' ? '🥬' : cat === 'Trái cây' ? '🍎' : cat === 'Củ quả' ? '🥔' : '🌾'}</span>
                                {cat}
                            </span>
                        </button>
                    ))}
                </div>

                {/* DANH SÁCH SẢN PHẨM */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="pixel-card inline-block p-8 bg-white">
                            <div className="spinner-enhanced w-16 h-16 mx-auto mb-6"></div>
                            <div className="pixel-icon w-16 h-16 text-4xl mx-auto mb-4 bg-[var(--beige-cream)]">🌾</div>
                            <p className="text-gray-600 font-semibold">Đang tải sản phẩm từ nông trại...</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product, index) => {
                                const isVegetable = product.name.toLowerCase().includes('rau') || 
                                                   product.name.toLowerCase().includes('cải') || 
                                                   product.name.toLowerCase().includes('cà');
                                const isFruit = product.name.toLowerCase().includes('dưa') || 
                                              product.name.toLowerCase().includes('dâu') || 
                                              product.name.toLowerCase().includes('cam');
                                const gradientClass = isVegetable 
                                    ? 'gradient-vegetable' 
                                    : isFruit 
                                    ? 'gradient-fruit' 
                                    : 'gradient-herb';
                                
                                return (
                                    <div 
                                        key={product.id} 
                                        className="pixel-card bg-white overflow-hidden group flex flex-col hover-lift transition-all h-full"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        {/* Khung icon sản phẩm – pixel */}
                                        <div className={`h-48 ${gradientClass} flex items-center justify-center relative overflow-hidden border-b-4 border-[var(--gray-800)]`}>
                                            <div className="pixel-icon w-24 h-24 text-6xl bg-white/30 flex items-center justify-center">
                                                {getProductIcon(product.name)}
                                            </div>
                                            
                                            <div className="pixel-badge absolute top-2 right-2 text-[var(--green-dark)] text-xs font-bold px-2 py-1 bg-white flex items-center gap-1">
                                                <span>✓</span>
                                                {product.farm.certification || 'VietGAP'}
                                            </div>
                                            
                                            {index < 3 && (
                                                <div className="pixel-badge absolute top-2 left-2 bg-[var(--orange-ripe)] text-white text-xs font-bold px-2 py-1">
                                                    ✨ Mới
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="p-5 flex-1 flex flex-col min-h-[200px]">
                                            {/* Farm Name */}
                                            <div className="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
                                                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                </svg>
                                                <span className="font-medium break-words line-clamp-2">{product.farm.name}</span>
                                            </div>
                                            
                                            {/* Product Name */}
                                            <h3 className="text-lg font-bold text-gray-800 mb-3 break-words group-hover:text-[#388E3C] transition-colors min-h-[3.5rem]" title={product.name}>
                                                {product.name}
                                            </h3>
                                            
                                            {/* Price and Action */}
                                            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                                <div>
                                                    <p className="text-[#388E3C] font-extrabold text-xl mb-1">
                                                        {product.price.toLocaleString('vi-VN')}đ
                                                    </p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1 break-words">
                                                        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                        </svg>
                                                        <span>Còn: {product.quantity} kg</span>
                                                    </p>
                                                </div>
                                                
                                                <button 
                                                    onClick={() => handleBuyClick(product)}
                                                    disabled={product.quantity <= 0}
                                                    className={`pixel-btn px-4 py-2 font-bold text-sm flex items-center gap-1
                                                        ${product.quantity > 0 
                                                            ? "bg-[var(--green-fresh)] text-white hover:bg-[var(--green-dark)]" 
                                                            : "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-500"}`}
                                                >
                                                    {product.quantity > 0 ? (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                            </svg>
                                                            Mua Ngay
                                                        </>
                                                    ) : (
                                                        'Hết hàng'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center py-20">
                                <div className="pixel-icon w-24 h-24 text-6xl mx-auto mb-6 bg-[var(--beige-cream)]">🥬</div>
                                <h3 className="text-2xl font-bold text-gray-600 mb-2">Không tìm thấy sản phẩm nào!</h3>
                                <p className="text-gray-500">Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* THÔNG TIN BỔ SUNG - Làm trang dài hơn */}
            <div className="container mx-auto px-4 mt-16 mb-12">
                <div className="pixel-card bg-[var(--beige-cream)] p-8 md:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="pixel-icon w-16 h-16 text-4xl mx-auto mb-4 bg-white">🌾</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Nông Sản Sạch</h3>
                            <p className="text-gray-600 text-sm">
                                Sản phẩm theo tiêu chuẩn VietGAP, đảm bảo an toàn vệ sinh thực phẩm
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="pixel-icon w-16 h-16 text-4xl mx-auto mb-4 bg-white">🔍</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Truy Xuất Nguồn Gốc</h3>
                            <p className="text-gray-600 text-sm">
                                Quét mã QR xem quy trình canh tác từ gieo trồng đến thu hoạch
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="pixel-icon w-16 h-16 text-4xl mx-auto mb-4 bg-white">💚</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Giao Hàng Tận Nơi</h3>
                            <p className="text-gray-600 text-sm">
                                Vận chuyển chuyên nghiệp, sản phẩm tươi đến tay người tiêu dùng
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL MUA HÀNG - Enhanced */}
            {showModal && selectedProduct && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="pixel-card bg-white w-full max-w-md p-8 relative overflow-hidden">
                        <button 
                            onClick={() => setShowModal(false)} 
                            className="pixel-btn absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors border-gray-400"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="relative z-10">
                            <div className="text-center mb-6">
                                <div className="pixel-icon w-20 h-20 text-5xl mx-auto mb-4 bg-[var(--green-light)]">
                                    {getProductIcon(selectedProduct.name)}
                                </div>
                                <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Đặt Mua Nông Sản</h2>
                                <h3 className="font-bold text-lg text-[#388E3C] mb-1 break-words px-4">{selectedProduct.name}</h3>
                                <p className="text-gray-500 text-sm flex items-center justify-center gap-1 break-words px-4">
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span className="text-center">{selectedProduct.farm.name}</span>
                                </p>
                            </div>

                            <div className="mb-6 space-y-4">
                                {/* Quantity Input */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <svg className="w-4 h-4 text-[#388E3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                        Số lượng (kg):
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setBuyQuantity(Math.max(1, buyQuantity - 1))}
                                            disabled={buyQuantity <= 1}
                                            className="pixel-btn w-10 h-10 border-gray-400 hover:bg-[var(--green-fresh)] hover:text-white hover:border-[var(--gray-800)] disabled:opacity-50 flex items-center justify-center font-bold text-lg"
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            min="1"
                                            max={selectedProduct.quantity}
                                            value={buyQuantity}
                                            onChange={(e) => setBuyQuantity(Math.max(1, Math.min(selectedProduct.quantity, Number(e.target.value))))}
                                            className="pixel-input flex-1 p-3 text-center font-bold text-lg"
                                        />
                                        <button
                                            onClick={() => setBuyQuantity(Math.min(selectedProduct.quantity, buyQuantity + 1))}
                                            disabled={buyQuantity >= selectedProduct.quantity}
                                            className="pixel-btn w-10 h-10 border-gray-400 hover:bg-[var(--green-fresh)] hover:text-white hover:border-[var(--gray-800)] disabled:opacity-50 flex items-center justify-center font-bold text-lg"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <p className="text-xs text-right text-gray-500 mt-2 flex items-center justify-end gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Trong kho còn: <span className="font-bold text-[#388E3C]">{selectedProduct.quantity} kg</span>
                                    </p>
                                </div>

                                {/* Total Price */}
                                <div className="pixel-box bg-[var(--beige-cream)] p-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-700 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-[#388E3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Tổng thanh toán:
                                        </span>
                                        <span className="text-2xl font-extrabold text-[#388E3C]">
                                            {(selectedProduct.price * buyQuantity).toLocaleString('vi-VN')} đ
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="pixel-btn flex-1 bg-[var(--gray-100)] text-gray-700 font-bold py-3.5 hover:bg-gray-200 transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={submitOrder}
                                    disabled={buying || buyQuantity <= 0 || buyQuantity > selectedProduct.quantity}
                                    className="pixel-btn flex-1 bg-[var(--green-fresh)] text-white font-bold py-3.5 hover:bg-[var(--green-dark)] disabled:opacity-50 transition-colors"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {buying ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Xác Nhận Mua
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}