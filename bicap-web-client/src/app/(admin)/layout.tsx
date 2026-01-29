import type { Metadata } from 'next'
import LogoutButton from '@/components/LogoutButton';

export const metadata: Metadata = {
    title: 'Admin Console | BICAP',
    description: 'System Administration Console',
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
            <nav className="bg-gray-800 text-white p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold">Admin Console</h1>
                    <div className="space-x-4 flex items-center">
                        <span>Users</span>
                        <span>Settings</span>
                        <span>Logs</span>
                        <LogoutButton />
                    </div>
                </div>
            </nav>
            <main className="flex-grow container mx-auto p-4">
                {children}
            </main>
        </div>
    )
}
