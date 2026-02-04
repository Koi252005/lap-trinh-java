'use client';

import FirebaseConfigWarning from '@/components/FirebaseConfigWarning';

export default function AuthLayoutClient({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-80s-grid theme-pixel py-12 sm:px-6 lg:px-8 relative overflow-hidden scanline">
            <FirebaseConfigWarning />
            {/* 80s glow orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: 'var(--neon-teal)' }}></div>
                <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: 'var(--neon-magenta)' }}></div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="pixel-icon w-20 h-20 mx-auto mb-4 flex items-center justify-center text-4xl bg-[var(--retro-purple)] border-[var(--neon-teal)]" style={{ boxShadow: '4px 4px 0 var(--neon-teal)' }}>
                        <span className="text-neon-green">🌾</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neon-teal mb-2">
                        CHÀO MỪNG ĐẾN BICAP
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Hệ thống Nông nghiệp Sạch & Minh bạch
                    </p>
                </div>
            </div>

            <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="pixel-card bg-[var(--retro-purple)]/90 py-8 px-6 sm:px-10 border-[var(--neon-teal)]" style={{ boxShadow: '6px 6px 0 var(--neon-teal)' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
