import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { api } from '../services/api';

/**
 * Страница сброса пароля
 * Файл: client/src/pages/ResetPasswordPage.js
 *
 * Эта страница открывается, когда пользователь переходит по ссылке из email
 * для восстановления пароля. URL содержит токен и email в query параметрах.
 *
 * Процесс работы:
 * 1. Извлекаем токен и email из URL
 * 2. Проверяем действительность токена на сервере
 * 3. Если токен действителен, показываем форму для нового пароля
 * 4. Если токен недействителен или истек, показываем ошибку
 */
export const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Извлекаем параметры из URL
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    // Состояния компонента
    const [isValidatingToken, setIsValidatingToken] = useState(true);
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [tokenError, setTokenError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        setError,
    } = useForm();

    // Наблюдаем за паролем для валидации подтверждения
    const password = watch('password');

    // Проверяем токен при загрузке компонента
    useEffect(() => {
        const validateToken = async () => {
            // Проверяем наличие обязательных параметров
            if (!token || !email) {
                setTokenError('Отсутствуют необходимые параметры. Проверьте ссылку из email.');
                setIsValidatingToken(false);
                return;
            }

            try {
                console.log('Проверяем токен восстановления пароля...');

                const response = await api.get('/auth/validate-reset-token', {
                    params: { token, email },
                });

                if (response.data.success) {
                    setIsTokenValid(true);
                    console.log('Токен действителен');
                } else {
                    setTokenError(response.data.message || 'Токен недействителен');
                }
            } catch (error) {
                console.error('Ошибка при проверке токена:', error);
                const message =
                    error.response?.data?.message || 'Ошибка при проверке токена. Возможно, ссылка устарела.';
                setTokenError(message);
            } finally {
                setIsValidatingToken(false);
            }
        };

        validateToken();
    }, [token, email]);

    // Обработчик отправки формы
    const onSubmit = async (data) => {
        try {
            console.log('Отправляем запрос на сброс пароля...');

            const response = await api.post('/auth/reset-password', {
                token,
                email,
                newPassword: data.password,
            });

            if (response.data.success) {
                setIsSuccess(true);
                showToast('Пароль успешно изменен!', 'success');

                // Через 3 секунды перенаправляем на страницу входа
                setTimeout(() => {
                    navigate('/login', {
                        state: {
                            message: 'Пароль изменен. Теперь вы можете войти с новым паролем.',
                        },
                    });
                }, 3000);
            } else {
                setError('root', {
                    type: 'manual',
                    message: response.data.message || 'Ошибка при изменении пароля',
                });
            }
        } catch (error) {
            console.error('Ошибка при сбросе пароля:', error);
            const message = error.response?.data?.message || 'Произошла ошибка при изменении пароля';
            setError('root', {
                type: 'manual',
                message,
            });
        }
    };

    // Показываем загрузку во время проверки токена
    if (isValidatingToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">Проверяем ссылку восстановления пароля...</p>
                </div>
            </div>
        );
    }

    // Показываем ошибку, если токен недействителен
    if (!isTokenValid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Недействительная ссылка</h2>
                        <p className="text-gray-600 mb-6">{tokenError}</p>

                        <div className="space-y-4">
                            <Link to="/forgot-password" className="btn-primary block">
                                Запросить новую ссылку
                            </Link>
                            <Link to="/login" className="btn-secondary block">
                                Вернуться к входу
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Показываем сообщение об успехе
    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircleIcon className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Пароль изменен!</h2>
                        <p className="text-gray-600 mb-6">
                            Ваш пароль был успешно изменен. Через несколько секунд вы будете перенаправлены на страницу
                            входа, где сможете войти с новым паролем.
                        </p>
                        <Link to="/login" className="btn-primary">
                            Войти в систему
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Основная форма сброса пароля
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Заголовок */}
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl text-white">🔐</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Создание нового пароля</h2>
                    <p className="text-gray-600">
                        Введите новый пароль для вашего аккаунта{' '}
                        <span className="font-medium text-gray-900">{email}</span>
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
                        {/* Новый пароль */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Новый пароль
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
                                    className={`input-field pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                                    placeholder="Повторите новый пароль"
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

                    {/* Требования к паролю */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800 mb-2">
                            <strong>Требования к паролю:</strong>
                        </p>
                        <ul className="text-xs text-blue-700 space-y-1">
                            <li>• Минимум 6 символов</li>
                            <li>• Хотя бы одна строчная буква (a-z)</li>
                            <li>• Хотя бы одна заглавная буква (A-Z)</li>
                            <li>• Хотя бы одна цифра (0-9)</li>
                        </ul>
                    </div>

                    {/* Кнопка отправки */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Изменяем пароль...' : 'Изменить пароль'}
                    </button>

                    {/* Дополнительные ссылки */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Вспомнили пароль?{' '}
                            <Link
                                to="/login"
                                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                            >
                                Войти в аккаунт
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};
