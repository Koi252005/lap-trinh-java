'use client';

import { useAuth } from '@/context/AuthContext';

export default function LogoutButton() {
    const { logout } = useAuth();

    return (
        <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
        >
            Đăng xuất
        </button>
    );
}
