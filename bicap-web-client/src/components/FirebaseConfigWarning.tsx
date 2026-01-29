'use client';

import { useEffect, useState } from 'react';

export default function FirebaseConfigWarning() {
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        // Check if Firebase config is missing
        const checkConfig = () => {
            const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
            const placeholderPatterns = ['your_', 'placeholder', 'example', 'change_this'];
            
            if (!apiKey || placeholderPatterns.some(pattern => apiKey.toLowerCase().includes(pattern))) {
                setShowWarning(true);
            }
        };

        checkConfig();
    }, []);

    if (!showWarning) return null;

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full mx-4 animate-fadeInUp">
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 shadow-2xl">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-yellow-800 mb-1">
                            ⚠️ Firebase chưa được cấu hình
                        </h3>
                        <p className="text-xs text-yellow-700 mb-2">
                            Firebase API key chưa được cấu hình đúng trong file .env. Vui lòng cấu hình Firebase để sử dụng tính năng đăng nhập.
                        </p>
                        <div className="flex gap-2">
                            <a
                                href="/FIREBASE_SETUP_GUIDE.md"
                                target="_blank"
                                className="text-xs font-semibold text-yellow-800 hover:text-yellow-900 underline"
                            >
                                📖 Xem hướng dẫn
                            </a>
                            <button
                                onClick={() => setShowWarning(false)}
                                className="text-xs font-semibold text-yellow-800 hover:text-yellow-900"
                            >
                                ✕ Đóng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
