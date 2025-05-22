import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import attractionService from '../services/attractionService';
import categoryService from '../services/categoryService';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import {
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    MapPinIcon,
    ChartBarIcon,
    UsersIcon,
    PhotoIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');

    // Получаем данные для дашборда
    const { data: attractions, isLoading: attractionsLoading } = useQuery({
        queryKey: ['admin-attractions'],
        queryFn: () => attractionService.getAttractions({ limit: 50 }),
    });

    const { data: categories, isLoading: categoriesLoading } = useQuery({
        queryKey: ['admin-categories'],
        queryFn: categoryService.getCategories,
    });

    const attractionsList = attractions?.attractions || [];
    const categoriesList = categories || [];

    // Статистика
    const totalAttractions = attractionsList.length;
    const publishedAttractions = attractionsList.filter((a) => a.isPublished).length;
    const draftAttractions = totalAttractions - publishedAttractions;
    const accessibleAttractions = attractionsList.filter((a) => a.wheelchairAccessible).length;

    const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-lg bg-${color}-100`}>
                    <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );

    const TabButton = ({ id, label, isActive, onClick }) => (
        <button
            onClick={() => onClick(id)}
            className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                isActive ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
        >
            {label}
        </button>
    );

    if (attractionsLoading || categoriesLoading) {
        return <LoadingSpinner size="lg" message="Загружаем панель администратора..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Заголовок */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Панель администратора</h1>
                    <p className="text-gray-600">Управление достопримечательностями и контентом сайта</p>
                </div>

                {/* Быстрые действия */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Link to="/admin/attractions/create" className="btn-primary flex items-center justify-center">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Добавить место
                    </Link>
                    <button className="btn-secondary flex items-center justify-center">
                        <PhotoIcon className="w-5 h-5 mr-2" />
                        Управление фото
                    </button>
                    <button className="btn-secondary flex items-center justify-center">
                        <UsersIcon className="w-5 h-5 mr-2" />
                        Пользователи
                    </button>
                    <button className="btn-secondary flex items-center justify-center">
                        <ChartBarIcon className="w-5 h-5 mr-2" />
                        Аналитика
                    </button>
                </div>

                {/* Статистика */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Всего мест" value={totalAttractions} icon={MapPinIcon} color="blue" />
                    <StatCard title="Опубликовано" value={publishedAttractions} icon={EyeIcon} color="green" />
                    <StatCard title="Черновики" value={draftAttractions} icon={PencilIcon} color="yellow" />
                    <StatCard title="Доступные места" value={accessibleAttractions} icon={UsersIcon} color="purple" />
                </div>

                {/* Табы */}
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <div className="flex space-x-4">
                            <TabButton
                                id="overview"
                                label="Обзор"
                                isActive={activeTab === 'overview'}
                                onClick={setActiveTab}
                            />
                            <TabButton
                                id="attractions"
                                label="Достопримечательности"
                                isActive={activeTab === 'attractions'}
                                onClick={setActiveTab}
                            />
                            <TabButton
                                id="categories"
                                label="Категории"
                                isActive={activeTab === 'categories'}
                                onClick={setActiveTab}
                            />
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Обзор */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900">Последние добавленные места</h2>
                                <div className="space-y-4">
                                    {attractionsList.slice(0, 5).map((attraction) => (
                                        <div
                                            key={attraction.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                                                    <MapPinIcon className="w-6 h-6 text-gray-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{attraction.name}</h3>
                                                    <p className="text-sm text-gray-600">{attraction.category?.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span
                                                    className={`px-2 py-1 text-xs rounded-full ${
                                                        attraction.isPublished
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                                >
                                                    {attraction.isPublished ? 'Опубликовано' : 'Черновик'}
                                                </span>
                                                <Link
                                                    to={`/attractions/${attraction.id}`}
                                                    className="p-2 text-gray-400 hover:text-gray-600"
                                                    title="Просмотреть"
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    to={`/admin/attractions/${attraction.id}/edit`}
                                                    className="p-2 text-gray-400 hover:text-blue-600"
                                                    title="Редактировать"
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Достопримечательности */}
                        {activeTab === 'attractions' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900">Все достопримечательности</h2>
                                    <Link to="/admin/attractions/create" className="btn-primary">
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Добавить
                                    </Link>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Название
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Категория
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Статус
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Дата создания
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Действия
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {attractionsList.map((attraction) => (
                                                <tr key={attraction.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {attraction.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {attraction.address}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white"
                                                            style={{ backgroundColor: attraction.category?.color }}
                                                        >
                                                            {attraction.category?.name}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                attraction.isPublished
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                            }`}
                                                        >
                                                            {attraction.isPublished ? 'Опубликовано' : 'Черновик'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(attraction.createdAt).toLocaleDateString('ru-RU')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <Link
                                                                to={`/attractions/${attraction.id}`}
                                                                className="text-gray-400 hover:text-gray-600"
                                                                title="Просмотреть"
                                                            >
                                                                <EyeIcon className="w-4 h-4" />
                                                            </Link>
                                                            <Link
                                                                to={`/admin/attractions/${attraction.id}/edit`}
                                                                className="text-blue-400 hover:text-blue-600"
                                                                title="Редактировать"
                                                            >
                                                                <PencilIcon className="w-4 h-4" />
                                                            </Link>
                                                            <button
                                                                className="text-red-400 hover:text-red-600"
                                                                title="Удалить"
                                                                onClick={() => {
                                                                    if (
                                                                        window.confirm(
                                                                            'Вы уверены, что хотите удалить эту достопримечательность?'
                                                                        )
                                                                    ) {
                                                                        // Здесь будет логика удаления
                                                                        console.log(
                                                                            'Удаление достопримечательности',
                                                                            attraction.id
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Категории */}
                        {activeTab === 'categories' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900">Категории</h2>
                                    <button className="btn-primary">
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Добавить категорию
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {categoriesList.map((category) => (
                                        <div key={category.id} className="bg-gray-50 rounded-lg p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div
                                                    className="w-4 h-4 rounded-full"
                                                    style={{ backgroundColor: category.color }}
                                                ></div>
                                                <span className="text-sm text-gray-500">
                                                    {category.attractionsCount} мест
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                {category.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                                            <div className="flex items-center justify-end space-x-2">
                                                <button className="text-blue-400 hover:text-blue-600">
                                                    <PencilIcon className="w-4 h-4" />
                                                </button>
                                                <button className="text-red-400 hover:text-red-600">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
