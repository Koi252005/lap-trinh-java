'use client';

export default function LoadingSpinner({ size = 'md', text }: { size?: 'sm' | 'md' | 'lg', text?: string }) {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className={`${sizeClasses[size]} relative`}>
                <div className="absolute inset-0 border-4 border-[#388E3C]/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-[#388E3C] rounded-full animate-spin"></div>
            </div>
            {text && (
                <p className="text-gray-600 font-medium animate-pulse">{text}</p>
            )}
        </div>
    );
}
