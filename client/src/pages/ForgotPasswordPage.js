import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useToast } from '../context/ToastContext';
import { ArrowLeftIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export const ForgotPasswordPage = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { showToast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        getValues,
    } = useForm();

    const onSubmit = async (data) => {
        try {
            // Здесь будет API вызов для отправки ссылки восстановления
            // Пока что имитируем успешную отправку
            console.log('Запрос восстановления пароля для:', data.email);

            // Имитация задержки запроса к серверу
            await new Promise((resolve) => setTimeout(resolve, 1500));

            setIsSubmitted(true);
            showToast('Инструкции по восстановлению пароля отправлены на email', 'success');
        } catch (error) {
            console.error('Ошибка восстановления пароля:', error);
            showToast('Произошла ошибка. Попробуйте позже', 'error');
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        {/* Иконка успеха */}
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <EnvelopeIcon className="w-8 h-8 text-green-600" />
                        </div>

                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Проверьте свою почту</h2>
                        <p className="text-gray-600 mb-6">
                            Мы отправили инструкции по восстановлению пароля на адрес{' '}
                            <span className="font-medium text-gray-900">{getValues('email')}</span>
                        </p>

                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Что дальше?</strong> Перейдите по ссылке в письме, чтобы создать новый
                                    пароль. Ссылка действительна в течение 24 часов.
                                </p>
                            </div>

                            <p className="text-sm text-gray-500">
                                Не получили письмо? Проверьте папку "Спам" или{' '}
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="text-blue-600 hover:text-blue-500 font-medium"
                                >
                                    попробуйте снова
                                </button>
                            </p>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeftIcon className="w-4 h-4 mr-2" />
                            Вернуться к входу
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Навигация назад */}
                <div className="text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Назад к входу
                    </Link>
                </div>

                {/* Заголовок */}
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl text-white">🔑</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Забыли пароль?</h2>
                    <p className="text-gray-600">
                        Не беспокойтесь! Введите свой email адрес, и мы отправим вам инструкции по восстановлению
                        доступа к аккаунту.
                    </p>
                </div>

                {/* Форма */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email адрес
                        </label>
                        <div className="relative">
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
                                className={`input-field pl-10 ${errors.email ? 'input-error' : ''}`}
                                placeholder="your@email.com"
                            />
                            <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                    </div>

                    {/* Кнопка отправки */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Отправляем...' : 'Отправить инструкции'}
                    </button>

                    {/* Дополнительная информация */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-600">
                            <strong>Важно:</strong> Ссылка для восстановления будет действительна только 24 часа. Если
                            вы не получили письмо в течение нескольких минут, проверьте папку "Спам" или свяжитесь с
                            поддержкой.
                        </p>
                    </div>

                    {/* Альтернативные варианты */}
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
