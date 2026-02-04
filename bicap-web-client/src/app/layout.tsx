import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
    title: 'BICAP - Blockchain Integration in Clean Agricultural Production',
    description: 'Clean Agricultural Production Management System',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className="font-sans antialiased theme-pixel">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}
