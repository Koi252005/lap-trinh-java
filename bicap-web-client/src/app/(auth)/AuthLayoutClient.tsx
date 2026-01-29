'use client';

import FirebaseConfigWarning from '@/components/FirebaseConfigWarning';

export default function AuthLayoutClient({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-green-50/30 to-white dark:bg-gray-900 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            <FirebaseConfigWarning />
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-[#7CB342] rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#388E3C] rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-[#00C853] rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>
            
            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-block mb-4">
                        <div className="bg-gradient-to-br from-[#7CB342] to-[#388E3C] w-20 h-20 rounded-3xl flex items-center justify-center text-5xl shadow-2xl mx-auto animate-scaleIn">
                            🌾
                        </div>
                    </div>
                    <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#388E3C] to-[#7CB342] bg-clip-text text-transparent mb-2">
                        BICAP System
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Hệ thống Nông nghiệp Sạch & Minh bạch
                    </p>
                </div>
            </div>

            <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white dark:bg-gray-800 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
                    {children}
                </div>
            </div>
        </div>
    );
}
