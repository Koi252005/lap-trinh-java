'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

const links = [
  { href: '/admin', label: 'Tổng quan' },
  { href: '/admin/orders', label: 'Đơn hàng' },
  { href: '/admin/users', label: 'Người dùng' },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="bg-gray-800 text-white p-4 shadow-lg">
      <div className="container mx-auto flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-xl font-bold">BICAP Admin</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                pathname === href
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              {label}
            </Link>
          ))}
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
