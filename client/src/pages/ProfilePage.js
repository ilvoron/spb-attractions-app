import { useAuth } from '../context/AuthContext';
import { UserIcon, EnvelopeIcon, CalendarIcon } from '@heroicons/react/24/outline';

export const ProfilePage = () => {
    const { user } = useAuth();

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

                {/* Информация о профиле */}
                <div className="p-6 bg-white rounded-xl shadow-sm space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Информация о профиле</h2>

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
                </div>
            </div>
        </div>
    );
};
