import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { attractionService } from '../services/attractionService';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import {
    MapPinIcon,
    ClockIcon,
    BanknotesIcon,
    PhoneIcon,
    GlobeAltIcon,
    ShareIcon,
    PencilIcon,
    ArrowLeftIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export const AttractionDetailPage = () => {
    const { id } = useParams();
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const {
        data: attraction,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['attraction', id],
        queryFn: () => attractionService.getAttraction(id),
        enabled: !!id,
    });

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: attraction.name,
                    text: attraction.shortDescription,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Ошибка при попытке поделиться:', err);
            }
        } else {
            // Fallback для браузеров без поддержки Web Share API
            navigator.clipboard.writeText(window.location.href);
            alert('Ссылка скопирована в буфер обмена!');
        }
    };

    if (isLoading) {
        return <LoadingSpinner size="lg" message="Загружаем информацию о достопримечательности..." />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <ExclamationTriangleIcon className="w-16 h-16 text-red-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Ошибка загрузки</h2>
                    <p className="text-gray-600 mb-6">Не удалось загрузить информацию о достопримечательности</p>
                    <button onClick={() => navigate(-1)} className="btn-primary">
                        Вернуться назад
                    </button>
                </div>
            </div>
        );
    }

    if (!attraction) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <ExclamationTriangleIcon className="w-16 h-16 text-red-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Достопримечательность не найдена</h2>
                    <p className="text-gray-600 mb-6">
                        Запрашиваемая достопримечательность не существует или была удалена
                    </p>
                    <Link to="/" className="btn-primary">
                        На главную
                    </Link>
                </div>
            </div>
        );
    }

    const images = attraction.images || [];
    const hasImages = images.length > 0;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Навигация */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5 mr-2" />
                            Назад
                        </button>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleShare}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <ShareIcon className="w-5 h-5 text-gray-600" />
                                <span className="text-sm font-medium">Поделиться</span>
                            </button>

                            {isAdmin && (
                                <Link
                                    to={`/admin/attractions/${attraction.id}/edit`}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                    <span className="text-sm font-medium">Редактировать</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Основной контент */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Галерея изображений */}
                    <div className="lg:sticky lg:top-8">
                        {hasImages ? (
                            <div className="space-y-4">
                                {/* Основное изображение */}
                                <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-xl overflow-hidden">
                                    <img
                                        src={`http://localhost:5000${images[currentImageIndex]?.path}`}
                                        alt={images[currentImageIndex]?.altText || attraction.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Миниатюры */}
                                {images.length > 1 && (
                                    <div className="grid grid-cols-4 gap-2">
                                        {images.map((image, index) => (
                                            <button
                                                key={image.id}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`aspect-w-4 aspect-h-3 rounded-lg overflow-hidden border-2 transition-all ${
                                                    index === currentImageIndex
                                                        ? 'border-blue-500 ring-2 ring-blue-200'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <img
                                                    src={`http://localhost:5000${image.path}`}
                                                    alt={image.altText || `${attraction.name} - фото ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="aspect-w-16 aspect-h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                                <div className="text-center pt-20 pb-20">
                                    <MapPinIcon className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">Изображения не загружены</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Информация */}
                    <div className="space-y-6">
                        {/* Заголовок и категория */}
                        <div>
                            {attraction.category && (
                                <span
                                    className="inline-block px-3 py-1 text-sm font-medium text-white rounded-full mb-4"
                                    style={{ backgroundColor: attraction.category.color }}
                                >
                                    {attraction.category.name}
                                </span>
                            )}
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{attraction.name}</h1>
                            <p className="text-xl text-gray-600 leading-relaxed">{attraction.shortDescription}</p>
                        </div>

                        {/* Практическая информация */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Практическая информация</h2>
                            <div className="space-y-4">
                                {/* Адрес */}
                                <div className="flex items-start">
                                    <MapPinIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-gray-900">Адрес</p>
                                        <p className="text-gray-600">{attraction.address}</p>
                                        {attraction.district && (
                                            <p className="text-sm text-gray-500">{attraction.district} район</p>
                                        )}
                                    </div>
                                </div>

                                {/* Метро */}
                                {attraction.metroStation && (
                                    <div className="flex items-start">
                                        <div
                                            className="w-5 h-5 rounded-full mr-3 mt-0.5 flex-shrink-0"
                                            style={{
                                                backgroundColor: attraction.metroStation.lineColor || '#FFFFFF',
                                            }}
                                        ></div>
                                        <div>
                                            <p className="font-medium text-gray-900">Ближайшая станция метро</p>
                                            <p className="text-gray-600">
                                                {attraction.metroStation.name}
                                                {attraction.distanceToMetro && (
                                                    <span className="text-sm text-gray-500 ml-2">
                                                        ({attraction.distanceToMetro} мин пешком)
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-sm text-gray-500">{attraction.metroStation.lineName}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Время работы */}
                                {attraction.workingHours && (
                                    <div className="flex items-start">
                                        <ClockIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900">Время работы</p>
                                            <p className="text-gray-600">{attraction.workingHours}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Стоимость */}
                                {attraction.ticketPrice && (
                                    <div className="flex items-start">
                                        <BanknotesIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900">Стоимость билета</p>
                                            <p className="text-gray-600">{attraction.ticketPrice}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Телефон */}
                                {attraction.phone && (
                                    <div className="flex items-start">
                                        <PhoneIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900">Телефон</p>
                                            <a
                                                href={`tel:${attraction.phone}`}
                                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                            >
                                                {attraction.phone}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Веб-сайт */}
                                {attraction.website && (
                                    <div className="flex items-start">
                                        <GlobeAltIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900">Официальный сайт</p>
                                            <a
                                                href={attraction.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 transition-colors break-all"
                                            >
                                                {attraction.website}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Доступность */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Доступность</h2>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center">
                                    <div
                                        className={`w-4 h-4 rounded-full mr-3 ${
                                            attraction.wheelchairAccessible ? 'bg-green-500' : 'bg-red-500'
                                        }`}
                                    ></div>
                                    <span className="text-sm">Доступность для колясок</span>
                                </div>
                                <div className="flex items-center">
                                    <div
                                        className={`w-4 h-4 rounded-full mr-3 ${
                                            attraction.hasElevator ? 'bg-green-500' : 'bg-red-500'
                                        }`}
                                    ></div>
                                    <span className="text-sm">Наличие лифта</span>
                                </div>
                                <div className="flex items-center">
                                    <div
                                        className={`w-4 h-4 rounded-full mr-3 ${
                                            attraction.hasAudioGuide ? 'bg-green-500' : 'bg-red-500'
                                        }`}
                                    ></div>
                                    <span className="text-sm">Аудиогид</span>
                                </div>
                                <div className="flex items-center">
                                    <div
                                        className={`w-4 h-4 rounded-full mr-3 ${
                                            attraction.hasSignLanguageSupport ? 'bg-green-500' : 'bg-red-500'
                                        }`}
                                    ></div>
                                    <span className="text-sm">Поддержка жестового языка</span>
                                </div>
                            </div>
                            {attraction.accessibilityNotes && (
                                <div className="pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600 font-medium mb-2">Дополнительная информация:</p>
                                    <p className="text-sm text-gray-700">{attraction.accessibilityNotes}</p>
                                </div>
                            )}
                        </div>

                        {/* Подробное описание */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Описание</h2>
                            <div className="prose prose-gray max-w-none">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {attraction.fullDescription}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
