import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import categoryService from '../../services/categoryService';

const SearchAndFilters = ({ onSearch, onFilterChange, initialFilters = {} }) => {
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || '');
    const [selectedAccessibility, setSelectedAccessibility] = useState(initialFilters.accessibility || '');
    const [selectedDistrict, setSelectedDistrict] = useState(initialFilters.district || '');
    const [sortBy, setSortBy] = useState(initialFilters.sort || 'name');
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Получаем список категорий для фильтра
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getCategories,
        staleTime: 1000 * 60 * 10, // Кэшируем на 10 минут
    });

    // Районы Санкт-Петербурга для фильтра
    const districts = [
        'Адмиралтейский',
        'Василеостровский',
        'Выборгский',
        'Калининский',
        'Кировский',
        'Колпинский',
        'Красногвардейский',
        'Красносельский',
        'Кронштадтский',
        'Курортный',
        'Московский',
        'Невский',
        'Петроградский',
        'Петродворцовый',
        'Приморский',
        'Пушкинский',
        'Фрунзенский',
        'Центральный',
    ];

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onSearch(searchTerm);
    };

    // Обработка изменения фильтров
    useEffect(() => {
        const filters = {
            category: selectedCategory,
            accessibility: selectedAccessibility,
            district: selectedDistrict,
            sort: sortBy,
        };
        onFilterChange(filters);
    }, [selectedCategory, selectedAccessibility, selectedDistrict, sortBy, onFilterChange]);

    return (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            {/* Заголовок и кнопка фильтров для мобильных */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Поиск достопримечательностей</h2>
                <button
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className="md:hidden btn-secondary flex items-center"
                >
                    <FunnelIcon className="w-4 h-4 mr-2" />
                    Фильтры
                </button>
            </div>

            {/* Поиск */}
            <form onSubmit={handleSearchSubmit} className="mb-6">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Поиск по названию или описанию..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10 pr-20"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary text-sm py-1.5"
                    >
                        Найти
                    </button>
                </div>
            </form>

            {/* Фильтры */}
            <div
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${
                    filtersOpen ? 'block' : 'hidden md:grid'
                }`}
            >
                {/* Фильтр по категориям */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="input-field"
                    >
                        <option value="">Все категории</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name} ({category.attractionsCount})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Фильтр по району */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Район</label>
                    <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="input-field"
                    >
                        <option value="">Все районы</option>
                        {districts.map((district) => (
                            <option key={district} value={district}>
                                {district}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Фильтр по доступности */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Доступность</label>
                    <select
                        value={selectedAccessibility}
                        onChange={(e) => setSelectedAccessibility(e.target.value)}
                        className="input-field"
                    >
                        <option value="">Без фильтра</option>
                        <option value="wheelchair">Доступно для колясок</option>
                        <option value="audio">С аудиогидом</option>
                        <option value="elevator">С лифтом</option>
                    </select>
                </div>

                {/* Сортировка */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Сортировка</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field">
                        <option value="name">По названию</option>
                        <option value="newest">Сначала новые</option>
                        <option value="oldest">Сначала старые</option>
                        <option value="category">По категории</option>
                    </select>
                </div>
            </div>

            {/* Быстрые фильтры */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Быстрые фильтры:</p>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => {
                            setSelectedCategory('');
                            setSelectedAccessibility('');
                            setSelectedDistrict('');
                            setSortBy('name');
                            setSearchTerm('');
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                    >
                        Сбросить все
                    </button>
                    <button
                        onClick={() => setSelectedAccessibility('wheelchair')}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            selectedAccessibility === 'wheelchair'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                    >
                        ♿ Доступные места
                    </button>
                    <button
                        onClick={() => setSortBy('newest')}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            sortBy === 'newest'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                    >
                        🆕 Новые места
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchAndFilters;
