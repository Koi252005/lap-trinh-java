'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

export default function RetailerNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchNotifications();
    }, [user]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await axios.get('http://localhost:5001/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data.notifications);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            const token = await auth.currentUser?.getIdToken();
            await axios.put(`http://localhost:5001/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-8 text-center">Đang tải thông báo...</div>;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Thông Báo</h1>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center text-gray-500 py-10 bg-white dark:bg-gray-800 rounded shadow">
                        Bạn chưa có thông báo nào.
                    </div>
                ) : (
                    notifications.map(notif => (
                        <div
                            key={notif.id}
                            className={`p-4 rounded-lg shadow border-l-4 transition-all duration-200
                                ${notif.isRead
                                    ? 'bg-white dark:bg-gray-800 border-gray-300'
                                    : 'bg-blue-50 dark:bg-gray-700 border-blue-500'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className={`font-bold text-lg ${notif.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-blue-700 dark:text-blue-300'}`}>
                                        {notif.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-200 mt-1">{notif.message}</p>
                                    <span className="text-xs text-gray-400 mt-2 block">
                                        {new Date(notif.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                {!notif.isRead && (
                                    <button
                                        onClick={() => markAsRead(notif.id)}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold bg-white px-2 py-1 rounded border border-blue-200"
                                    >
                                        Đánh dấu đã đọc
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
