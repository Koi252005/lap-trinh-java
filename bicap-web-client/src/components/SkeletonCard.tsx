'use client';

export default function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-5 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="flex justify-between items-center pt-4">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-10 bg-gray-200 rounded-xl w-24"></div>
                </div>
            </div>
        </div>
    );
}
