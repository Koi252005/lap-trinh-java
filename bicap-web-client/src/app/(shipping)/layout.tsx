'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function ShippingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Danh sách các link điều hướng
  const navLinks = [
    { name: 'Tổng quan', href: '/shipping', icon: '📊' }, // Dashboard
    { name: 'Quản lý Đơn hàng', href: '/shipping/shipments', icon: '📦' },
    { name: 'Tài xế & Đội xe', href: '/shipping/drivers', icon: '🚚' },
    { name: 'Bản đồ Trực tiếp', href: '/shipping/map', icon: '🗺️' },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* --- HEADER CHUYÊN NGHIỆP - Enhanced --- */}
      <header className="bg-gradient-to-r from-orange-600 to-orange-500 text-white border-b border-orange-700/30 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* 1. Logo & Brand */}
            <Link href="/shipping" className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                🚚
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white hidden sm:block">
                BICAP <span className="text-orange-200">Logistics</span>
              </span>
            </Link>

            {/* 2. Navigation (Desktop) */}
            <nav className="hidden md:flex space-x-2 items-center">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                      isActive 
                        ? 'bg-white/20 backdrop-blur-sm shadow-md text-white' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{link.icon}</span>
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* 3. User & Logout */}
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-white">{user?.email || 'Quản lý Vận chuyển'}</p>
                <p className="text-xs text-orange-200">Admin Kho vận</p>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border border-white/30"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- NỘI DUNG CHÍNH (PAGE) --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
