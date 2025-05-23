import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../context/ToastContext';
import { attractionService } from '../services/attractionService';
import { categoryService } from '../services/categoryService';
import { metroStationService } from '../services/metroStationService';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { ArrowLeftIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarFilledIcon } from '@heroicons/react/24/solid';

export const CreateAttractionPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [selectedImages, setSelectedImages] = useState([]);
    const [primaryImageIndex, setPrimaryImageIndex] = useState(0); // Индекс главного изображения

    // Получаем список категорий
    const { data: categories, isLoading: categoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getCategories,
    });

    // Получаем список станций метро
    const { data: metroStations, isLoading: metroStationsLoading } = useQuery({
        queryKey: ['metroStations'],
        queryFn: metroStationService.getMetroStations,
    });

    // Мутация для создания достопримечательности
    const createMutation = useMutation({
        mutationFn: async (data) => {
            // Сначала создаем достопримечательность
            const response = await attractionService.createAttraction(data);

            // Если есть изображения, загружаем их
            if (selectedImages.length > 0) {
                // Формируем FormData с указанием главного изображения
                const formData = new FormData();
                selectedImages.forEach((file, index) => {
                    formData.append('images', file);
                });
                formData.append('primaryIndex', primaryImageIndex);

                // Загружаем изображения для созданной достопримечательности
                await attractionService.uploadImages(response.attraction.id, formData);
            }

            return response;
        },
        onSuccess: (data) => {
            showToast('Достопримечательность успешно создана!', 'success');
            queryClient.invalidateQueries(['attractions']);
            navigate(`/attractions/${data.attraction.id}`);
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Ошибка при создании достопримечательности';
            showToast(message, 'error');
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            wheelchairAccessible: false,
            hasElevator: false,
            hasAudioGuide: false,
            hasSignLanguageSupport: false,
        },
    });

    const onSubmit = async (data) => {
        try {
            // Преобразуем строковые значения в числа где необходимо
            const formattedData = {
                ...data,
                categoryId: parseInt(data.categoryId),
                metroStationId: data.metroStationId ? parseInt(data.metroStationId) : null,
                distanceToMetro: data.distanceToMetro ? parseInt(data.distanceToMetro) : null,
                latitude: data.latitude ? parseFloat(data.latitude) : null,
                longitude: data.longitude ? parseFloat(data.longitude) : null,
            };

            await createMutation.mutateAsync(formattedData);
        } catch (error) {
            console.error('Ошибка создания:', error);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedImages(files);
        // Устанавливаем первое изображение как главное по умолчанию
        setPrimaryImageIndex(0);
    };

    const handleSetPrimaryImage = (index) => {
        setPrimaryImageIndex(index);
    };

    const handleRemoveImage = (index) => {
        const newImages = [...selectedImages];
        newImages.splice(index, 1);
        setSelectedImages(newImages);

        // Если удаляем главное изображение, устанавливаем первое как главное
        if (index === primaryImageIndex) {
            setPrimaryImageIndex(0);
        }
        // Если удаляем изображение перед главным, корректируем индекс
        else if (index < primaryImageIndex) {
            setPrimaryImageIndex(primaryImageIndex - 1);
        }
    };

    if (categoriesLoading || metroStationsLoading) {
        return <LoadingSpinner size="lg" message="Загружаем данные для создания..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Навигация */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            to="/admin"
                            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5 mr-2" />
                            Админ панель
                        </Link>
                        <h1 className="text-xl font-semibold text-gray-900">Добавление достопримечательности</h1>
                    </div>
                </div>
            </div>

            {/* Основная форма */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Основная информация */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Основная информация</h2>

                        {/* Название */}
                        <div className="mt-6">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Название достопримечательности *
                            </label>
                            <input
                                id="name"
                                {...register('name', {
                                    required: 'Название обязательно',
                                    minLength: {
                                        value: 2,
                                        message: 'Название должно содержать минимум 2 символа',
                                    },
                                    maxLength: {
                                        value: 200,
                                        message: 'Название не должно превышать 200 символов',
                                    },
                                })}
                                type="text"
                                className={`input-field ${errors.name ? 'input-error' : ''}`}
                                placeholder="Например: Государственный Эрмитаж"
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                        </div>

                        {/* Категория */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Категория *</label>
                            <select
                                {...register('categoryId', {
                                    required: 'Категория обязательна',
                                })}
                                className={`input-field ${errors.categoryId ? 'input-error' : ''}`}
                            >
                                <option value="">Выберите категорию</option>
                                {categories?.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {errors.categoryId && (
                                <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                            )}
                        </div>

                        {/* Краткое описание */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Краткое описание *</label>
                            <textarea
                                {...register('shortDescription', {
                                    required: 'Краткое описание обязательно',
                                    minLength: {
                                        value: 10,
                                        message: 'Описание должно содержать минимум 10 символов',
                                    },
                                    maxLength: {
                                        value: 500,
                                        message: 'Описание не должно превышать 500 символов',
                                    },
                                })}
                                rows={3}
                                className={`input-field ${errors.shortDescription ? 'input-error' : ''}`}
                                placeholder="Краткое описание для отображения в списке (до 500 символов)"
                            />
                            {errors.shortDescription && (
                                <p className="mt-1 text-sm text-red-600">{errors.shortDescription.message}</p>
                            )}
                        </div>

                        {/* Полное описание */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Полное описание *</label>
                            <textarea
                                {...register('fullDescription', {
                                    required: 'Полное описание обязательно',
                                    minLength: {
                                        value: 50,
                                        message: 'Описание должно содержать минимум 50 символов',
                                    },
                                    maxLength: {
                                        value: 5000,
                                        message: 'Описание не должно превышать 5000 символов',
                                    },
                                })}
                                rows={8}
                                className={`input-field ${errors.fullDescription ? 'input-error' : ''}`}
                                placeholder="Подробное описание достопримечательности, её история, особенности..."
                            />
                            {errors.fullDescription && (
                                <p className="mt-1 text-sm text-red-600">{errors.fullDescription.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Местоположение */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Местоположение</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Адрес */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Адрес *</label>
                                <input
                                    {...register('address', {
                                        required: 'Адрес обязателен',
                                        minLength: {
                                            value: 5,
                                            message: 'Адрес должен содержать минимум 5 символов',
                                        },
                                    })}
                                    type="text"
                                    className={`input-field ${errors.address ? 'input-error' : ''}`}
                                    placeholder="Полный адрес достопримечательности"
                                />
                                {errors.address && (
                                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                                )}
                            </div>

                            {/* Станция метро */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Станция метро</label>
                                <select {...register('metroStationId')} className="input-field">
                                    <option value="">Выберите станцию метро</option>
                                    {metroStations?.map((station) => (
                                        <option key={station.id} value={station.id}>
                                            {station.name} ({station.lineName})
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">
                                    Выберите ближайшую станцию метро к достопримечательности
                                </p>
                            </div>

                            {/* Расстояние до метро */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Расстояние до метро (мин пешком)
                                </label>
                                <input
                                    {...register('distanceToMetro', {
                                        min: {
                                            value: 1,
                                            message: 'Минимальное значение: 1 минута',
                                        },
                                        max: {
                                            value: 60,
                                            message: 'Максимальное значение: 60 минут',
                                        },
                                    })}
                                    type="number"
                                    className={`input-field ${errors.distanceToMetro ? 'input-error' : ''}`}
                                    placeholder="5"
                                />
                                {errors.distanceToMetro && (
                                    <p className="mt-1 text-sm text-red-600">{errors.distanceToMetro.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Практическая информация */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Практическая информация</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Время работы */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Время работы</label>
                                <input
                                    {...register('workingHours')}
                                    type="text"
                                    className="input-field"
                                    placeholder="10:00-18:00, выходной - понедельник"
                                />
                            </div>

                            {/* Стоимость билета */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Стоимость билета</label>
                                <input
                                    {...register('ticketPrice')}
                                    type="text"
                                    className="input-field"
                                    placeholder="от 400₽, льготный 200₽"
                                />
                            </div>

                            {/* Телефон */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                                <input
                                    {...register('phone')}
                                    type="tel"
                                    className="input-field"
                                    placeholder="+7 (812) 123-45-67"
                                />
                            </div>

                            {/* Веб-сайт */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Официальный сайт</label>
                                <input
                                    {...register('website', {
                                        pattern: {
                                            value: /^https?:\/\/.+/,
                                            message: 'URL должен начинаться с http:// или https://',
                                        },
                                    })}
                                    type="url"
                                    className={`input-field ${errors.website ? 'input-error' : ''}`}
                                    placeholder="https://example.com"
                                />
                                {errors.website && (
                                    <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Доступность */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Доступность</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Чекбоксы доступности */}
                            <div className="space-y-4">
                                <label className="flex items-center">
                                    <input
                                        {...register('wheelchairAccessible')}
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                        ♿ Доступно для инвалидных колясок
                                    </span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        {...register('hasElevator')}
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">🛗 Есть лифт</span>
                                </label>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center">
                                    <input
                                        {...register('hasAudioGuide')}
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">🎧 Есть аудиогид</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        {...register('hasSignLanguageSupport')}
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">🤟 Поддержка жестового языка</span>
                                </label>
                            </div>
                        </div>

                        {/* Дополнительные заметки о доступности */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Дополнительная информация о доступности
                            </label>
                            <textarea
                                {...register('accessibilityNotes')}
                                rows={3}
                                className="input-field"
                                placeholder="Дополнительные заметки о доступности места для людей с ограниченными возможностями..."
                            />
                        </div>
                    </div>

                    {/* Изображения */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Изображения</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Фотографии достопримечательности
                            </label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="input-field"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Можно выбрать несколько изображений. Рекомендуемый формат: JPEG, PNG. Максимальный
                                размер: 5MB на файл.
                            </p>

                            {selectedImages.length > 0 && (
                                <div className="mt-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <p className="text-sm font-medium text-gray-700">
                                            Выбрано файлов: {selectedImages.length}
                                        </p>
                                        <p className="text-sm text-blue-600">
                                            Выберите главное изображение, которое будет отображаться в карточке
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {selectedImages.map((file, index) => (
                                            <div
                                                key={file.name + file.size}
                                                className={`
                                                    relative p-2 rounded-lg border-2 
                                                    ${
                                                        primaryImageIndex === index
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200'
                                                    }
                                                `}
                                            >
                                                {/* Предпросмотр изображения */}
                                                <div className="w-full h-32 bg-gray-100 rounded overflow-hidden mb-2">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={`Предпросмотр ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <div
                                                        className="text-xs text-gray-500 truncate max-w-[120px]"
                                                        title={file.name}
                                                    >
                                                        {file.name.length > 15
                                                            ? file.name.substring(0, 12) + '...'
                                                            : file.name}
                                                        <span className="text-gray-400">
                                                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                        </span>
                                                    </div>

                                                    <div className="flex space-x-1">
                                                        {/* Кнопка выбора главного изображения */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSetPrimaryImage(index)}
                                                            className={`p-1 rounded hover:bg-gray-100 focus:outline-none transition-colors`}
                                                            title="Сделать главным изображением"
                                                        >
                                                            {primaryImageIndex === index ? (
                                                                <StarFilledIcon className="w-5 h-5 text-yellow-500" />
                                                            ) : (
                                                                <StarIcon className="w-5 h-5 text-gray-400" />
                                                            )}
                                                        </button>

                                                        {/* Кнопка удаления изображения */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(index)}
                                                            className="p-1 rounded hover:bg-red-100 focus:outline-none transition-colors"
                                                            title="Удалить изображение"
                                                        >
                                                            <TrashIcon className="w-5 h-5 text-red-500" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Индикатор главного изображения */}
                                                {primaryImageIndex === index && (
                                                    <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg">
                                                        Главное
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Кнопки действий */}
                    <div className="flex items-center justify-end space-x-4 pb-8">
                        <Link to="/admin" className="btn-secondary">
                            Отмена
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting || createMutation.isLoading}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting || createMutation.isLoading ? 'Создание...' : 'Создать достопримечательность'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
