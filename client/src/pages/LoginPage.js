import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Получаем путь, с которого пользователь был перенаправлен на страницу входа
    // Это важно для хорошего UX - после входа пользователь возвращается туда, откуда пришел
    const from = location.state?.from?.pathname || '/';

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm();

    const onSubmit = async (data) => {
        const result = await login(data.email, data.password);

        if (result.success) {
            // Перенаправляем пользователя туда, откуда он пришел, или на главную
            navigate(from, { replace: true });
        } else {
            // Показываем ошибку в форме
            setError('root', {
                type: 'manual',
                message: result.message,
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Заголовок */}
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl text-white">🏛️</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Вход в систему</h2>
                    <p className="text-gray-600">
                        Войдите в свой аккаунт, чтобы получить доступ к дополнительным возможностям
                    </p>
                </div>

                {/* Форма */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {/* Общая ошибка - отображается при неправильном логине/пароле */}
                    {errors.root && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {errors.root.message}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email адрес
                            </label>
                            <input
                                {...register('email', {
                                    required: 'Email адрес обязателен',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Некорректный формат email адреса',
                                    },
                                })}
                                type="email"
                                autoComplete="email"
                                className={`input-field ${errors.email ? 'input-error' : ''}`}
                                placeholder="your@email.com"
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                        </div>

                        {/* Пароль */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Пароль
                                </label>
                                {/* Ключевое добавление: ссылка на восстановление пароля
                                    Размещаем её рядом с лейблом пароля, где пользователи ожидают её увидеть */}
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                                >
                                    Забыли пароль?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    {...register('password', {
                                        required: 'Пароль обязателен',
                                        minLength: {
                                            value: 6,
                                            message: 'Пароль должен содержать минимум 6 символов',
                                        },
                                    })}
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    className={`input-field pr-10 ${errors.password ? 'input-error' : ''}`}
                                    placeholder="Введите пароль"
                                />
                                {/* Кнопка показа/скрытия пароля - важный элемент UX
                                    Многие пользователи предпочитают видеть что они печатают */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="w-5 h-5" />
                                    ) : (
                                        <EyeIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                        </div>
                    </div>

                    {/* Кнопка входа */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Вход...' : 'Войти'}
                    </button>

                    {/* Ссылка на регистрацию */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Нет аккаунта?{' '}
                            <Link
                                to="/register"
                                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                            >
                                Зарегистрироваться
                            </Link>
                        </p>
                    </div>
                </form>

                {/* Демо данные - полезно для разработки и демонстрации
                    В продакшне этот блок следует убрать из соображений безопасности */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-2 font-medium">Для демонстрации можете использовать:</p>
                    <div className="space-y-1 text-xs text-gray-500">
                        <p>
                            <strong>Администратор:</strong> admin@spb-attractions.ru
                        </p>
                        <p>
                            <strong>Пароль:</strong> admin123
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
