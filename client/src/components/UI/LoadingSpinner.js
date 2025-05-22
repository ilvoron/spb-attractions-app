import React from 'react';

const LoadingSpinner = ({ size = 'md', message = 'Загрузка...' }) => {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-64">
            <div
                className={`${sizeClasses[size]} border-4 border-blue-500 border-t-transparent rounded-full animate-spin`}
            ></div>
            {message && <p className="mt-4 text-gray-600 text-center">{message}</p>}
        </div>
    );
};

export default LoadingSpinner;
