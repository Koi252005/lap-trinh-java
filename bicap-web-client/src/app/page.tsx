'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ScrollAnimation from '@/components/ScrollAnimation';

export default function Home() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [scrollY, setScrollY] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
        
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const farmerStories = [
        {
            name: 'Anh Minh',
            farm: 'Nông Trại Xanh Tươi',
            location: 'Đà Lạt, Lâm Đồng',
            image: '👨‍🌾',
            quote: 'BICAP giúp tôi quản lý mùa vụ dễ dàng hơn bao giờ hết. Khách hàng tin tưởng vì họ thấy được quy trình canh tác minh bạch.',
            product: 'Rau xanh, cà chua',
            color: 'from-green-400 to-emerald-500'
        },
        {
            name: 'Chị Lan',
            farm: 'Vườn Rau Sạch Gia Đình',
            location: 'Hà Nội',
            image: '👩‍🌾',
            quote: 'Nhờ BICAP, sản phẩm của tôi được nhiều người biết đến hơn. Hệ thống truy xuất nguồn gốc giúp khách hàng yên tâm.',
            product: 'Rau cải, rau muống',
            color: 'from-emerald-400 to-teal-500'
        },
        {
            name: 'Anh Đức',
            farm: 'Trang Trại Hữu Cơ',
            location: 'Cần Thơ',
            image: '👨‍🌾',
            quote: 'Blockchain giúp tôi chứng minh được chất lượng sản phẩm. Khách hàng quét mã QR là thấy ngay lịch sử canh tác.',
            product: 'Lúa, gạo hữu cơ',
            color: 'from-amber-400 to-orange-500'
        }
    ];

    const features = [
        {
            icon: '🌱',
            title: 'Quản Lý Mùa Vụ',
            description: 'Ghi chép nhật ký canh tác, theo dõi quy trình từ gieo trồng đến thu hoạch một cách khoa học và có hệ thống',
            color: 'from-green-500 to-emerald-600',
            bgColor: 'bg-green-50'
        },
        {
            icon: '🔗',
            title: 'Blockchain Minh Bạch',
            description: 'Mọi thông tin được lưu trữ trên blockchain, không thể thay đổi, đảm bảo tính minh bạch tuyệt đối',
            color: 'from-blue-500 to-cyan-600',
            bgColor: 'bg-blue-50'
        },
        {
            icon: '📱',
            title: 'IoT Thông Minh',
            description: 'Cảm biến tự động theo dõi nhiệt độ, độ ẩm, pH. Cảnh báo ngay khi có bất thường',
            color: 'from-purple-500 to-pink-600',
            bgColor: 'bg-purple-50'
        },
        {
            icon: '📦',
            title: 'Kết Nối Trực Tiếp',
            description: 'Nông dân bán trực tiếp cho nhà bán lẻ, không qua trung gian, giá cả công bằng',
            color: 'from-orange-500 to-red-600',
            bgColor: 'bg-orange-50'
        },
        {
            icon: '🔍',
            title: 'Truy Xuất Nguồn Gốc',
            description: 'Quét QR code là biết ngay sản phẩm từ đâu, ai trồng, quy trình như thế nào',
            color: 'from-teal-500 to-green-600',
            bgColor: 'bg-teal-50'
        },
        {
            icon: '💳',
            title: 'Thanh Toán Dễ Dàng',
            description: 'Thanh toán online an toàn, nhanh chóng. Hỗ trợ nhiều phương thức thanh toán',
            color: 'from-yellow-500 to-amber-600',
            bgColor: 'bg-yellow-50'
        }
    ];

    const stats = [
        { number: '1000+', label: 'Nông Dân', icon: '👨‍🌾', color: 'text-green-600' },
        { number: '5000+', label: 'Sản Phẩm', icon: '🥬', color: 'text-emerald-600' },
        { number: '99.9%', label: 'Minh Bạch', icon: '✅', color: 'text-blue-600' },
        { number: '24/7', label: 'Hỗ Trợ', icon: '💬', color: 'text-purple-600' }
    ];

    return (
        <main className="min-h-screen bg-white overflow-x-hidden">
            {/* ============================================
                HERO SECTION - First Impression
                ============================================ */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--beige-cream)] via-[var(--green-light)]/20 to-[var(--green-fresh)]/30 theme-pixel">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <div 
                        className="absolute top-20 left-10 w-96 h-96 bg-green-200/40 rounded-full blur-3xl animate-float"
                        style={{
                            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
                        }}
                    ></div>
                    <div 
                        className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl animate-float"
                        style={{
                            animationDelay: '1s',
                            transform: `translate(${-mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
                        }}
                    ></div>
                    <div 
                        className="absolute top-1/2 left-1/2 w-96 h-96 bg-lime-200/30 rounded-full blur-3xl animate-float"
                        style={{
                            animationDelay: '2s',
                        }}
                    ></div>
                </div>

                {/* Floating Farm Elements - Nhiều icon rau củ được sắp xếp đẹp */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Hàng trên - Trái cây */}
                    <div className="absolute top-20 left-10 text-7xl opacity-20 animate-float">🍓</div>
                    <div className="absolute top-24 right-24 text-6xl opacity-20 animate-float" style={{ animationDelay: '0.3s' }}>🍊</div>
                    <div className="absolute top-32 left-1/4 text-5xl opacity-20 animate-float" style={{ animationDelay: '0.6s' }}>🍋</div>
                    <div className="absolute top-16 right-1/3 text-6xl opacity-20 animate-float" style={{ animationDelay: '0.9s' }}>🍇</div>
                    
                    {/* Hàng giữa - Rau xanh */}
                    <div className="absolute top-1/2 left-16 text-8xl opacity-20 animate-float" style={{ animationDelay: '0.2s' }}>🥬</div>
                    <div className="absolute top-1/2 right-20 text-7xl opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>🌿</div>
                    <div className="absolute top-2/5 left-1/3 text-6xl opacity-20 animate-float" style={{ animationDelay: '0.8s' }}>🥗</div>
                    <div className="absolute top-3/5 right-1/4 text-7xl opacity-20 animate-float" style={{ animationDelay: '1.1s' }}>🥦</div>
                    
                    {/* Hàng dưới - Củ quả */}
                    <div className="absolute bottom-32 left-20 text-9xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>🌱</div>
                    <div className="absolute bottom-28 right-32 text-8xl opacity-20 animate-float" style={{ animationDelay: '0.4s' }}>🌽</div>
                    <div className="absolute bottom-36 left-1/4 text-7xl opacity-20 animate-float" style={{ animationDelay: '1.3s' }}>🍅</div>
                    <div className="absolute bottom-24 right-1/3 text-6xl opacity-20 animate-float animate-wave" style={{ animationDelay: '0.7s' }}>🥕</div>
                    <div className="absolute bottom-40 left-1/2 text-8xl opacity-20 animate-float" style={{ animationDelay: '1.6s' }}>🥔</div>
                    <div className="absolute bottom-20 right-16 text-7xl opacity-20 animate-float" style={{ animationDelay: '1.9s' }}>🍆</div>
                    
                    {/* Các loại khác */}
                    <div className="absolute top-1/3 left-12 text-6xl opacity-20 animate-float" style={{ animationDelay: '0.3s' }}>🥒</div>
                    <div className="absolute top-2/3 right-12 text-5xl opacity-20 animate-float" style={{ animationDelay: '0.6s' }}>🧅</div>
                    <div className="absolute bottom-1/3 left-1/5 text-6xl opacity-20 animate-float" style={{ animationDelay: '0.9s' }}>🧄</div>
                    <div className="absolute top-1/4 right-1/5 text-5xl opacity-20 animate-float" style={{ animationDelay: '1.2s' }}>🌶️</div>
                    <div className="absolute bottom-1/4 left-3/4 text-7xl opacity-20 animate-float" style={{ animationDelay: '1.5s' }}>🥑</div>
                    <div className="absolute top-3/4 left-1/5 text-6xl opacity-20 animate-float" style={{ animationDelay: '1.8s' }}>🫑</div>
                    <div className="absolute bottom-1/2 right-1/5 text-5xl opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>🫘</div>
                    <div className="absolute top-1/5 left-2/3 text-6xl opacity-20 animate-float" style={{ animationDelay: '2.1s' }}>🍄</div>
                    <div className="absolute bottom-1/5 right-2/3 text-5xl opacity-20 animate-float" style={{ animationDelay: '0.8s' }}>🍠</div>
                    <div className="absolute top-4/5 left-1/3 text-6xl opacity-20 animate-float" style={{ animationDelay: '1.4s' }}>🎃</div>
                    
                    {/* Icon chính - Lúa gạo */}
                    <div className="absolute top-1/2 left-1/2 text-9xl opacity-15 animate-float" style={{ animationDelay: '2s' }}>🌾</div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    {/* Main Heading – font chữ bình thường */}
                    <ScrollAnimation direction="up" delay={100}>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
                            <span className="block pixel-icon w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 text-4xl md:text-5xl bg-[var(--beige-cream)]">🌾</span>
                            <span className="block bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                                Nông Nghiệp Sạch
                            </span>
                            <span className="block text-xl md:text-2xl lg:text-3xl text-gray-700 mt-4 font-medium">
                                Cho Tương Lai Tươi Sáng
                            </span>
                        </h1>
                    </ScrollAnimation>

                    {/* Subtitle */}
                    <ScrollAnimation direction="up" delay={200}>
                        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-4 leading-relaxed">
                            Kết nối <span className="font-bold text-green-600">nông dân</span> và <span className="font-bold text-emerald-600">người tiêu dùng</span> 
                            <span className="block mt-2">với công nghệ Blockchain và IoT hiện đại</span>
                        </p>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12">
                            Minh bạch • An toàn • Chất lượng • Gần gũi
                        </p>
                    </ScrollAnimation>

                    {/* CTA Buttons - Enhanced */}
                    <ScrollAnimation direction="up" delay={300}>
                        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
                            <Link 
                                href="/market" 
                                className="pixel-btn group relative px-10 py-5 bg-[var(--green-fresh)] text-white font-bold text-lg flex items-center justify-center gap-3 hover:bg-[var(--green-dark)] transition-colors"
                            >
                                <span className="pixel-icon w-10 h-10 flex items-center justify-center text-xl bg-[var(--green-dark)]">🏪</span>
                                <span>Khám Phá Chợ Nông Sản</span>
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <Link 
                                href="/login?role=guest" 
                                className="pixel-btn px-10 py-5 bg-[var(--beige-cream)] border-[var(--gray-800)] text-gray-800 font-bold text-lg flex items-center justify-center gap-3 hover:bg-[var(--gray-100)] transition-colors"
                            >
                                <span className="pixel-icon w-10 h-10 flex items-center justify-center text-xl bg-white">🔍</span>
                                <span>Truy Xuất Nguồn Gốc</span>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        </div>
                    </ScrollAnimation>

                    {/* Stats - Enhanced */}
                    <ScrollAnimation direction="up" delay={400}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                            {stats.map((stat, index) => (
                                <div 
                                    key={index}
                                    className="pixel-card glass-strong p-6 bg-white/90 hover-lift transition-all duration-300"
                                >
                                    <div className="pixel-icon w-14 h-14 text-3xl mb-3 bg-white/80" style={{ animationDelay: `${index * 0.2}s` }}>{stat.icon}</div>
                                    <div className={`text-3xl font-extrabold ${stat.color} mb-2 text-glow`}>
                                        {stat.number}
                                    </div>
                                    <div className="text-sm text-gray-600 font-semibold">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </ScrollAnimation>
                </div>

                {/* Scroll Indicator – pixel */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-slow">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-sm text-gray-600 font-medium">Cuộn xuống</span>
                        <div className="pixel-box w-6 h-10 flex justify-center bg-white/80">
                            <div className="w-1 h-3 bg-[var(--green-dark)] mt-2 animate-pulse" style={{ boxShadow: '2px 2px 0 var(--gray-800)' }}></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================
                STORY SECTION - Farmer Stories
                ============================================ */}
            <section className="py-24 bg-gradient-to-b from-white to-green-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollAnimation direction="up">
                        <div className="text-center mb-16">
                            <div className="pixel-badge inline-block mb-4 px-4 py-2 bg-green-100 text-green-700 text-sm font-bold">
                                Câu Chuyện Nông Dân
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-green-800">
                                Những Người Làm Nông Thật Sự
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Lắng nghe những câu chuyện từ những nông dân đang sử dụng BICAP
                            </p>
                        </div>
                    </ScrollAnimation>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {farmerStories.map((story, index) => (
                            <ScrollAnimation key={index} direction="up" delay={index * 100}>
                                <div className="pixel-card bg-white p-8 hover-lift transition-all">
                                    <div className="text-center mb-6">
                                        <div className="pixel-icon w-20 h-20 text-5xl mx-auto mb-4 bg-[var(--beige-cream)]">{story.image}</div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{story.name}</h3>
                                        <p className="text-green-600 font-semibold mb-1">{story.farm}</p>
                                        <p className="text-sm text-gray-500">{story.location}</p>
                                    </div>
                                    <div className={`h-1 bg-gradient-to-r ${story.color} rounded-full mb-6`}></div>
                                    <p className="text-gray-600 italic mb-6 leading-relaxed">
                        "{story.quote}"
                    </p>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span className="font-semibold">Sản phẩm:</span>
                                        <span>{story.product}</span>
                                    </div>
                                </div>
                            </ScrollAnimation>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================
                FEATURES SECTION - Main Features
                ============================================ */}
            <section className="py-24 bg-gradient-to-b from-green-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollAnimation direction="up">
                        <div className="text-center mb-16">
                            <div className="pixel-badge inline-block mb-4 px-4 py-2 bg-emerald-100 text-emerald-700 text-sm font-bold">
                                Tính Năng Nổi Bật
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-green-800">
                                Công Nghệ Cho Nông Nghiệp
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Những công cụ mạnh mẽ giúp nông dân quản lý tốt hơn, người tiêu dùng yên tâm hơn
                            </p>
                        </div>
                    </ScrollAnimation>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <ScrollAnimation key={index} direction="up" delay={index * 100}>
                                <div className={`pixel-card ${feature.bgColor} p-8 hover-lift transition-all`}>
                                    <div className={`pixel-icon w-20 h-20 bg-gradient-to-br ${feature.color} flex items-center justify-center text-4xl mb-6`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </ScrollAnimation>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================
                HOW IT WORKS SECTION
                ============================================ */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollAnimation direction="up">
                        <div className="text-center mb-16">
                            <div className="pixel-badge inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 text-sm font-bold">
                                Cách Thức Hoạt Động
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-800">
                                Đơn Giản & Hiệu Quả
                            </h2>
                        </div>
                    </ScrollAnimation>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                        {/* Thanh xanh lá cây đi ngang qua tất cả các bước - chỉ hiển thị trên desktop */}
                        <div className="hidden md:block absolute top-10 left-0 right-0 h-2 bg-[var(--green-fresh)] border-y-2 border-[var(--gray-800)] z-0"></div>
                        {[
                            { step: '1', icon: '🌱', title: 'Nông Dân Gieo Trồng', desc: 'Ghi chép quy trình canh tác trên hệ thống' },
                            { step: '2', icon: '📱', title: 'IoT Giám Sát', desc: 'Cảm biến tự động theo dõi điều kiện môi trường' },
                            { step: '3', icon: '🔗', title: 'Lưu Trữ Blockchain', desc: 'Mọi thông tin được ghi lại trên blockchain' },
                            { step: '4', icon: '🛒', title: 'Người Dùng Mua', desc: 'Quét QR code để xem nguồn gốc sản phẩm' }
                        ].map((item, index) => (
                            <ScrollAnimation key={index} direction="up" delay={index * 100}>
                                <div className="text-center relative z-10">
                                    <div className="relative inline-block mb-6">
                                        <div className="pixel-icon w-20 h-20 bg-[var(--green-fresh)] flex items-center justify-center text-4xl">
                                            {item.icon}
                                        </div>
                                        <div className="pixel-badge absolute -top-2 -right-2 w-8 h-8 bg-[var(--green-dark)] text-white flex items-center justify-center text-sm font-bold">
                                            {item.step}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                                    <p className="text-gray-600">{item.desc}</p>
                                </div>
                            </ScrollAnimation>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================
                CTA SECTION - Call to Action - Enhanced
                ============================================ */}
            <section className="py-24 bg-gradient-to-r from-green-600 via-emerald-600 to-lime-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/pattern.svg')] bg-repeat"></div>
                </div>
                {/* Animated background particles */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
                </div>
                <ScrollAnimation direction="fade">
                    <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 text-glow">
                            Sẵn Sàng Bắt Đầu?
                        </h2>
                        <p className="text-xl text-green-50 mb-8 leading-relaxed">
                            Tham gia cùng hàng nghìn nông dân và người tiêu dùng đang sử dụng BICAP
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link 
                                href="/login?role=farm" 
                                className="pixel-btn px-8 py-4 bg-[var(--beige-cream)] text-gray-800 font-bold text-lg hover:bg-[var(--gray-100)] transition-colors inline-flex items-center justify-center gap-2"
                            >
                                <span className="pixel-icon w-8 h-8 text-lg flex items-center justify-center bg-white">🌱</span>
                                Tôi Là Nông Dân
                            </Link>
                            <Link 
                                href="/login?role=retailer" 
                                className="pixel-btn px-8 py-4 bg-[var(--green-dark)] text-white font-bold text-lg hover:bg-[var(--gray-800)] transition-colors inline-flex items-center justify-center gap-2"
                            >
                                <span className="pixel-icon w-8 h-8 text-lg flex items-center justify-center bg-[var(--green-fresh)]">🛒</span>
                                Tôi Là Nhà Bán Lẻ
                            </Link>
                        </div>
                    </div>
                </ScrollAnimation>
            </section>

            {/* ============================================
                PORTAL SELECTION SECTION
                ============================================ */}
            <section className="py-24 bg-gradient-to-b from-white to-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollAnimation direction="up">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
                                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    Chọn Vai Trò Của Bạn
                                </span>
                            </h2>
                            <p className="text-xl text-gray-600">
                                Mỗi vai trò có những công cụ và tính năng riêng phù hợp với nhu cầu
                            </p>
                        </div>
                    </ScrollAnimation>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { href: '/login?role=farm', icon: '🌱', title: 'Nông Dân', desc: 'Quản lý mùa vụ, sản phẩm', color: 'from-green-500 to-emerald-600' },
                            { href: '/login?role=retailer', icon: '🛒', title: 'Nhà Bán Lẻ', desc: 'Quản lý đơn hàng, kho', color: 'from-blue-500 to-cyan-600' },
                            { href: '/login?role=shipping', icon: '🚚', title: 'Vận Chuyển', desc: 'Quản lý giao hàng', color: 'from-orange-500 to-red-600' },
                            { href: '/login?role=admin', icon: '🛡️', title: 'Quản Trị', desc: 'Quản lý hệ thống', color: 'from-purple-500 to-pink-600' },
                            { href: '/login?role=guest', icon: '👤', title: 'Khách', desc: 'Xem sản phẩm, truy xuất', color: 'from-teal-500 to-green-600' }
                        ].map((portal, index) => (
                            <ScrollAnimation key={index} direction="up" delay={index * 100}>
                                <Link 
                                    href={portal.href} 
                                    className="block pixel-card p-6 hover-lift transition-all bg-white/90"
                                >
                                    <div className={`pixel-icon w-16 h-16 bg-gradient-to-br ${portal.color} flex items-center justify-center text-3xl mb-4`}>
                                        {portal.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                                        {portal.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">{portal.desc}</p>
                                </Link>
                            </ScrollAnimation>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================
                FOOTER
                ============================================ */}
            <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="pixel-icon w-12 h-12 bg-[var(--green-fresh)] flex items-center justify-center text-2xl">
                                    🌾
                                </div>
                                <span className="text-2xl font-extrabold">BICAP</span>
                            </div>
                            <p className="text-gray-400 leading-relaxed">
                                Hệ thống quản lý nông nghiệp sạch với công nghệ Blockchain, gần gũi và thân thiện với nông dân.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold mb-4">Về Chúng Tôi</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="#" className="hover:text-white transition-colors">Giới thiệu</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Đội ngũ</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Tin tức</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold mb-4">Hỗ Trợ</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="#" className="hover:text-white transition-colors">Hướng dẫn sử dụng</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Câu hỏi thường gặp</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Liên hệ</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold mb-4">Pháp Lý</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="#" className="hover:text-white transition-colors">Chính sách bảo mật</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Điều khoản</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 pt-8 text-center">
                        <p className="text-gray-400">
                            © 2024 BICAP. Made with ❤️ for Vietnamese Farmers.
                        </p>
                    </div>
                </div>
            </footer>
        </main>
    );
}
