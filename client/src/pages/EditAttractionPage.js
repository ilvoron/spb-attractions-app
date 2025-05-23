import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../context/ToastContext';
import { attractionService } from '../services/attractionService';
import { categoryService } from '../services/categoryService';
import { metroStationService } from '../services/metroStationService';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { ArrowLeftIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarFilledIcon } from '@heroicons/react/24/solid';

export const EditAttractionPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    // Состояния для управления изображениями
    const [existingImages, setExistingImages] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [primaryImageId, setPrimaryImageId] = useState(null);
    const [primaryNewImageIndex, setPrimaryNewImageIndex] = useState(-1);

    // Получаем данные достопримечательности
    const { data: attraction, isLoading: attractionLoading } = useQuery({
        queryKey: ['attraction', id],
        queryFn: () => attractionService.getAttraction(id),
        enabled: !!id,
    });

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

    // Мутация для обновления
    const updateMutation = useMutation({
        mutationFn: (data) => attractionService.updateAttraction(id, data),
        onSuccess: () => {
            showToast('Достопримечательность успешно обновлена!', 'success');
            queryClient.invalidateQueries(['attraction', id]);
            queryClient.invalidateQueries(['attractions']);
            navigate(`/attractions/${id}`);
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Ошибка при обновлении достопримечательности';
            showToast(message, 'error');
        },
    });

    // Мутация для удаления
    const deleteMutation = useMutation({
        mutationFn: () => attractionService.deleteAttraction(id),
        onSuccess: () => {
            showToast('Достопримечательность успешно удалена!', 'success');
            queryClient.invalidateQueries(['attractions']);
            navigate('/admin');
        },
        onError: (error) => {
            const message = error.response?.data?.message || 'Ошибка при удалении достопримечательности';
            showToast(message, 'error');
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm();

    // Инициализация существующих изображений
    useEffect(() => {
        if (attraction && attraction.images) {
            // Преобразуем существующие изображения в нужный формат
            const imagesWithUrls = attraction.images.map((img) => ({
                ...img,
                url: `http://localhost:5000${img.path}`,
            }));

            setExistingImages(imagesWithUrls);

            // Устанавливаем идентификатор главного изображения
            const primaryImg = imagesWithUrls.find((img) => img.isPrimary);
            if (primaryImg) {
                setPrimaryImageId(primaryImg.id);
            }
        }
    }, [attraction]);

    // Заполняем форму данными при загрузке
    useEffect(() => {
        if (attraction) {
            reset({
                name: attraction.name || '',
                shortDescription: attraction.shortDescription || '',
                fullDescription: attraction.fullDescription || '',
                address: attraction.address || '',
                district: attraction.district || '',
                categoryId: attraction.categoryId || '',
                metroStationId: attraction.metroStationId || '',
                distanceToMetro: attraction.distanceToMetro || '',
                latitude: attraction.latitude || '',
                longitude: attraction.longitude || '',
                workingHours: attraction.workingHours || '',
                ticketPrice: attraction.ticketPrice || '',
                phone: attraction.phone || '',
                website: attraction.website || '',
                wheelchairAccessible: attraction.wheelchairAccessible || false,
                hasElevator: attraction.hasElevator || false,
                hasAudioGuide: attraction.hasAudioGuide || false,
                hasSignLanguageSupport: attraction.hasSignLanguageSupport || false,
                accessibilityNotes: attraction.accessibilityNotes || '',
                isPublished: attraction.isPublished !== false,
            });
        }
    }, [attraction, reset]);

    // Для освобождения ресурсов при размонтировании компонента
    useEffect(() => {
        return () => {
            // Очищаем все созданные URL объекты
            newImages.forEach((image) => {
                URL.revokeObjectURL(image.preview);
            });
        };
    }, [newImages]);

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

            // Обновляем достопримечательность
            await updateMutation.mutateAsync(formattedData);

            // Обрабатываем изображения

            // 1. Удаляем выбранные изображения
            if (imagesToDelete.length > 0) {
                try {
                    for (const imageId of imagesToDelete) {
                        await attractionService.deleteImage(id, imageId);
                    }
                    showToast(`Удалено ${imagesToDelete.length} изображений`, 'success');
                } catch (error) {
                    console.error('Ошибка при удалении изображений:', error);
                    showToast('Возникла проблема при удалении некоторых изображений', 'warning');
                }
            }

            // 2. Обновляем главное изображение из существующих
            if (primaryImageId) {
                try {
                    await attractionService.setPrimaryImage(id, primaryImageId);
                } catch (error) {
                    console.error('Ошибка при установке главного изображения:', error);
                    showToast('Не удалось обновить главное изображение', 'warning');
                }
            }

            // 3. Загружаем новые изображения
            if (newImages.length > 0) {
                try {
                    const formData = new FormData();

                    // Добавляем все файлы
                    newImages.forEach((image, index) => {
                        formData.append('images', image.file);

                        // Добавляем информацию о главном изображении
                        if (index === primaryNewImageIndex) {
                            formData.append('primaryImageIndex', index.toString());
                        }
                    });

                    // Если не выбрано главное изображение среди существующих, устанавливаем новое
                    if (!primaryImageId && primaryNewImageIndex !== -1) {
                        formData.append('setPrimary', 'true');
                    }

                    // Загружаем изображения
                    await attractionService.uploadImages(id, formData);

                    showToast('Новые изображения успешно загружены!', 'success');
                } catch (error) {
                    console.error('Ошибка загрузки новых изображений:', error);
                    showToast('Возникла проблема с загрузкой новых изображений', 'warning');
                }
            }

            // Перенаправляем на страницу достопримечательности
            navigate(`/attractions/${id}`);
        } catch (error) {
            console.error('Ошибка обновления:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Вы уверены, что хотите удалить эту достопримечательность? Это действие нельзя отменить.')) {
            try {
                await deleteMutation.mutateAsync();
            } catch (error) {
                console.error('Ошибка удаления:', error);
            }
        }
    };

    // Обработчик выбора новых изображений
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        // Создаем превью для каждого файла
        const filesWithPreview = files.map((file) => {
            return {
                file,
                preview: URL.createObjectURL(file),
                name: file.name,
                size: file.size,
            };
        });

        setNewImages((prev) => [...prev, ...filesWithPreview]);

        // Если это первое добавление новых изображений и нет существующих, устанавливаем первое как главное
        if (filesWithPreview.length > 0 && newImages.length === 0 && !primaryImageId) {
            setPrimaryNewImageIndex(0);
        }
    };

    // Обработчик удаления существующего изображения
    const handleExistingImageDelete = (imageId) => {
        setImagesToDelete((prev) => [...prev, imageId]);

        // Обновляем список отображаемых существующих изображений
        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));

        // Если удаляемое изображение было главным, сбрасываем primaryImageId
        if (imageId === primaryImageId) {
            setPrimaryImageId(null);
        }
    };

    // Обработчик удаления нового изображения
    const handleNewImageDelete = (index) => {
        // Освобождаем URL объекта перед удалением
        URL.revokeObjectURL(newImages[index].preview);

        // Удаляем изображение из массива
        const updatedImages = [...newImages];
        updatedImages.splice(index, 1);
        setNewImages(updatedImages);

        // Корректируем индекс главного изображения если необходимо
        if (primaryNewImageIndex === index) {
            // Если удалили главное изображение, сбрасываем выбор
            setPrimaryNewImageIndex(-1);
        } else if (primaryNewImageIndex > index) {
            // Если удалили изображение перед главным, корректируем индекс
            setPrimaryNewImageIndex(primaryNewImageIndex - 1);
        }
    };

    // Обработчик установки главного изображения (существующее)
    const handleSetPrimaryExisting = (imageId) => {
        setPrimaryImageId(imageId);
        // При выборе существующего, сбрасываем выбор среди новых
        setPrimaryNewImageIndex(-1);
    };

    // Обработчик установки главного изображения (новое)
    const handleSetPrimaryNew = (index) => {
        setPrimaryNewImageIndex(index);
        // При выборе нового, сбрасываем выбор среди существующих
        setPrimaryImageId(null);
    };

    if (attractionLoading || categoriesLoading || metroStationsLoading) {
        return <LoadingSpinner size="lg" message="Загружаем данные для редактирования..." />;
    }

    if (!attraction) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Достопримечательность не найдена</h2>
                    <Link to="/admin" className="btn-primary">
                        Вернуться к админ панели
                    </Link>
                </div>
            </div>
        );
    }

    // Фильтруем существующие изображения, исключая те, что помечены для удаления
    const displayedExistingImages = existingImages
        ? existingImages.filter((img) => !imagesToDelete.includes(img.id))
        : [];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Навигация */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            to={`/attractions/${id}`}
                            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5 mr-2" />К достопримечательности
                        </Link>
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-semibold text-gray-900">Редактирование: {attraction.name}</h1>
                            <button
                                onClick={handleDelete}
                                disabled={deleteMutation.isLoading}
                                className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                <TrashIcon className="w-4 h-4 mr-2" />
                                {deleteMutation.isLoading ? 'Удаление...' : 'Удалить'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Основная форма - используем тот же шаблон, что и в CreateAttractionPage */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Основная информация */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Основная информация</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Название достопримечательности *
                                </label>
                                <input
                                    {...register('name', {
                                        required: 'Название обязательно',
                                        minLength: { value: 2, message: 'Минимум 2 символа' },
                                        maxLength: { value: 200, message: 'Максимум 200 символов' },
                                    })}
                                    type="text"
                                    className={`input-field ${errors.name ? 'input-error' : ''}`}
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Категория *</label>
                                <select
                                    {...register('categoryId', { required: 'Категория обязательна' })}
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
                                <select {...register('isPublished')} className="input-field">
                                    <option value={true}>Опубликовано</option>
                                    <option value={false}>Черновик</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Краткое описание *</label>
                            <textarea
                                {...register('shortDescription', {
                                    required: 'Краткое описание обязательно',
                                    minLength: { value: 10, message: 'Минимум 10 символов' },
                                    maxLength: { value: 500, message: 'Максимум 500 символов' },
                                })}
                                rows={3}
                                className={`input-field ${errors.shortDescription ? 'input-error' : ''}`}
                            />
                            {errors.shortDescription && (
                                <p className="mt-1 text-sm text-red-600">{errors.shortDescription.message}</p>
                            )}
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Полное описание *</label>
                            <textarea
                                {...register('fullDescription', {
                                    required: 'Полное описание обязательно',
                                    minLength: { value: 50, message: 'Минимум 50 символов' },
                                    maxLength: { value: 5000, message: 'Максимум 5000 символов' },
                                })}
                                rows={8}
                                className={`input-field ${errors.fullDescription ? 'input-error' : ''}`}
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
                                <input {...register('workingHours')} type="text" className="input-field" />
                            </div>

                            {/* Стоимость билета */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Стоимость билета</label>
                                <input {...register('ticketPrice')} type="text" className="input-field" />
                            </div>

                            {/* Телефон */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                                <input {...register('phone')} type="tel" className="input-field" />
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
                            <textarea {...register('accessibilityNotes')} rows={3} className="input-field" />
                        </div>
                    </div>

                    {/* Изображения */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Изображения</h2>

                        {/* Существующие изображения */}
                        {displayedExistingImages && displayedExistingImages.length > 0 && (
                            <div className="mt-4">
                                <div className="flex justify-between items-center mb-3">
                                    <p className="text-sm font-medium text-gray-700">
                                        Текущие изображения: {displayedExistingImages.length}
                                    </p>
                                    <p className="text-sm text-blue-600">
                                        Выберите главное изображение, которое будет отображаться в карточке
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {displayedExistingImages.map((image) => (
                                        <div
                                            key={image.id}
                                            className={`
                        relative p-2 rounded-lg border-2 
                        ${image.id === primaryImageId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                    `}
                                        >
                                            {/* Предпросмотр изображения */}
                                            <div className="w-full h-32 bg-gray-100 rounded overflow-hidden mb-2">
                                                <img
                                                    src={`http://localhost:5000${image.path}`}
                                                    alt={image.altText || 'Изображение достопримечательности'}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div
                                                    className="text-xs text-gray-500 truncate max-w-[120px]"
                                                    title={image.filename}
                                                >
                                                    {image.filename && image.filename.length > 15
                                                        ? image.filename.substring(0, 12) + '...'
                                                        : image.filename}
                                                    <span className="text-gray-400">
                                                        {image.size
                                                            ? `(${(image.size / 1024 / 1024).toFixed(2)} MB)`
                                                            : ''}
                                                    </span>
                                                </div>

                                                <div className="flex space-x-1">
                                                    {/* Кнопка выбора главного изображения */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetPrimaryExisting(image.id)}
                                                        className={`p-1 rounded hover:bg-gray-100 focus:outline-none transition-colors`}
                                                        title="Сделать главным изображением"
                                                    >
                                                        {image.id === primaryImageId ? (
                                                            <StarFilledIcon className="w-5 h-5 text-yellow-500" />
                                                        ) : (
                                                            <StarIcon className="w-5 h-5 text-gray-400" />
                                                        )}
                                                    </button>

                                                    {/* Кнопка удаления изображения */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleExistingImageDelete(image.id)}
                                                        className="p-1 rounded hover:bg-red-100 focus:outline-none transition-colors"
                                                        title="Удалить изображение"
                                                    >
                                                        <TrashIcon className="w-5 h-5 text-red-500" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Индикатор главного изображения */}
                                            {image.id === primaryImageId && (
                                                <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg">
                                                    Главное
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Загрузка новых изображений */}
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-4 mt-4">Добавить новые изображения</p>
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

                            {newImages.length > 0 && (
                                <div className="mt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-md font-semibold text-gray-700">
                                            Новые изображения ({newImages.length})
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                newImages.forEach((image) => URL.revokeObjectURL(image.preview));
                                                setNewImages([]);
                                                setPrimaryNewImageIndex(-1);
                                            }}
                                            className="text-sm text-red-600 hover:text-red-800"
                                        >
                                            Очистить все
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-3">
                                        {newImages.map((image, index) => (
                                            <div
                                                key={index}
                                                className={`relative border rounded-lg overflow-hidden ${
                                                    index === primaryNewImageIndex
                                                        ? 'ring-2 ring-blue-500 border-blue-500'
                                                        : 'border-gray-300'
                                                }`}
                                            >
                                                <img
                                                    src={image.preview}
                                                    alt={`Предпросмотр ${index + 1}`}
                                                    className="w-full h-32 object-cover"
                                                />

                                                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
                                                    <div className="bg-white bg-opacity-90 p-2 rounded-lg shadow-md flex space-x-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSetPrimaryNew(index)}
                                                            className={`p-1 rounded-md ${
                                                                index === primaryNewImageIndex
                                                                    ? 'bg-blue-500 text-white'
                                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                            }`}
                                                            title="Сделать главным изображением"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-5 w-5"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                            >
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleNewImageDelete(index)}
                                                            className="p-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200"
                                                            title="Удалить изображение"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-5 w-5"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>

                                                {index === primaryNewImageIndex && (
                                                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                                        Главное
                                                    </div>
                                                )}

                                                <div className="p-2 text-xs text-gray-500 truncate">
                                                    {image.name} ({(image.size / 1024 / 1024).toFixed(2)} MB)
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Кнопки действий */}
                    <div className="flex items-center justify-end space-x-4 pb-8">
                        <Link to={`/attractions/${id}`} className="btn-secondary">
                            Отмена
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting || updateMutation.isLoading}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting || updateMutation.isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
