import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    InformationCircleIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
    const typeConfig = {
        success: {
            icon: CheckCircleIcon,
            className: 'bg-green-50 text-green-800 border-green-200',
            iconColor: 'text-green-400',
        },
        error: {
            icon: XCircleIcon,
            className: 'bg-red-50 text-red-800 border-red-200',
            iconColor: 'text-red-400',
        },
        warning: {
            icon: ExclamationTriangleIcon,
            className: 'bg-yellow-50 text-yellow-800 border-yellow-200',
            iconColor: 'text-yellow-400',
        },
        info: {
            icon: InformationCircleIcon,
            className: 'bg-blue-50 text-blue-800 border-blue-200',
            iconColor: 'text-blue-400',
        },
    };

    const config = typeConfig[type];
    const Icon = config.icon;

    return (
        <div
            className={`max-w-sm w-full shadow-lg rounded-lg pointer-events-auto border ${config.className} animate-slide-in-right`}
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <Icon className={`w-6 h-6 ${config.iconColor}`} />
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium">{message}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            onClick={onClose}
                            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Toast;
