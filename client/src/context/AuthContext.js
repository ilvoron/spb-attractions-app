import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';

// Создаем контекст для управления состоянием аутентификации
// Контекст - это как "общая память" приложения, доступная всем компонентам
const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth должен использоваться внутри AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // При загрузке приложения проверяем, есть ли сохраненный токен
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    // Проверяем валидность токена на сервере
                    const userData = await authService.getCurrentUser();
                    setUser(userData);
                }
            } catch (error) {
                // Если токен недействителен, удаляем его
                localStorage.removeItem('token');
                console.error('Ошибка восстановления сессии:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Функция входа в систему
    const login = async (email, password) => {
        try {
            const response = await authService.login(email, password);

            // Сохраняем токен и информацию о пользователе
            localStorage.setItem('token', response.token);
            setUser(response.user);

            showToast('Успешный вход в систему!', 'success');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Ошибка входа в систему';
            showToast(message, 'error');
            return { success: false, message };
        }
    };

    // Функция регистрации
    const register = async (email, password) => {
        try {
            const response = await authService.register(email, password);

            localStorage.setItem('token', response.token);
            setUser(response.user);

            showToast('Регистрация прошла успешно!', 'success');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Ошибка регистрации';
            showToast(message, 'error');
            return { success: false, message };
        }
    };

    // Функция выхода из системы
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        showToast('Вы успешно вышли из системы', 'info');
    };

    // Проверяем, является ли пользователь администратором
    const isAdmin = user?.role === 'admin';
    const isAuthenticated = !!user;

    const value = {
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated,
        isAdmin,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
