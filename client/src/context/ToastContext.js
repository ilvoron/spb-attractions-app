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
        const id = Date.now() + Math.random(); // Более уникальный ID
        const newToast = { id, message, type, duration };

        setToasts((prev) => [...prev, newToast]);

        // Автоматически удаляем уведомление через указанное время
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    };

    // Функция для удаления уведомления
    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    // Функция для быстрого показа уведомлений разных типов
    const showSuccess = (message, duration = 4000) => showToast(message, 'success', duration);
    const showError = (message, duration = 6000) => showToast(message, 'error', duration); // Ошибки показываем дольше
    const showWarning = (message, duration = 5000) => showToast(message, 'warning', duration);
    const showInfo = (message, duration = 4000) => showToast(message, 'info', duration);

    return (
        <ToastContext.Provider
            value={{
                showToast,
                showSuccess,
                showError,
                showWarning,
                showInfo,
                removeToast,
            }}
        >
            {children}

            {/* Контейнер для отображения уведомлений с исправленной разметкой */}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <div key={toast.id} className="mb-2">
                        <Toast
                            message={toast.message}
                            type={toast.type}
                            duration={toast.duration}
                            onClose={() => removeToast(toast.id)}
                        />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
