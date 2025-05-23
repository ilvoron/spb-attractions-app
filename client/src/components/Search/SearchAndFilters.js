import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { categoryService } from '../../services/categoryService';
import { metroStationService } from '../../services/metroStationService';
import PropTypes from 'prop-types';

export const SearchAndFilters = ({ onSearch, onFilterChange, initialFilters = {} }) => {
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || 0);
    const [selectedMetro, setSelectedMetro] = useState(initialFilters.metro || 0);
    const [selectedAccessibility, setSelectedAccessibility] = useState(initialFilters.accessibility || []);
    const [sortBy, setSortBy] = useState(initialFilters.sort || 'name');
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Ссыл‑хранилище для таймера debounce
    const debounceRef = useRef(null);
    const DEBOUNCE_DELAY = 400; // мс

    // Получаем список категорий для фильтра
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getCategories,
        staleTime: 1000 * 60 * 10, // Кэшируем на 10 минут
    });

    // Получаем список станций метро для фильтра
    const { data: metroStations = [] } = useQuery({
        queryKey: ['metroStations'],
        queryFn: metroStationService.getMetroStations,
        staleTime: 1000 * 60 * 10, // Кэшируем на 10 минут
    });

    // Автоматический запуск поиска с задержкой. Вызываем onSearch только когда пользователь закончил печатать
    useEffect(() => {
        // очищаем предыдущий таймер
        clearTimeout(debounceRef.current);
        // ставим новый
        debounceRef.current = setTimeout(() => {
            onSearch(searchTerm.trim());
        }, DEBOUNCE_DELAY);

        // очистка при размонтировании/смене searchTerm
        return () => clearTimeout(debounceRef.current);
    }, [searchTerm, onSearch]);

    // Ручной submit (по Enter / кнопке)
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        clearTimeout(debounceRef.current); // гасим debounce
        onSearch(searchTerm.trim());
    };

    const handleToggleAccessibility = (value) => {
        setSelectedAccessibility((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
    };

    // Обработка изменения фильтров
    useEffect(() => {
        const filters = {
            category: parseInt(selectedCategory) || 0, // Преобразуем в число
            metro: parseInt(selectedMetro) || 0, // Преобразуем в число
            accessibility: selectedAccessibility.length > 0 ? selectedAccessibility : [], // Массив строк
            sort: sortBy,
        };
        onFilterChange(filters);
    }, [selectedCategory, selectedMetro, selectedAccessibility, sortBy, onFilterChange]);

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
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${
                    filtersOpen ? 'block' : 'hidden md:grid'
                }`}
            >
                {/* Фильтр по категориям */}
                <div>
                    <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Категория
                    </label>
                    <select
                        id="category-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="input-field"
                    >
                        <option value="0">Все категории</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name} ({category.attractionsCount})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Фильтр по метро */}
                <div>
                    <label htmlFor="metro-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Метро
                    </label>
                    <select
                        id="metro-select"
                        value={selectedMetro}
                        onChange={(e) => setSelectedMetro(e.target.value)}
                        className="input-field"
                    >
                        <option value="0">Все станции</option>
                        {metroStations.map((station) => (
                            <option key={station.id} value={station.id}>
                                {station.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Сортировка */}
                <div>
                    <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Сортировка
                    </label>
                    <select
                        id="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="input-field"
                    >
                        <option value="name">По названию</option>
                        <option value="newest">Сначала новые</option>
                        <option value="oldest">Сначала старые</option>
                    </select>
                </div>

                {/* Фильтр по доступности */}
                <div className="col-span-full">
                    <fieldset className="flex flex-wrap gap-4 p-0 border-0">
                        {[
                            { value: 'wheelchair', label: '♿ Доступно для инвалидных колясок', color: '#4A90E2' },
                            { value: 'audio', label: '🎧 Есть аудиогид' },
                            { value: 'elevator', label: '🛗 Есть лифт' },
                            { value: 'sign_language', label: '🤟 Поддержка жестового языка' },
                        ].map((opt) => (
                            <div key={opt.value}>
                                <input
                                    type="checkbox"
                                    value={opt.value}
                                    checked={selectedAccessibility.includes(opt.value)}
                                    onChange={() => handleToggleAccessibility(opt.value)}
                                    className="hidden peer"
                                    id={`accessibility-${opt.value}`}
                                />
                                <label
                                    htmlFor={`accessibility-${opt.value}`}
                                    className="pt-2 pb-2 pl-5 pr-5 input-field cursor-pointer hover:bg-blue-10 peer-checked:border-blue-600 hover:text-gray-600 peer-checked:font-semibold peer-checked:text-blue-600"
                                >
                                    {opt.label}
                                </label>
                            </div>
                        ))}
                    </fieldset>
                </div>
            </div>
        </div>
    );
};

SearchAndFilters.propTypes = {
    onSearch: PropTypes.func.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    initialFilters: PropTypes.shape({
        search: PropTypes.string,
        category: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        metro: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        accessibility: PropTypes.arrayOf(PropTypes.string),
        sort: PropTypes.string,
    }),
};
