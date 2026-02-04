/**
 * Base API URL - dùng chung cho toàn bộ app, tránh hardcode localhost
 */
export const getApiUrl = (): string => {
    if (typeof window !== 'undefined') {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
};

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
