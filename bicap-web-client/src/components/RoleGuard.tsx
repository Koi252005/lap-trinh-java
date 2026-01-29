'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (!allowedRoles.includes(user.role)) {
                // Redirect based on role if possible, or just to home/login
                if (user.role === 'retailer') router.push('/retailer/market');
                else if (user.role === 'admin') router.push('/admin'); // Should be allowed if admin
                else router.push('/'); // Fallback
            }
        }
    }, [user, loading, allowedRoles, router]);

    if (loading) {
        return <div className="p-8 text-center">Loading authentication...</div>;
    }

    if (!user || !allowedRoles.includes(user.role)) {
        return null; // Or a "Not Authorized" message
    }

    return <>{children}</>;
}
