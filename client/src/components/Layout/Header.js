import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapPinIcon, UserIcon, Cog6ToothIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Header = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    return (
        <header className="bg-white shadow-lg sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Логотип и название */}
                    <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <MapPinIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-bold text-gray-900">СПб Достопримечательности</h1>
                            <p className="text-sm text-gray-600">Откройте красоту Северной столицы</p>
                        </div>
                    </Link>

                    {/* Десктопная навигация */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                            Главная
                        </Link>
                        <Link
                            to="/categories"
                            className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                        >
                            Категории
                        </Link>
                        {isAdmin && (
                            <Link
                                to="/admin"
                                className="text-purple-600 hover:text-purple-800 font-medium transition-colors flex items-center"
                            >
                                <Cog6ToothIcon className="w-5 h-5 mr-1" />
                                Админ панель
                            </Link>
                        )}
                    </nav>

                    {/* Аутентификация и мобильное меню */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <div className="hidden md:flex items-center space-x-3">
                                    <div className="flex items-center space-x-2">
                                        <UserIcon className="w-5 h-5 text-gray-600" />
                                        <span className="text-sm text-gray-700">{user.email}</span>
                                        {user.role === 'admin' && (
                                            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                                                Администратор
                                            </span>
                                        )}
                                    </div>
                                    <Link to="/profile" className="btn-secondary text-sm">
                                        Профиль
                                    </Link>
                                    <button onClick={handleLogout} className="btn-danger text-sm">
                                        Выйти
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="hidden md:flex items-center space-x-3">
                                <Link
                                    to="/login"
                                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                >
                                    Войти
                                </Link>
                                <Link to="/register" className="btn-primary">
                                    Регистрация
                                </Link>
                            </div>
                        )}

                        {/* Кнопка мобильного меню */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                            {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Мобильное меню */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200">
                        <div className="space-y-2">
                            <Link
                                to="/"
                                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Главная
                            </Link>
                            <Link
                                to="/categories"
                                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Категории
                            </Link>
                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    className="block px-3 py-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-md transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Админ панель
                                </Link>
                            )}

                            <div className="border-t border-gray-200 pt-2 mt-2">
                                {user ? (
                                    <>
                                        <div className="px-3 py-2 text-sm text-gray-600">
                                            Вы вошли как: <span className="font-medium">{user.email}</span>
                                        </div>
                                        <Link
                                            to="/profile"
                                            className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Профиль
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                                        >
                                            Выйти
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            className="block px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Войти
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="block px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Регистрация
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
