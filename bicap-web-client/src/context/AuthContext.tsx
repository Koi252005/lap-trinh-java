'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut as firebaseSignOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface UserData {
    id: number;
    firebaseUid: string;
    email: string;
    fullName: string;
    role: string;
    status: string;
}

interface AuthContextType {
    user: UserData | null;
    loading: boolean;
    loginWithGoogle: (role?: string) => Promise<void>;
    registerWithEmail: (email: string, password: string, role?: string, fullName?: string) => Promise<void>;
    loginWithEmail: (email: string, password: string, role?: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    loginWithGoogle: async () => { },
    registerWithEmail: async () => { },
    loginWithEmail: async () => { },
    logout: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Handle Firebase Auth State Changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Get freshly generated ID token
                    const token = await firebaseUser.getIdToken();

                    // Sync with backend to get role and full user data
                    // Note: We might not have the desired role here if it's an auto-login
                    // So for auto-login we assume the role is already set or we accept what's in DB
                    syncUserWithBackend(token);
                } catch (error) {
                    console.error("Error syncing user:", error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const syncUserWithBackend = async (token: string, desiredRole?: string, fullName?: string) => {
        try {
            // Use environment variable or fallback to localhost
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
            const backendUrl = `${apiUrl}/auth/sync-user`;

            const payload: any = {};
            if (desiredRole) payload.role = desiredRole;
            if (fullName) payload.fullName = fullName;

            const response = await axios.post(backendUrl, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 10000 // 10 second timeout
            });

            if (response.data && response.data.user) {
                setUser(response.data.user);
            } else {
                throw new Error("Backend did not return user data");
            }
        } catch (error: any) {
            console.error("Backend sync error:", error);
            
            // Better error messages
            if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
                throw new Error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc đảm bảo backend đang chạy.");
            }
            if (error.response?.status === 404) {
                throw new Error("API endpoint không tồn tại. Vui lòng kiểm tra cấu hình backend.");
            }
            if (error.response?.status === 401) {
                throw new Error("Token không hợp lệ. Vui lòng đăng nhập lại.");
            }
            
            // Propagate error to let the caller handle UI feedback
            throw new Error(error.response?.data?.message || error.message || "Không thể đồng bộ với server. Vui lòng thử lại.");
        }
    };

    const loginWithGoogle = async (role?: string) => {
        try {
            // Check if Firebase is properly configured
            if (!auth) {
                throw new Error("Firebase chưa được cấu hình. Vui lòng kiểm tra cấu hình Firebase.");
            }

            const result = await signInWithPopup(auth, googleProvider);
            const token = await result.user.getIdToken();

            // Explicitly sync with the selected role
            await syncUserWithBackend(token, role, result.user.displayName || undefined);

        } catch (error: any) {
            console.error("Google login error:", error);
            
            // Better error messages
            if (error.code === 'auth/popup-closed-by-user') {
                throw new Error("Bạn đã đóng cửa sổ đăng nhập. Vui lòng thử lại.");
            }
            if (error.code === 'auth/popup-blocked') {
                throw new Error("Trình duyệt đã chặn popup. Vui lòng cho phép popup và thử lại.");
            }
            if (error.code === 'auth/invalid-api-key') {
                throw new Error("Firebase API key không hợp lệ. Vui lòng kiểm tra cấu hình.");
            }
            
            throw error;
        }
    };

    const registerWithEmail = async (email: string, password: string, role?: string, fullName?: string) => {
        try {
            // Check if Firebase is properly configured
            if (!auth) {
                throw new Error("Firebase chưa được cấu hình. Vui lòng kiểm tra cấu hình Firebase.");
            }

            if (!fullName && role !== 'guest') {
                throw new Error("Vui lòng nhập họ và tên.");
            }

            const result = await createUserWithEmailAndPassword(auth, email, password);
            const token = await result.user.getIdToken();

            await syncUserWithBackend(token, role, fullName);
        } catch (error: any) {
            console.error("Email register error:", error);
            
            // Better error messages
            if (error.code === 'auth/email-already-in-use') {
                throw new Error("Email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.");
            }
            if (error.code === 'auth/invalid-email') {
                throw new Error("Email không hợp lệ. Vui lòng kiểm tra lại.");
            }
            if (error.code === 'auth/weak-password') {
                throw new Error("Mật khẩu quá yếu. Vui lòng sử dụng mật khẩu mạnh hơn (ít nhất 6 ký tự).");
            }
            if (error.code === 'auth/invalid-api-key') {
                throw new Error("Firebase API key không hợp lệ. Vui lòng kiểm tra cấu hình.");
            }
            
            throw error;
        }
    };

    const loginWithEmail = async (email: string, password: string, role?: string) => {
        try {
            // Check if Firebase is properly configured
            if (!auth) {
                throw new Error("Firebase chưa được cấu hình. Vui lòng kiểm tra cấu hình Firebase.");
            }

            if (!email || !password) {
                throw new Error("Vui lòng nhập đầy đủ email và mật khẩu.");
            }

            const result = await signInWithEmailAndPassword(auth, email, password);
            const token = await result.user.getIdToken();

            await syncUserWithBackend(token, role);
        } catch (error: any) {
            console.error("Email login error:", error);
            
            // Better error messages
            if (error.code === 'auth/user-not-found') {
                throw new Error("Không tìm thấy tài khoản với email này. Vui lòng kiểm tra lại hoặc đăng ký tài khoản mới.");
            }
            if (error.code === 'auth/wrong-password') {
                throw new Error("Sai mật khẩu. Vui lòng kiểm tra lại.");
            }
            if (error.code === 'auth/invalid-email') {
                throw new Error("Email không hợp lệ. Vui lòng kiểm tra lại.");
            }
            if (error.code === 'auth/invalid-api-key') {
                throw new Error("Firebase API key không hợp lệ. Vui lòng kiểm tra cấu hình.");
            }
            if (error.code === 'auth/too-many-requests') {
                throw new Error("Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau vài phút.");
            }
            
            throw error;
        }
    };


    const logout = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, registerWithEmail, loginWithEmail, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
