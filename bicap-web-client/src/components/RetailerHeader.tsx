'use client';

import Link from 'next/link';
import LogoutButton from './LogoutButton';
import { usePathname } from 'next/navigation';

export default function RetailerHeader() {
    const pathname = usePathname();

    return (
        <nav className="pixel-nav bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3 sticky top-0 z-50">
            <div className="w-full flex justify-between items-center gap-2 max-w-7xl mx-auto">
                <Link href="/retailer" className="text-xl font-extrabold whitespace-nowrap hidden lg:flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <span className="pixel-icon w-9 h-9 text-lg flex items-center justify-center bg-white/20">🛒</span>
                    <span>BICAP Retailer</span>
                </Link>
                <div className="flex items-center gap-1 justify-end w-full lg:w-auto overflow-x-auto scrollbar-hide">
                    <NavLink href="/retailer/market" label="Sàn Nông Sản" icon="🏪" highlight currentPath={pathname} />
                    <NavLink href="/retailer/orders" label="Đơn hàng" icon="📦" currentPath={pathname} />
                    <NavLink href="/retailer/reports" label="Báo cáo" icon="📝" currentPath={pathname} />
                    <NavLink href="/retailer/notifications" label="Thông báo" icon="🔔" currentPath={pathname} />

                    <div className="border-l border-white/30 pl-2 ml-2 flex gap-1">
                        <NavLink href="/retailer/profile" label="Hồ sơ" icon="👤" currentPath={pathname} />
                    </div>

                    <LogoutButton />
                </div>
            </div>
        </nav>
    );
}

function NavLink({ href, label, icon, highlight, currentPath }: { href: string, label: string, icon?: string, highlight?: boolean, currentPath: string }) {
    const isActive = currentPath === href || (href !== '/retailer' && currentPath.startsWith(href));

    return (
        <Link 
            href={href} 
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
