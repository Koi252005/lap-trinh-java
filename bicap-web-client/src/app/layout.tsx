import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from '@/context/AuthContext'

// Use system font instead of Google Fonts for Docker build compatibility
const fontClass = 'font-sans'

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
            <body className={fontClass}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}
