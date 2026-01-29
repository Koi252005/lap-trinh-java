import type { Metadata } from 'next'
import FarmHeader from '@/components/FarmHeader';

export const metadata: Metadata = {
    title: 'Farm Dashboard | BICAP',
    description: 'Farm Management Dashboard',
}

import RoleGuard from '@/components/RoleGuard';

export default function FarmLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 via-green-50/30 to-white dark:bg-green-950">
            <RoleGuard allowedRoles={['farm', 'admin']}>
                <FarmHeader />
                <main className="flex-grow container mx-auto p-4 md:p-6">
                    {children}
                </main>
            </RoleGuard>
        </div>
    )
}
