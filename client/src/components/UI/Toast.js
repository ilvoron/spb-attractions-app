import { useEffect } from 'react';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    InformationCircleIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';

export const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
    const typeConfig = {
        success: {
            icon: CheckCircleIcon,
            className: 'bg-green-50 text-green-800 border-green-200',
            iconColor: 'text-green-400',
            bgGradient: 'from-green-50 to-green-100',
        },
        error: {
            icon: XCircleIcon,
            className: 'bg-red-50 text-red-800 border-red-200',
            iconColor: 'text-red-400',
            bgGradient: 'from-red-50 to-red-100',
        },
        warning: {
            icon: ExclamationTriangleIcon,
            className: 'bg-yellow-50 text-yellow-800 border-yellow-200',
            iconColor: 'text-yellow-400',
            bgGradient: 'from-yellow-50 to-yellow-100',
        },
        info: {
            icon: InformationCircleIcon,
            className: 'bg-blue-50 text-blue-800 border-blue-200',
            iconColor: 'text-blue-400',
            bgGradient: 'from-blue-50 to-blue-100',
        },
    };

    const config = typeConfig[type];
    const Icon = config.icon;

    // Автоматически закрываем уведомление через указанное время
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose?.();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    return (
        <div className="toast-enter-active">
            <div
                className={`
                    relative w-full max-w-sm mx-auto
                    bg-gradient-to-br ${config.bgGradient}
                    shadow-lg rounded-lg border-2 ${config.className.split(' ').find((cls) => cls.includes('border-'))}
                    overflow-hidden
                    transform transition-all duration-300 ease-in-out
                    hover:shadow-xl hover:scale-105
                `}
                role="alert"
                aria-live="polite"
            >
                <div className="p-4">
                    <div className="flex items-start space-x-3">
                        {/* Иконка */}
                        <div className="flex-shrink-0 mt-0.5">
                            <Icon className={`w-5 h-5 ${config.iconColor}`} />
                        </div>

                        {/* Контент сообщения */}
                        <div className="flex-1 min-w-0 pr-2">
                            <p
                                className={`
                                text-sm font-medium leading-relaxed
                                ${config.className.split(' ').find((cls) => cls.includes('text-'))}
                                break-words hyphens-auto
                            `}
                            >
                                {message}
                            </p>
                        </div>

                        {/* Кнопка закрытия */}
                        <div className="flex-shrink-0 ml-2">
                            <button
                                onClick={onClose}
                                className={`
                                    inline-flex rounded-md p-1.5 
                                    ${config.iconColor} 
                                    hover:bg-black hover:bg-opacity-10 
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 
                                    ${
                                        type === 'success'
                                            ? 'focus:ring-green-500'
                                            : type === 'error'
                                            ? 'focus:ring-red-500'
                                            : type === 'warning'
                                            ? 'focus:ring-yellow-500'
                                            : 'focus:ring-blue-500'
                                    }
                                    transition-colors duration-200
                                `}
                                aria-label="Закрыть уведомление"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Прогресс-бар для визуализации времени до автозакрытия */}
                {duration > 0 && (
                    <div
                        className={`
                            h-1 bg-gradient-to-r 
                            ${
                                type === 'success'
                                    ? 'from-green-300 to-green-400'
                                    : type === 'error'
                                    ? 'from-red-300 to-red-400'
                                    : type === 'warning'
                                    ? 'from-yellow-300 to-yellow-400'
                                    : 'from-blue-300 to-blue-400'
                            }
                            animate-shrink-width
                        `}
                        style={{
                            animationDuration: `${duration}ms`,
                            animationFillMode: 'forwards',
                            animationTimingFunction: 'linear',
                        }}
                    />
                )}
            </div>
        </div>
    );
};

Toast.propTypes = {
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
    onClose: PropTypes.func,
    duration: PropTypes.number,
};
