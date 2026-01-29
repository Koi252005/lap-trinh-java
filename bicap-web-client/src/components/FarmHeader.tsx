'use client';

import Link from 'next/link';
import LogoutButton from './LogoutButton';
import { usePathname } from 'next/navigation';

export default function FarmHeader() {
    const pathname = usePathname();
    
    return (
        <nav className="bg-gradient-to-r from-[#388E3C] to-[#7CB342] text-white px-4 py-3 sticky top-0 z-50 shadow-xl border-b border-green-700/30">
            <div className="w-full flex justify-between items-center gap-2 max-w-7xl mx-auto">
                <Link href="/farm" className="text-xl font-extrabold whitespace-nowrap hidden lg:flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <span className="text-2xl">🌾</span>
                    <span>BICAP Farm</span>
                </Link>
                <div className="flex items-center gap-1 justify-end w-full lg:w-auto overflow-x-auto scrollbar-hide">
                    <NavLink href="/farm" label="Tổng quan" currentPath={pathname} />
                    <NavLink href="/farm/seasons" label="Mùa vụ" currentPath={pathname} />
                    <NavLink href="/farm/products" label="Sản phẩm" currentPath={pathname} />
                    <NavLink href="/farm/orders" label="Đơn hàng" currentPath={pathname} />
                    <NavLink href="/farm/reports/shipping" label="Báo cáo" currentPath={pathname} />
                    <NavLink href="/farm/monitoring" label="Giám sát" currentPath={pathname} />
                    <NavLink href="/farm/services" label="Dịch vụ" currentPath={pathname} />
                    <NavLink href="/farm/notifications" label="Thông báo" currentPath={pathname} highlight />

                    <div className="border-l border-white/30 pl-2 ml-2 flex gap-1">
                        <NavLink href="/farm/info" label="Trang trại" currentPath={pathname} />
                        <NavLink href="/farm/profile" label="Hồ sơ" currentPath={pathname} />
                    </div>

                    <LogoutButton />
                </div>
            </div>
        </nav>
    );
}

function NavLink({ href, label, icon, highlight, target, currentPath }: { href: string, label: string, icon?: string, highlight?: boolean, target?: string, currentPath: string }) {
    const isActive = currentPath === href || (href !== '/farm' && currentPath.startsWith(href));
    
    return (
        <Link 
            href={href} 
            target={target} 
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all duration-200 group relative ${
                isActive 
                    ? 'bg-white/20 backdrop-blur-sm shadow-md' 
                    : highlight 
                    ? 'hover:bg-yellow-500/20 text-yellow-200' 
                    : 'hover:bg-white/10 text-white'
            }`}
        >
            <span className={`text-xs font-bold uppercase tracking-wide whitespace-nowrap flex items-center gap-1 ${
                highlight ? 'text-yellow-200' : 'text-white'
            }`}>
                {icon && <span>{icon}</span>}
                {label}
            </span>
            {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"></div>
            )}
        </Link>
    );
}
