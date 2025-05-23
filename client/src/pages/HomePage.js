import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { attractionService } from '../services/attractionService';
import { AttractionCard } from '../components/Attraction/AttractionCard';
import { SearchAndFilters } from '../components/Search/SearchAndFilters';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { MapPinIcon, SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';

// Компонент для отображения ошибки в области контента
export const ErrorInContent = ({ onRetry }) => (
    <div className="text-center py-16">
        <div className="max-w-md mx-auto">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ошибка загрузки данных</h3>
            <p className="text-gray-600 mb-6">
                Не удалось загрузить список достопримечательностей. Проверьте подключение к интернету и попробуйте еще
                раз.
            </p>
            <button onClick={onRetry} className="btn-primary">
                Попробовать снова
            </button>
        </div>
    </div>
);

ErrorInContent.propTypes = {
    onRetry: PropTypes.func.isRequired,
};

export const HomePage = () => {
    const [searchParams, setSearchParams] = useState({
        page: 1,
        limit: 12,
        search: '',
        category: 0,
        metro: 0,
        accessibility: [],
        sort: 'name',
    });

    // Получаем список достопримечательностей с сервера
    // Ключевое изменение: убираем keepPreviousData, чтобы при обновлении данных
    // происходила полная перезагрузка, включая обработку ошибок
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['attractions', searchParams],
        queryFn: () => attractionService.getAttractions(searchParams),
        staleTime: 1000 * 60 * 2, // Считаем данные актуальными 2 минуты
        retry: 2, // Уменьшаем количество попыток для быстрого показа ошибки
    });

    const attractions = data?.attractions || [];
    const pagination = data?.pagination || {};

    // Обработка поиска
    const handleSearch = useCallback((searchTerm) => {
        setSearchParams((prev) => ({
            ...prev,
            search: searchTerm,
            page: 1, // Сбрасываем на первую страницу при новом поиске
        }));
    }, []);

    // Обработка изменения фильтров
    const handleFilterChange = useCallback((filters) => {
        setSearchParams((prev) => ({
            ...prev,
            ...filters,
            page: 1, // Сбрасываем на первую страницу при изменении фильтров
        }));
    }, []);

    // Обработка пагинации
    const handlePageChange = (newPage) => {
        setSearchParams((prev) => ({
            ...prev,
            page: newPage,
        }));
        // Плавная прокрутка к началу списка
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Герой секция - всегда отображается, независимо от состояния данных */}
            <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="max-w-3xl mx-auto">
                        {/* Исправляем проблему с обрезанием текста при переносе строки */}
                        {/* Добавляем leading-tight для уменьшения межстрочного интервала */}
                        {/* и mb-8 вместо mb-6 для большего отступа снизу */}
                        <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                            Достопримечательности
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mt-2 leading-normal">
                                Санкт-Петербурга
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 mb-8">
                            Откройте для себя самые красивые и исторически значимые места Северной столицы
                        </p>

                        {/* Исправляем стилизацию кнопок - теперь обе выглядят одинаково */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/categories"
                                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-8 rounded-lg transition-colors inline-flex items-center justify-center"
                            >
                                <SparklesIcon className="w-5 h-5 mr-2" />
                                Категории мест
                            </Link>
                            <a
                                href="#attractions"
                                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-8 rounded-lg transition-colors inline-flex items-center justify-center"
                            >
                                <MapPinIcon className="w-5 h-5 mr-2" />
                                Смотреть все места
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Основной контент */}
            <section id="attractions" className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Поиск и фильтры - всегда отображаются */}
                    <SearchAndFilters
                        onSearch={handleSearch}
                        onFilterChange={handleFilterChange}
                        initialFilters={searchParams}
                    />

                    {/* Результаты поиска */}
                    {searchParams.search && !error && (
                        <div className="mb-6">
                            <p className="text-gray-600">
                                Результаты поиска для: <span className="font-semibold">"{searchParams.search}"</span>
                                {pagination.totalItems > 0 && (
                                    <span>
                                        {' '}
                                        — найдено {pagination.totalItems}{' '}
                                        {pagination.totalItems === 1 ? 'место' : 'мест'}
                                    </span>
                                )}
                            </p>
                        </div>
                    )}

                    {/* Область отображения достопримечательностей */}
                    {/* Ключевое изменение: ошибка отображается только здесь, а не заменяет всю страницу */}
                    {error ? (
                        <ErrorInContent onRetry={() => refetch()} />
                    ) : isLoading ? (
                        <LoadingSpinner size="lg" message="Загружаем достопримечательности..." />
                    ) : attractions.length === 0 ? (
                        <div className="text-center py-12">
                            <MapPinIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Места не найдены</h3>
                            <p className="text-gray-600 mb-6">
                                {searchParams.search || searchParams.category
                                    ? 'Попробуйте изменить параметры поиска или фильтры'
                                    : 'В данный момент нет доступных достопримечательностей'}
                            </p>
                            {(searchParams.search || searchParams.category) && (
                                <button
                                    onClick={() =>
                                        setSearchParams({
                                            page: 1,
                                            limit: 12,
                                            search: '',
                                            category: '',
                                            accessibility: [],
                                            sort: 'name',
                                        })
                                    }
                                    className="btn-primary"
                                >
                                    Сбросить фильтры
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Сетка достопримечательностей */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                                {attractions.map((attraction) => (
                                    <AttractionCard key={attraction.id} attraction={attraction} />
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
                                                .filter((page) => {
                                                    const current = pagination.currentPage;
                                                    return (
                                                        page === 1 ||
                                                        page === pagination.totalPages ||
                                                        (page >= current - 1 && page <= current + 1)
                                                    );
                                                })
                                                .map((page, index, array) => (
                                                    <React.Fragment key={page}>
                                                        {index > 0 && array[index - 1] !== page - 1 && (
                                                            <span className="px-3 py-2 text-gray-500">...</span>
                                                        )}
                                                        <button
                                                            onClick={() => handlePageChange(page)}
                                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                                page === pagination.currentPage
                                                                    ? 'bg-blue-500 text-white'
                                                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                                            }`}
                                                        >
                                                            {page}
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
            </section>

            {/* Статистика - показываем только если есть данные и нет ошибки */}
            {!error && pagination.totalItems > 0 && (
                <section className="bg-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div>
                                <div className="text-3xl font-bold text-blue-600 mb-2">{pagination.totalItems}</div>
                                <div className="text-gray-600">Достопримечательностей</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-green-600 mb-2">
                                    {attractions.filter((a) => a.wheelchairAccessible).length}
                                </div>
                                <div className="text-gray-600">Доступных мест</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-purple-600 mb-2">
                                    {attractions.filter((a) => a.hasAudioGuide).length}
                                </div>
                                <div className="text-gray-600">С аудиогидом</div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};
