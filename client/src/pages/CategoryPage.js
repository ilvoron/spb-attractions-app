import React, { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/categoryService';
import { AttractionCard } from '../components/Attraction/AttractionCard';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { ArrowLeftIcon, MapPinIcon } from '@heroicons/react/24/outline';

export const CategoryPage = () => {
    const { id } = useParams();
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('name');

    // Получаем информацию о категории
    const { data: category, isLoading: categoryLoading } = useQuery({
        queryKey: ['category', id],
        queryFn: () => categoryService.getCategory(id),
        enabled: !!id,
    });

    // Получаем достопримечательности категории
    const {
        data: attractionsData,
        isLoading: attractionsLoading,
        error,
    } = useQuery({
        queryKey: ['category-attractions', id, page, sortBy],
        queryFn: () =>
            categoryService.getCategoryAttractions(id, {
                page,
                limit: 12,
                sort: sortBy,
            }),
        enabled: !!id,
        keepPreviousData: true,
    });

    const attractions = attractionsData?.attractions || [];
    const pagination = attractionsData?.pagination || {};

    const handlePageChange = (newPage) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFavoriteToggle = useCallback((attractionId, isFavorite) => {
        console.log(`Достопримечательность ${attractionId} ${isFavorite ? 'добавлена в' : 'удалена из'} избранное`);
    }, []);

    if (categoryLoading) {
        return <LoadingSpinner size="lg" message="Загружаем категорию..." />;
    }

    if (error || !category) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Категория не найдена</h2>
                    <p className="text-gray-600 mb-6">Запрашиваемая категория не существует</p>
                    <Link to="/categories" className="btn-primary">
                        Все категории
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Навигация */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link
                        to="/categories"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        Все категории
                    </Link>
                </div>
            </div>

            {/* Заголовок категории */}
            <div
                className="py-16 text-white"
                style={{
                    background: `linear-gradient(135deg, ${category.color}, ${category.color}dd)`,
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                            <MapPinIcon className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">{category.name}</h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto mb-6">{category.description}</p>
                        <div className="inline-flex items-center bg-white/20 rounded-full px-4 py-2">
                            <span className="text-lg font-semibold">
                                {attractionsData?.pagination?.totalItems || 0} мест в категории
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Основной контент */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Фильтры и сортировка */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Достопримечательности категории "{category.name}"
                        </h2>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="sortBy" className="text-sm font-medium text-gray-700">
                                Сортировка:
                            </label>
                            <select
                                id="sortBy"
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value);
                                    setPage(1);
                                }}
                                className="input-field w-auto"
                            >
                                <option value="name">По названию</option>
                                <option value="newest">Сначала новые</option>
                                <option value="oldest">Сначала старые</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Список достопримечательностей */}
                {attractionsLoading ? (
                    <LoadingSpinner size="lg" message="Загружаем достопримечательности..." />
                ) : attractions.length === 0 ? (
                    <div className="text-center py-12">
                        <MapPinIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">В этой категории пока нет мест</h3>
                        <p className="text-gray-600 mb-6">Достопримечательности этой категории еще не добавлены</p>
                        <Link to="/categories" className="btn-primary">
                            Посмотреть другие категории
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Сетка достопримечательностей */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {attractions.map((attraction) => (
                                <AttractionCard
                                    key={attraction.id}
                                    attraction={attraction}
                                    onFavoriteToggle={handleFavoriteToggle}
                                />
                            ))}
                        </div>

                        {/* Пагинация */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center">
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={!pagination.hasPrevPage}
                                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Предыдущая
                                    </button>

                                    <div className="flex space-x-1">
                                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                            .filter((pageNum) => {
                                                const current = pagination.currentPage;
                                                return (
                                                    pageNum === 1 ||
                                                    pageNum === pagination.totalPages ||
                                                    (pageNum >= current - 1 && pageNum <= current + 1)
                                                );
                                            })
                                            .map((pageNum, index, array) => (
                                                <React.Fragment key={pageNum}>
                                                    {index > 0 && array[index - 1] !== pageNum - 1 && (
                                                        <span className="px-3 py-2 text-gray-500">...</span>
                                                    )}
                                                    <button
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                            pageNum === pagination.currentPage
                                                                ? 'text-white'
                                                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                                        }`}
                                                        style={{
                                                            backgroundColor:
                                                                pageNum === pagination.currentPage
                                                                    ? category.color
                                                                    : undefined,
                                                        }}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                </React.Fragment>
                                            ))}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={!pagination.hasNextPage}
                                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Следующая
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
