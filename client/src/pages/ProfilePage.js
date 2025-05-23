import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { UserIcon, EnvelopeIcon, KeyIcon, HeartIcon, CalendarIcon } from '@heroicons/react/24/outline';

export const ProfilePage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('info');
    const [isEditing, setIsEditing] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            email: user?.email || '',
        },
    });

    const onSubmit = async (data) => {
        console.log('Обновление профиля:', data);
        // Здесь будет API вызов для обновления профиля
        setIsEditing(false);
    };

    const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
        <button
            onClick={() => onClick(id)}
            className={`flex items-center px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                isActive ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
        >
            <Icon className="w-5 h-5 mr-2" />
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Заголовок */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <div className="flex items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-6">
                            <UserIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">Личный кабинет</h1>
                            <p className="text-gray-600">{user?.email}</p>
                            {user?.role === 'admin' && (
                                <span className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded mt-2">
                                    Администратор
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Табы */}
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <div className="flex space-x-4">
                            <TabButton
                                id="info"
                                label="Информация"
                                icon={UserIcon}
                                isActive={activeTab === 'info'}
                                onClick={setActiveTab}
                            />
                            <TabButton
                                id="favorites"
                                label="Избранное"
                                icon={HeartIcon}
                                isActive={activeTab === 'favorites'}
                                onClick={setActiveTab}
                            />
                            <TabButton
                                id="security"
                                label="Безопасность"
                                icon={KeyIcon}
                                isActive={activeTab === 'security'}
                                onClick={setActiveTab}
                            />
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Информация о профиле */}
                        {activeTab === 'info' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900">Информация о профиле</h2>
                                    <button onClick={() => setIsEditing(!isEditing)} className="btn-secondary">
                                        {isEditing ? 'Отмена' : 'Редактировать'}
                                    </button>
                                </div>

                                {isEditing ? (
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email адрес
                                            </label>
                                            <input
                                                {...register('email', {
                                                    required: 'Email обязателен',
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                        message: 'Некорректный формат email',
                                                    },
                                                })}
                                                type="email"
                                                className={`input-field ${errors.email ? 'input-error' : ''}`}
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                            )}
                                        </div>

                                        <div className="flex space-x-4">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="btn-primary disabled:opacity-50"
                                            >
                                                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="btn-secondary"
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center">
                                            <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Email</p>
                                                <p className="text-sm text-gray-600">{user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Дата регистрации</p>
                                                <p className="text-sm text-gray-600">
                                                    {user?.createdAt
                                                        ? new Date(user.createdAt).toLocaleDateString('ru-RU')
                                                        : 'Недоступно'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Роль</p>
                                                <p className="text-sm text-gray-600">
                                                    {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Избранное */}
                        {activeTab === 'favorites' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900">Избранные места</h2>

                                <div className="text-center py-12">
                                    <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        У вас пока нет избранных мест
                                    </h3>
                                    <p className="text-gray-600">
                                        Добавляйте достопримечательности в избранное, чтобы они появились здесь
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Безопасность */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900">Настройки безопасности</h2>

                                <div className="space-y-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-medium text-gray-900 mb-2">Смена пароля</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Рекомендуется регулярно менять пароль для обеспечения безопасности аккаунта
                                        </p>
                                        <button className="btn-secondary">Изменить пароль</button>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-medium text-gray-900 mb-2">Активные сессии</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Управляйте устройствами, с которых осуществлен вход в ваш аккаунт
                                        </p>
                                        <button className="btn-secondary">Управление сессиями</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
