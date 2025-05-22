import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../UI/LoadingSpinner';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading, isAdmin } = useAuth();
    const location = useLocation();

    // Показываем спиннер загрузки, пока проверяем аутентификацию
    if (loading) {
        return <LoadingSpinner />;
    }

    // Если пользователь не авторизован, перенаправляем на страницу входа
    // Сохраняем текущий путь, чтобы вернуть пользователя сюда после входа
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Если нужны права администратора, но у пользователя их нет
    if (adminOnly && !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🚫</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Доступ запрещен</h2>
                    <p className="text-gray-600 mb-6">
                        У вас нет прав для просмотра этой страницы. Для доступа к администраторской панели требуются
                        права администратора.
                    </p>
                    <Navigate to="/" replace />
                </div>
            </div>
        );
    }

    // Если все проверки пройдены, отображаем защищенный контент
    return children;
};

export default ProtectedRoute;
