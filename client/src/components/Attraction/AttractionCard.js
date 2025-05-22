import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, ClockIcon, BanknotesIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

/**
 * Исправленный компонент карточки достопримечательности
 *
 * ✅ ИСПРАВЛЕНИЕ: Все хуки вызываются в самом начале компонента,
 * ДО любых условных проверок или ранних возвратов.
 *
 * Это соответствует Правилам Хуков React:
 * 1. Хуки должны вызываться на верхнем уровне
 * 2. Хуки должны вызываться в одном и том же порядке при каждом рендере
 * 3. Хуки НЕ должны вызываться внутри циклов, условий или вложенных функций
 */
const AttractionCard = ({ attraction, onFavoriteToggle }) => {
    // ✅ ПРАВИЛЬНО: Хуки размещены в самом начале компонента
    // Эти хуки будут вызываться при каждом рендере, независимо от данных
    const [isFavorite, setIsFavorite] = useState(false);
    const [imageError, setImageError] = useState(false);

    // ✅ ПРАВИЛЬНО: Условные проверки и ранние возвраты ПОСЛЕ хуков
    // Теперь React будет видеть одинаковую последовательность хуков при каждом рендере
    if (!attraction || !attraction.id) {
        console.warn('AttractionCard: Попытка отрендерить карточку без данных достопримечательности');
        return null;
    }

    // Проверяем обязательные поля - если их нет, это означает поврежденные данные
    if (!attraction.name || !attraction.shortDescription) {
        console.warn(`AttractionCard: Неполные данные для достопримечательности с ID ${attraction.id}`);
        return null;
    }

    // Теперь все остальные функции могут безопасно использовать состояние из хуков
    const handleFavoriteClick = (e) => {
        e.preventDefault(); // Предотвращаем переход по ссылке
        e.stopPropagation(); // Останавливаем всплытие события

        const newFavoriteState = !isFavorite;
        setIsFavorite(newFavoriteState);

        // Вызываем callback только если он предоставлен
        if (typeof onFavoriteToggle === 'function') {
            onFavoriteToggle(attraction.id, newFavoriteState);
        }
    };

    // Безопасное получение цвета линии метро
    const getMetroLineColor = (lineColor) => {
        const colors = {
            red: '#EF4444',
            blue: '#3B82F6',
            green: '#10B981',
            orange: '#F97316',
            purple: '#8B5CF6',
        };
        return colors[lineColor] || '#6B7280'; // Серый как fallback
    };

    // Безопасное получение изображения
    const getPrimaryImage = () => {
        if (!attraction.images || !Array.isArray(attraction.images)) {
            return null;
        }

        // Ищем основное изображение или берем первое доступное
        const primaryImage = attraction.images.find((img) => img.isPrimary) || attraction.images[0];
        return primaryImage || null;
    };

    const primaryImage = getPrimaryImage();

    return (
        <Link
            to={`/attractions/${attraction.id}`}
            className="card group block" // Делаем всю карточку кликабельной
        >
            {/* Изображение */}
            <div className="relative h-48 overflow-hidden">
                {!imageError && primaryImage ? (
                    <img
                        src={`http://localhost:5000${primaryImage.path}`}
                        alt={primaryImage.altText || attraction.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={() => {
                            console.warn(`Ошибка загрузки изображения для достопримечательности ${attraction.id}`);
                            setImageError(true);
                        }}
                        loading="lazy"
                    />
                ) : (
                    // Показываем placeholder только если нет изображения, но не создаем фальшивый контент
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <MapPinIcon className="w-16 h-16 text-gray-400" />
                    </div>
                )}

                {/* Кнопка избранного */}
                <button
                    onClick={handleFavoriteClick}
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full transition-colors shadow-sm z-10"
                    title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                    aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                >
                    {isFavorite ? (
                        <HeartSolidIcon className="w-5 h-5 text-red-500" />
                    ) : (
                        <HeartIcon className="w-5 h-5 text-gray-600" />
                    )}
                </button>

                {/* Бейдж категории - показываем только если есть реальные данные категории */}
                {attraction.category && attraction.category.name && (
                    <div className="absolute top-3 left-3">
                        <span
                            className="px-3 py-1 text-xs font-medium text-white rounded-full"
                            style={{
                                backgroundColor: attraction.category.color || '#6B7280', // Fallback цвет
                            }}
                        >
                            {attraction.category.name}
                        </span>
                    </div>
                )}
            </div>

            {/* Контент */}
            <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{attraction.name}</h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{attraction.shortDescription}</p>

                {/* Метаинформация - показываем только реальные данные */}
                <div className="space-y-2 mb-4">
                    {attraction.address && (
                        <div className="flex items-center text-sm text-gray-500">
                            <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{attraction.address}</span>
                        </div>
                    )}

                    {attraction.metroStation && attraction.metroStation.name && (
                        <div className="flex items-center text-sm text-gray-500">
                            <div
                                className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                                style={{ backgroundColor: getMetroLineColor(attraction.metroStation.lineColor) }}
                            ></div>
                            <span className="truncate">
                                м. {attraction.metroStation.name}
                                {attraction.distanceToMetro && (
                                    <span className="ml-1">({attraction.distanceToMetro} мин)</span>
                                )}
                            </span>
                        </div>
                    )}

                    {attraction.workingHours && (
                        <div className="flex items-start text-sm text-gray-500">
                            <ClockIcon className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{attraction.workingHours}</span>
                        </div>
                    )}

                    {attraction.ticketPrice && (
                        <div className="flex items-center text-sm text-gray-500">
                            <BanknotesIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>{attraction.ticketPrice}</span>
                        </div>
                    )}
                </div>

                {/* Значки доступности - показываем только если есть реальные данные */}
                {(attraction.wheelchairAccessible || attraction.hasAudioGuide || attraction.hasElevator) && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {attraction.wheelchairAccessible && (
                            <span
                                className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                                title="Доступно для инвалидных колясок"
                            >
                                ♿ Доступно
                            </span>
                        )}
                        {attraction.hasAudioGuide && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded" title="Есть аудиогид">
                                🎧 Аудиогид
                            </span>
                        )}
                        {attraction.hasElevator && (
                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded" title="Есть лифт">
                                🛗 Лифт
                            </span>
                        )}
                    </div>
                )}

                {/* Индикатор ссылки */}
                <div className="text-blue-600 text-sm font-medium group-hover:text-blue-800 transition-colors">
                    Подробнее →
                </div>
            </div>
        </Link>
    );
};

export default AttractionCard;
