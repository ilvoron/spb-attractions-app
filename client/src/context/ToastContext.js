import React, { createContext, useContext, useState } from 'react';
import Toast from '../components/UI/Toast';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast должен использоваться внутри ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    // Функция для показа нового уведомления
    const showToast = (message, type = 'info', duration = 4000) => {
        const id = Date.now();
        const newToast = { id, message, type, duration };

        setToasts((prev) => [...prev, newToast]);

        // Автоматически удаляем уведомление через указанное время
        setTimeout(() => {
            removeToast(id);
        }, duration);
    };

    // Функция для удаления уведомления
    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Контейнер для отображения уведомлений */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};
