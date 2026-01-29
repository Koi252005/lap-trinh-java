import type { Metadata } from 'next'
import RetailerHeader from '@/components/RetailerHeader';

export const metadata: Metadata = {
    title: 'Retailer Portal | BICAP',
    description: 'Retailer Management Portal',
}

export default function RetailerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 via-blue-50/30 to-white dark:bg-blue-950">
            <RetailerHeader />
            <main className="flex-grow container mx-auto p-4 md:p-6">
                {children}
            </main>
        </div>
    )
}
