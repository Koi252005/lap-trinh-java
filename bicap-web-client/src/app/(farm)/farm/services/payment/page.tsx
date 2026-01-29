'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import axios from 'axios';

function PaymentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const packageId = searchParams.get('package');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Form inputs
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [focus, setFocus] = useState(''); // To track focus for card flip effect (optional, simplified here)

    // Derived state for Card UI
    const cardType = cardNumber.startsWith('4') ? 'Visa' : cardNumber.startsWith('5') ? 'Mastercard' : 'Card';

    useEffect(() => {
        if (!packageId) {
            router.push('/farm/services');
            return;
        }

        axios.get('http://localhost:5001/api/subscriptions/packages')
            .then(res => {
                const pkg = res.data.find((p: any) => p.id === packageId);
                if (pkg) setSelectedPackage(pkg);
                else setError('Gói dịch vụ không tồn tại');
            });
    }, [packageId, router]);

    // Formatters
    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').substring(0, 16);
        const formatted = val.replace(/(\d{4})/g, '$1 ').trim();
        setCardNumber(formatted);
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (val.length >= 2) {
            setExpiry(`${val.substring(0, 2)}/${val.substring(2)}`);
        } else {
            setExpiry(val);
        }
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simple validation for Demo (relaxed)
        if (cardNumber.replace(/\s/g, '').length < 4) {
            setError('Vui lòng nhập số thẻ (Demo: nhập ít nhất 4 số)');
            setLoading(false);
            return;
        }

        try {
            const token = await auth?.currentUser?.getIdToken();
            if (!token) throw new Error("Vui lòng đăng nhập lại");

            // Call Backend Mock Payment
            await axios.post('http://localhost:5001/api/subscriptions/subscribe', {
                packageId: packageId,
                paymentDetails: {
                    cardNumber,
                    cardName: cardName.toUpperCase(),
                    expiry,
                    cvc
                }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Show success modal
            setShowSuccess(true);

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi thanh toán');
        } finally {
            setLoading(false);
        }
    };

    if (!selectedPackage && !error) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Đang tải thông tin...</div>;
    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="text-red-500 font-bold mb-4">{error}</div>
            <button onClick={() => router.push('/farm/services')} className="text-blue-600 underline">Quay lại</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans">

            {/* Success Modal Overlay */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity duration-500 ease-out">

                    {/* Confetti Effect (CSS only simple version or imagine particles) */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rotate-45 animate-bounce" style={{ animationDuration: '1s' }}></div>
                        <div className="absolute top-0 right-1/4 w-2 h-2 bg-blue-400 rotate-45 animate-bounce" style={{ animationDuration: '1.5s', animationDelay: '0.2s' }}></div>
                        <div className="absolute top-10 left-1/2 w-3 h-3 bg-red-400 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full relative transform scale-100 transition-all duration-500 animate-[fadeInUp_0.5s_ease-out] overflow-hidden">
                        {/* Decorative Header */}
                        <div className="bg-gradient-to-r from-green-400 to-green-600 h-32 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-white/10 opacity-50 backdrop-blur-sm"></div>
                            <div className="bg-white p-4 rounded-full shadow-lg relative z-10 animate-[bounce_1s_infinite]">
                                <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        <div className="p-8 pb-10 text-center">
                            <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mb-2">
                                Giao Dịch Hoàn Tất!
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">
                                Gói dịch vụ đã được kích hoạt thành công. Cảm ơn bạn đã đồng hành cùng BICAP!
                            </p>

                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 mb-8 border border-gray-100 dark:border-gray-600 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>

                                <div className="flex justify-between items-center mb-3 relative z-10">
                                    <span className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wide">Gói dịch vụ</span>
                                    <span className="font-bold text-gray-900 dark:text-white text-lg">{selectedPackage.name}</span>
                                </div>
                                <div className="w-full border-t border-gray-200 dark:border-gray-600 my-3 border-dashed"></div>
                                <div className="flex justify-between items-center relative z-10">
                                    <span className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wide">Tổng thanh toán</span>
                                    <span className="font-extrabold text-2xl text-green-600 dark:text-green-400">
                                        {selectedPackage.price.toLocaleString('vi-VN')} đ
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push('/farm')}
                                className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 transition-all transform hover:-translate-y-1 hover:shadow-xl focus:ring-4 focus:ring-green-500/50"
                            >
                                Truy cập Dashboard Ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start transition-all duration-500 ${showSuccess ? 'blur-sm opacity-50 pointer-events-none' : ''}`}>

                {/* Visual Credit Card Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Thông tin thanh toán</h2>

                    {/* The Card */}
                    <div className="relative w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-gray-800 to-black text-white p-8 shadow-2xl overflow-hidden transform transition-transform hover:scale-105 duration-300">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-48 h-48 bg-green-500/20 rounded-full blur-3xl"></div>

                        {/* Chip */}
                        <div className="w-12 h-10 border border-yellow-600 bg-yellow-400/20 rounded-md flex items-center justify-center mb-6 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/40 to-yellow-600/40"></div>
                            <div className="w-full h-[1px] bg-yellow-600/50 absolute top-1/2 -translate-y-1/2"></div>
                            <div className="h-full w-[1px] bg-yellow-600/50 absolute left-1/2 -translate-x-1/2"></div>
                            <div className="border border-yellow-600 rounded-sm w-6 h-6 z-10"></div>
                        </div>

                        {/* Contactless Icon */}
                        <div className="absolute top-8 right-8">
                            <svg className="w-8 h-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                            </svg>
                        </div>

                        {/* Card Number */}
                        <div className="text-2xl md:text-3xl font-mono tracking-widest mb-6 drop-shadow-md min-h-[40px]">
                            {cardNumber || '•••• •••• •••• ••••'}
                        </div>

                        {/* Footer Info */}
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Card Holder</p>
                                <p className="font-medium text-lg uppercase tracking-wide truncate max-w-[200px]">
                                    {cardName || 'YOUR NAME'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Expires</p>
                                <p className="font-medium text-lg tracking-wide">
                                    {expiry || 'MM/YY'}
                                </p>
                            </div>
                        </div>

                        {/* Logo */}
                        <div className="absolute bottom-8 right-8 text-xl font-bold italic opacity-80">
                            {cardType}
                        </div>
                    </div>

                    {/* Package Summary */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Gói dịch vụ đã chọn</h3>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedPackage.name}</p>
                                <p className="text-green-600 font-medium">{selectedPackage.durationMonths} tháng</p>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {selectedPackage.price.toLocaleString('vi-VN')} đ
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200">Nhập thông tin thẻ</h3>
                    <form onSubmit={handlePayment} className="space-y-5">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số thẻ</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={cardNumber}
                                    onChange={handleCardNumberChange}
                                    onFocus={() => setFocus('number')}
                                    placeholder="0000 0000 0000 0000"
                                    maxLength={19}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên chủ thẻ</label>
                            <input
                                type="text"
                                value={cardName}
                                onChange={e => setCardName(e.target.value)}
                                onFocus={() => setFocus('name')}
                                placeholder="NGUYEN VAN A"
                                className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày hết hạn</label>
                                <input
                                    type="text"
                                    value={expiry}
                                    onChange={handleExpiryChange}
                                    onFocus={() => setFocus('expiry')}
                                    placeholder="MM/YY"
                                    maxLength={5}
                                    className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mã CVC</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={cvc}
                                        onChange={e => setCvc(e.target.value.replace(/\D/g, '').substring(0, 3))}
                                        onFocus={() => setFocus('cvc')}
                                        placeholder="123"
                                        maxLength={3}
                                        className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none group">
                                        <svg className="h-5 w-5 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500/50 disabled:opacity-50 transition-all transform active:scale-95"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý...
                                    </span>
                                ) : (
                                    `Thanh Toán Ngay`
                                )}
                            </button>
                            <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                                Thông tin được mã hóa bảo mật.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
            <PaymentContent />
        </Suspense>
    );
}
