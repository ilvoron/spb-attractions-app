import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import categoryService from '../services/categoryService';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { MapPinIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const CategoriesPage = () => {
    const {
        data: categories,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getCategories,
    });

    if (isLoading) {
        return <LoadingSpinner size="lg" message="Загружаем категории..." />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Ошибка загрузки</h2>
                    <p className="text-gray-600">Не удалось загрузить категории достопримечательностей</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Героическая секция */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Категории достопримечательностей</h1>
                    <p className="text-xl text-purple-100 max-w-3xl mx-auto">
                        Выберите интересующую вас категорию, чтобы найти именно те места, которые соответствуют вашим
                        предпочтениям и интересам
                    </p>
                </div>
            </div>

            {/* Категории */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories?.map((category) => (
                        <CategoryCard key={category.id} category={category} />
                    ))}
                </div>

                {/* Дополнительная информация */}
                <div className="mt-16 bg-white rounded-xl shadow-sm p-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Не можете найти подходящую категорию?</h2>
                        <p className="text-gray-600 mb-6">
                            Воспользуйтесь поиском на главной странице или посмотрите все достопримечательности без
                            фильтрации по категориям. Возможно, вы найдете что-то неожиданное и интересное!
                        </p>
                        <Link to="/" className="btn-primary">
                            Смотреть все места
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CategoryCard = ({ category }) => {
    return (
        <Link
            to={`/categories/${category.id}`}
            className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
            {/* Цветная полоса сверху */}
            <div className="h-2" style={{ backgroundColor: category.color }}></div>

            <div className="p-6">
                {/* Иконка и счетчик */}
                <div className="flex items-center justify-between mb-4">
                    <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                    >
                        <MapPinIcon className="w-6 h-6" style={{ color: category.color }} />
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: category.color }}>
                            {category.attractionsCount}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                            {category.attractionsCount === 1 ? 'место' : 'мест'}
                        </div>
                    </div>
                </div>

                {/* Название и описание */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{category.description}</p>

                {/* Кнопка */}
                <div className="flex items-center text-sm font-medium group-hover:text-blue-600 transition-colors">
                    <span style={{ color: category.color }}>Смотреть места</span>
                    <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </Link>
    );
};

export default CategoriesPage;
