'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';

interface Report {
    id: number;
    title: string;
    content: string;
    type: string;
    createdAt: string;
    sender: {
        fullName: string;
        email: string;
        role: string;
    };
}

export default function FarmReportManager() {
    const { user } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('incident'); // incident, feedback
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) fetchReports();
    }, [user]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await axios.get('http://localhost:5001/api/reports', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReports(res.data.reports);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            await axios.post('http://localhost:5001/api/reports', {
                title,
                content,
                type
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Gửi báo cáo thành công!');
            setTitle('');
            setContent('');
            fetchReports(); // Reload list
        } catch (error) {
            console.error(error);
            alert('Lỗi gửi báo cáo');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Form */}
            <div className="md:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow h-fit">
                <h2 className="text-xl font-bold mb-4">Gửi Báo Cáo / Phản Hồi</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Loại</label>
                        <select
                            className="w-full border p-2 rounded"
                            value={type}
                            onChange={e => setType(e.target.value)}
                        >
                            <option value="incident">Sự cố</option>
                            <option value="feedback">Góp ý</option>
                            <option value="other">Khác</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Nội dung</label>
                        <textarea
                            className="w-full border p-2 rounded h-32"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-red-600 text-white font-bold py-2 rounded hover:bg-red-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Đang gửi...' : 'Gửi Báo Cáo'}
                    </button>
                </form>
            </div>

            {/* Right Column: List */}
            <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Danh Sách Báo Cáo</h2>
                <div className="space-y-4">
                    {reports.length === 0 ? (
                        <p className="text-gray-500 text-center">Chưa có báo cáo nào.</p>
                    ) : (
                        reports.map(report => (
                            <div key={report.id} className="border-l-4 border-red-500 bg-gray-50 dark:bg-gray-900 p-4 rounded shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-red-700">{report.title}</h3>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {new Date(report.createdAt).toLocaleString()} |
                                            <span className="font-semibold ml-1">{report.sender.fullName} ({report.sender.role})</span>
                                        </p>
                                        <p className="text-gray-800 dark:text-gray-200">{report.content}</p>
                                    </div>
                                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded uppercase font-bold">
                                        {report.type}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
