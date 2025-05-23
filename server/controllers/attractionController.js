const { Attraction, Category, MetroStation, Image, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// Получение списка всех достопримечательностей с фильтрацией и поиском
// Получение списка всех достопримечательностей с фильтрацией и поиском
const getAttractions = async (req, res) => {
    try {
        // Извлекаем параметры из query string с безопасными значениями по умолчанию
        const { page = 1, limit = 12, category, metro, search, accessibility, sort = 'name' } = req.query;

        // Преобразуем строки в числа для безопасности
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 12));
        const categoryId = parseInt(category) || 0;
        const metroId = parseInt(metro) || 0;

        console.log('Запрос достопримечательностей с параметрами:', {
            page: pageNum,
            limit: limitNum,
            category: categoryId,
            metro: metroId,
            search,
            accessibility,
            sort,
        });

        // Построение условий для фильтрации
        whereConditions = {};

        // Фильтр по категории - только если больше нуля
        if (categoryId > 0) {
            whereConditions.categoryId = categoryId;
        }

        // Фильтр по станции метро - только если больше нуля
        if (metroId > 0) {
            whereConditions.metroStationId = metroId;
        }

        // Поиск по названию и описанию
        if (search && search.trim()) {
            const searchTerm = search.trim();
            whereConditions[Op.or] = [
                { name: { [Op.iLike]: `%${searchTerm}%` } },
                { shortDescription: { [Op.iLike]: `%${searchTerm}%` } },
                { fullDescription: { [Op.iLike]: `%${searchTerm}%` } },
                { address: { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }

        // Фильтр по доступности
        if (accessibility) {
            // Если accessibility приходит как строка с запятыми, разбиваем на массив
            const accessibilityArray = Array.isArray(accessibility)
                ? accessibility
                : typeof accessibility === 'string'
                ? accessibility.includes(',')
                    ? accessibility.split(',')
                    : [accessibility]
                : [];

            if (accessibilityArray.length > 0) {
                console.log('Параметры доступности:', accessibilityArray);

                accessibilityArray.forEach((item) => {
                    switch (item) {
                        case 'wheelchair':
                            whereConditions.wheelchairAccessible = true;
                            break;
                        case 'audio':
                            whereConditions.hasAudioGuide = true;
                            break;
                        case 'elevator':
                            whereConditions.hasElevator = true;
                            break;
                        case 'sign_language':
                            whereConditions.hasSignLanguageSupport = true;
                            break;
                    }
                });
            }
        }

        console.log('Условия WHERE:', JSON.stringify(whereConditions, null, 2));

        // Настройка сортировки
        let orderBy = [['name', 'ASC']];

        switch (sort) {
            case 'newest':
                orderBy = [['createdAt', 'DESC']];
                break;
            case 'oldest':
                orderBy = [['createdAt', 'ASC']];
                break;
            case 'category':
                orderBy = [
                    [{ model: Category, as: 'category' }, 'name', 'ASC'],
                    ['name', 'ASC'],
                ];
                break;
        }

        // Выполнение запроса с пагинацией
        const offset = (pageNum - 1) * limitNum;

        const { count, rows: attractions } = await Attraction.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'slug', 'color'],
                    required: false,
                },
                {
                    model: MetroStation,
                    as: 'metroStation',
                    attributes: ['id', 'name', 'lineColor', 'lineName'],
                    required: false,
                },
                {
                    model: Image,
                    as: 'images',
                    where: { isPrimary: true },
                    required: false,
                    attributes: ['id', 'filename', 'path', 'altText'],
                },
            ],
            limit: limitNum,
            offset: offset,
            order: orderBy,
        });

        console.log(`Найдено достопримечательностей: ${count}, возвращаем: ${attractions.length}`);

        // Подготовка метаданных для пагинации
        const totalPages = Math.ceil(count / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;

        const response = {
            success: true,
            message: count > 0 ? `Найдено ${count} достопримечательностей` : 'Достопримечательности не найдены',
            attractions,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalItems: count,
                hasNextPage,
                hasPrevPage,
                itemsPerPage: limitNum,
            },
        };

        res.json(response);
    } catch (error) {
        console.error('Ошибка получения достопримечательностей:', error);

        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера при получении достопримечательностей',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            attractions: [],
            pagination: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                hasNextPage: false,
                hasPrevPage: false,
                itemsPerPage: 12,
            },
        });
    }
};

