import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const RegisterPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        watch,
    } = useForm();

    // Наблюдаем за паролем для валидации подтверждения
    const password = watch('password');

    const onSubmit = async (data) => {
        const result = await registerUser(data.email, data.password);

        if (result.success) {
            navigate('/', { replace: true });
        } else {
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
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl text-white">👋</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Создать аккаунт</h2>
                    <p className="text-gray-600">
                        Зарегистрируйтесь, чтобы сохранять избранные места и получать персональные рекомендации
                    </p>
                </div>

                {/* Форма */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {/* Общая ошибка */}
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
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Пароль
                            </label>
                            <div className="relative">
                                <input
                                    {...register('password', {
                                        required: 'Пароль обязателен',
                                        minLength: {
                                            value: 6,
                                            message: 'Пароль должен содержать минимум 6 символов',
                                        },
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                            message:
                                                'Пароль должен содержать строчные и заглавные буквы, а также цифры',
                                        },
                                    })}
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    className={`input-field pr-10 ${errors.password ? 'input-error' : ''}`}
                                    placeholder="Создайте надежный пароль"
                                />
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
                            <p className="mt-1 text-xs text-gray-500">
                                Минимум 6 символов, включая заглавные и строчные буквы, цифры
                            </p>
                        </div>

                        {/* Подтверждение пароля */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Подтвердите пароль
                            </label>
                            <div className="relative">
                                <input
                                    {...register('confirmPassword', {
                                        required: 'Подтверждение пароля обязательно',
                                        validate: (value) => value === password || 'Пароли не совпадают',
                                    })}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    className={`input-field pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                                    placeholder="Повторите пароль"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? (
                                        <EyeSlashIcon className="w-5 h-5" />
                                    ) : (
                                        <EyeIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Кнопка регистрации */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Создание аккаунта...' : 'Создать аккаунт'}
                    </button>

                    {/* Ссылка на вход */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Уже есть аккаунт?{' '}
                            <Link
                                to="/login"
                                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                            >
                                Войти
                            </Link>
                        </p>
                    </div>
                </form>

                {/* Соглашение */}
                <p className="text-xs text-gray-500 text-center">
                    Регистрируясь, вы соглашаетесь с условиями использования данного учебного проекта
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
