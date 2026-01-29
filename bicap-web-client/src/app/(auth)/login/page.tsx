'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
    const { loginWithGoogle, registerWithEmail, loginWithEmail, user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form States
    const [isRegistering, setIsRegistering] = useState(false);
    // Get role from URL or default to 'retailer'
    const roleParam = searchParams.get('role');
    const [selectedRole, setSelectedRole] = useState(roleParam || 'retailer');

    // Force login mode for admin
    useEffect(() => {
        if (selectedRole === 'admin') {
            setIsRegistering(false);
        }
    }, [selectedRole]);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    // Auto redirect if already logged in
    useEffect(() => {
        if (user) {
            if (user.role === 'farm') router.push('/farm');
            else if (user.role === 'retailer') router.push('/retailer/market');
            else if (user.role === 'shipping') router.push('/shipping');
            else if (user.role === 'admin') router.push('/admin');
            else router.push('/guest');
        }
    }, [user, router]);

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle(selectedRole);
        } catch (err: any) {
            console.error(err);
            let msg = err.message || 'Đăng nhập Google thất bại.';
            
            // Firebase config errors
            if (err.code === 'auth/api-key-not-valid' || err.message?.includes('api-key-not-valid') || err.message?.includes('api-key')) {
                msg = '❌ Firebase chưa được cấu hình đúng. Vui lòng kiểm tra file .env và cấu hình Firebase API key. Xem FIREBASE_SETUP_GUIDE.md để biết cách cấu hình.';
            } else if (err.code === 'auth/invalid-api-key' || err.message?.includes('invalid-api-key')) {
                msg = '❌ Firebase API key không hợp lệ. Vui lòng kiểm tra lại cấu hình trong file .env.';
            } else if (err.message?.includes('Firebase initialization failed') || err.message?.includes('Firebase chưa được cấu hình')) {
                msg = '❌ Firebase chưa được cấu hình. Vui lòng cấu hình Firebase trong file .env trước khi sử dụng.';
            }
            // Google login specific errors
            else if (err.code === 'auth/popup-closed-by-user') {
                msg = 'Bạn đã đóng cửa sổ đăng nhập. Vui lòng thử lại.';
            } else if (err.code === 'auth/popup-blocked') {
                msg = 'Trình duyệt đã chặn popup. Vui lòng cho phép popup và thử lại.';
            }
            
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isRegistering) {
                // Register
                await registerWithEmail(email, password, selectedRole, fullName);
            } else {
                // Login
                // Note: For login, backend might ignore selectedRole and use existing role in DB
                // but we pass it anyway just in case backend logic allows role update on login (rare)
                // or simply to maintain consistency.
                await loginWithEmail(email, password, selectedRole);
            }
        } catch (err: any) {
            console.error(err);
            let msg = err.message || 'Authentication failed.';
            
            // Firebase config errors
            if (err.code === 'auth/api-key-not-valid' || err.message?.includes('api-key-not-valid') || err.message?.includes('api-key')) {
                msg = '❌ Firebase chưa được cấu hình đúng. Vui lòng kiểm tra file .env và cấu hình Firebase API key. Xem FIREBASE_SETUP_GUIDE.md để biết cách cấu hình.';
            } else if (err.code === 'auth/invalid-api-key' || err.message?.includes('invalid-api-key')) {
                msg = '❌ Firebase API key không hợp lệ. Vui lòng kiểm tra lại cấu hình trong file .env.';
            } else if (err.message?.includes('Firebase initialization failed') || err.message?.includes('Firebase chưa được cấu hình')) {
                msg = '❌ Firebase chưa được cấu hình. Vui lòng cấu hình Firebase trong file .env trước khi sử dụng.';
            }
            // Standard Firebase errors
            else if (err.code === 'auth/email-already-in-use') msg = 'Email này đã được sử dụng.';
            else if (err.code === 'auth/wrong-password') msg = 'Sai mật khẩu.';
            else if (err.code === 'auth/user-not-found') msg = 'Không tìm thấy tài khoản với email này.';
            else if (err.code === 'auth/invalid-email') msg = 'Email không hợp lệ.';
            else if (err.code === 'auth/weak-password') msg = 'Mật khẩu quá yếu. Vui lòng sử dụng mật khẩu mạnh hơn (ít nhất 6 ký tự).';
            else if (err.code === 'auth/too-many-requests') msg = 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau vài phút.';
            // Network errors
            else if (err.message?.includes('Network Error') || err.message?.includes('ECONNREFUSED')) {
                msg = '❌ Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc đảm bảo backend đang chạy.';
            }
            
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { id: 'farm', name: 'Trang Trại (Farmer)' },
        { id: 'retailer', name: 'Nhà Bán Lẻ (Retailer)' },
        { id: 'shipping', name: 'Vận Chuyển (Shipping)' },
        { id: 'admin', name: 'Quản Trị Viên (Admin)' },
        { id: 'guest', name: 'Khách (Guest)' },
    ];

    return (
        <div className="w-full">
            <h2 className="text-center text-3xl font-extrabold mb-2 text-gray-800 dark:text-white">
                {isRegistering ? 'Tạo Tài Khoản Mới' : 'Đăng Nhập'}
            </h2>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                {isRegistering ? 'Tham gia hệ thống BICAP ngay hôm nay' : 'Chào mừng bạn trở lại'}
            </p>

            {/* Role Selector - Enhanced */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#388E3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Chọn Vai Trò {isRegistering ? '(Bắt buộc)' : '(Test Mode)'}
                </label>
                <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="block w-full rounded-xl border-2 border-gray-200 bg-white py-3 px-4 shadow-sm focus:border-[#388E3C] focus:outline-none focus:ring-2 focus:ring-[#388E3C] focus:ring-offset-2 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all font-medium"
                >
                    {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                            {role.name}
                        </option>
                    ))}
                </select>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-start gap-3 animate-fadeIn">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-5 mb-6">
                {isRegistering && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Họ và tên</label>
                        <input
                            type="text"
                            placeholder="Nhập họ và tên của bạn"
                            required={isRegistering}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 shadow-sm focus:border-[#388E3C] focus:outline-none focus:ring-2 focus:ring-[#388E3C] focus:ring-offset-2 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                    <input
                        type="email"
                        placeholder="your.email@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 shadow-sm focus:border-[#388E3C] focus:outline-none focus:ring-2 focus:ring-[#388E3C] focus:ring-offset-2 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mật khẩu</label>
                    <input
                        type="password"
                        placeholder="Tối thiểu 6 ký tự"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 shadow-sm focus:border-[#388E3C] focus:outline-none focus:ring-2 focus:ring-[#388E3C] focus:ring-offset-2 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center items-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-[#388E3C] to-[#7CB342] py-3.5 px-4 text-sm font-bold text-white shadow-lg hover:from-[#2E7D32] hover:to-[#388E3C] focus:outline-none focus:ring-2 focus:ring-[#388E3C] focus:ring-offset-2 disabled:opacity-50 transition-all btn-glow relative overflow-hidden"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Đang xử lý...</span>
                        </>
                    ) : (
                        <>
                            <span>{isRegistering ? 'Đăng Ký' : 'Đăng Nhập'}</span>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </>
                    )}
                </button>
            </form>

            {selectedRole !== 'admin' && (
                <>
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-gray-200 dark:border-gray-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white dark:bg-gray-800 px-4 text-gray-500 font-medium">Hoặc tiếp tục với</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="flex w-full justify-center items-center gap-3 rounded-xl border-2 border-gray-200 bg-white dark:bg-gray-700 py-3.5 px-4 text-sm font-semibold text-gray-700 dark:text-white shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#388E3C] focus:ring-offset-2 disabled:opacity-50 transition-all"
                    >
                        <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                            <path
                                d="M12.0003 20.4504C16.6661 20.4504 20.6062 17.2625 21.9882 12.9375H12.0003V10.7416H22.3739C22.4497 11.4583 22.4936 12.2166 22.4936 13.0125C22.4936 19.0625 18.2574 23.3625 12.0003 23.3625C5.74323 23.3625 1.50696 19.0625 1.50696 13.0125C1.50696 6.9625 5.74323 2.6625 12.0003 2.6625C15.0294 2.6625 17.5753 3.65417 19.5397 5.25417L17.2897 7.42083C16.2053 6.46667 14.4753 5.70833 12.0003 5.70833C8.25621 5.70833 5.17621 8.79167 5.17621 12.5625C5.17621 16.3333 8.25621 19.4167 12.0003 19.4167V20.4504Z"
                                fill="currentColor"
                            />
                            <path
                                d="M21.9882 12.9375C20.6062 17.2625 16.6661 20.4504 12.0003 20.4504V19.4167C15.1182 19.4167 17.8282 17.0625 18.9953 14.15H21.9882V12.9375Z"
                                fill="#34A853"
                            />
                            <path
                                d="M1.50696 13.0125C1.50696 19.0625 5.74323 23.3625 12.0003 23.3625V19.4167C8.25621 19.4167 5.17621 16.3333 5.17621 12.5625H1.50696V13.0125Z"
                                fill="#EA4335"
                            />
                            <path
                                d="M12.0003 2.6625C5.74323 2.6625 1.50696 6.9625 1.50696 13.0125H5.17621C5.17621 8.79167 8.25621 5.70833 12.0003 5.70833V2.6625Z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12.0003 2.6625C15.0294 2.6625 17.5753 3.65417 19.5397 5.25417L17.2897 7.42083C16.2053 6.46667 14.4753 5.70833 12.0003 5.70833V2.6625Z"
                                fill="#4285F4"
                            />
                        </svg>
                        <span>Đăng nhập với Google</span>
                    </button>
                </>
            )}

            {selectedRole !== 'admin' && (
                <div className="mt-6 text-center pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isRegistering ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
                        <button
                            onClick={() => {
                                setIsRegistering(!isRegistering);
                                setError('');
                            }}
                            className="ml-2 font-bold text-[#388E3C] hover:text-[#2E7D32] transition-colors"
                        >
                            {isRegistering ? 'Đăng nhập ngay' : 'Tạo tài khoản mới'}
                        </button>
                    </p>
                </div>
            )}
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Đang tải...</div>}>
            <LoginForm />
        </Suspense>
    );
}