// Получение детальной информации о конкретной достопримечательности
const getAttractionById = async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`Запрос достопримечательности с ID: ${id}`);

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'Некорректный ID достопримечательности',
            });
        }

        const attraction = await Attraction.findByPk(parseInt(id), {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'slug', 'color', 'description'],
                },
                {
                    model: MetroStation,
                    as: 'metroStation',
                    attributes: ['id', 'name', 'lineColor', 'lineName'],
                },
                {
                    model: Image,
                    as: 'images',
                    attributes: ['id', 'path', 'altText', 'isPrimary', 'originalName', 'size'],
                    order: [
                        ['isPrimary', 'DESC'],
                        ['createdAt', 'ASC'],
                    ],
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'email'],
                },
            ],
        });

        if (!attraction) {
            console.log(`Достопримечательность с ID ${id} не найдена`);
            return res.status(404).json({
                success: false,
                message: 'Достопримечательность не найдена',
            });
        }

        console.log(`Достопримечательность найдена: ${attraction.name}`);

        res.json({
            success: true,
            attraction,
        });
    } catch (error) {
        console.error('Ошибка получения достопримечательности:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Создание новой достопримечательности (только для администраторов)
 */
const createAttraction = async (req, res) => {
    try {
        console.log('Создание новой достопримечательности:', req.body.name);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Ошибка валидации',
                errors: errors.array(),
            });
        }

        // Создание slug из названия
        const slug = req.body.name
            .toLowerCase()
            .trim()
            .replace(/[^a-zA-Zа-яА-Я0-9\s]/g, '')
            .replace(/\s+/g, '-');

        const attractionData = {
            ...req.body,
            slug: `${slug}-${Date.now()}`,
            createdBy: req.user.userId,
        };

        const attraction = await Attraction.create(attractionData);
        console.log(`Достопримечательность создана с ID: ${attraction.id}`);

        // Получаем созданную достопримечательность со всеми связями
        const createdAttraction = await Attraction.findByPk(attraction.id, {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'slug', 'color'],
                },
                {
                    model: MetroStation,
                    as: 'metroStation',
                    attributes: ['id', 'name', 'lineColor', 'lineName'],
                },
            ],
        });

        res.status(201).json({
            success: true,
            message: 'Достопримечательность успешно создана',
            attraction: createdAttraction,
        });
    } catch (error) {
        console.error('Ошибка создания достопримечательности:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера при создании достопримечательности',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Обновление существующей достопримечательности (только для администраторов)
 */
const updateAttraction = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Ошибка валидации',
                errors: errors.array(),
            });
        }

        const { id } = req.params;
        const updateData = req.body;

        console.log(`Обновление достопримечательности ID: ${id}`);

        const attraction = await Attraction.findByPk(id);
        if (!attraction) {
            return res.status(404).json({
                success: false,
                message: 'Достопримечательность не найдена',
            });
        }

        // Обновляем slug если изменилось название
        if (updateData.name && updateData.name !== attraction.name) {
            updateData.slug =
                updateData.name
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-zA-Zа-яА-Я0-9\s]/g, '')
                    .replace(/\s+/g, '-') +
                '-' +
                Date.now();
        }

        await attraction.update(updateData);

        // Получаем обновленную достопримечательность с связями
        const updatedAttraction = await Attraction.findByPk(id, {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'slug', 'color'],
                },
                {
                    model: MetroStation,
                    as: 'metroStation',
                    attributes: ['id', 'name', 'lineColor', 'lineName'],
                },
                {
                    model: Image,
                    as: 'images',
                    attributes: ['id', 'filename', 'path', 'altText', 'isPrimary'],
                },
            ],
        });

        console.log(`Достопримечательность обновлена: ${attraction.name}`);

        res.json({
            success: true,
            message: 'Достопримечательность успешно обновлена',
            attraction: updatedAttraction,
        });
    } catch (error) {
        console.error('Ошибка обновления достопримечательности:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера при обновлении достопримечательности',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Удаление достопримечательности (только для администраторов)
 */
const deleteAttraction = async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`Удаление достопримечательности ID: ${id}`);

        const attraction = await Attraction.findByPk(id, {
            include: [
                {
                    model: Image,
                    as: 'images',
                },
            ],
        });

        if (!attraction) {
            return res.status(404).json({
                success: false,
                message: 'Достопримечательность не найдена',
            });
        }

        // Удаляем связанные изображения с диска
        if (attraction.images && attraction.images.length > 0) {
            const fs = require('fs');
            attraction.images.forEach((image) => {
                if (fs.existsSync(image.path)) {
                    fs.unlinkSync(image.path);
                }
            });
        }

        await attraction.destroy();

        console.log(`Достопримечательность удалена: ${attraction.name}`);

        res.json({
            success: true,
            message: 'Достопримечательность успешно удалена',
        });
    } catch (error) {
        console.error('Ошибка удаления достопримечательности:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера при удалении достопримечательности',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

// Экспортируем все функции
module.exports = {
    getAttractions,
    getAttractionById,
    createAttraction,
    updateAttraction,
    deleteAttraction,
};
