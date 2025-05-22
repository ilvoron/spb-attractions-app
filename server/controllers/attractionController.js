const { Attraction, Category, MetroStation, Image, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// Получение списка всех достопримечательностей с фильтрацией и поиском
const getAttractions = async (req, res) => {
    try {
        const { page = 1, limit = 12, category, metro, search, district, accessibility, sort = 'name' } = req.query;

        // Построение условий для фильтрации
        const whereConditions = {
            isPublished: true,
        };

        // Фильтр по категории
        if (category) {
            whereConditions.categoryId = category;
        }

        // Фильтр по станции метро
        if (metro) {
            whereConditions.metroStationId = metro;
        }

        // Фильтр по району
        if (district) {
            whereConditions.district = {
                [Op.iLike]: `%${district}%`,
            };
        }

        // Поиск по названию и описанию
        if (search) {
            whereConditions[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { shortDescription: { [Op.iLike]: `%${search}%` } },
                { fullDescription: { [Op.iLike]: `%${search}%` } },
            ];
        }

        // Фильтр по доступности
        if (accessibility === 'wheelchair') {
            whereConditions.wheelchairAccessible = true;
        }

        // Настройка сортировки
        let orderBy = [['name', 'ASC']];
        if (sort === 'newest') {
            orderBy = [['createdAt', 'DESC']];
        } else if (sort === 'category') {
            orderBy = [
                ['categoryId', 'ASC'],
                ['name', 'ASC'],
            ];
        }

        // Выполнение запроса с пагинацией
        const offset = (page - 1) * limit;
        const { count, rows: attractions } = await Attraction.findAndCountAll({
            where: whereConditions,
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
                    where: { isPrimary: true },
                    required: false,
                    attributes: ['id', 'filename', 'path', 'altText'],
                },
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: orderBy,
        });

        // Подготовка метаданных для пагинации
        const totalPages = Math.ceil(count / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.json({
            attractions,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: count,
                hasNextPage,
                hasPrevPage,
                itemsPerPage: parseInt(limit),
            },
        });
    } catch (error) {
        console.error('Ошибка получения достопримечательностей:', error);
        res.status(500).json({
            message: 'Внутренняя ошибка сервера',
        });
    }
};

// Получение детальной информации о конкретной достопримечательности
const getAttractionById = async (req, res) => {
    try {
        const { id } = req.params;

        const attraction = await Attraction.findByPk(id, {
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
                    attributes: ['id', 'filename', 'path', 'altText', 'isPrimary'],
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'email'],
                },
            ],
        });

        if (!attraction) {
            return res.status(404).json({
                message: 'Достопримечательность не найдена',
            });
        }

        if (!attraction.isPublished) {
            return res.status(403).json({
                message: 'Достопримечательность не опубликована',
            });
        }

        res.json({ attraction });
    } catch (error) {
        console.error('Ошибка получения достопримечательности:', error);
        res.status(500).json({
            message: 'Внутренняя ошибка сервера',
        });
    }
};

// Создание новой достопримечательности (только для администраторов)
const createAttraction = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
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
            slug: `${slug}-${Date.now()}`, // Добавляем timestamp для уникальности
            createdBy: req.user.userId,
        };

        const attraction = await Attraction.create(attractionData);

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
            message: 'Достопримечательность успешно создана',
            attraction: createdAttraction,
        });
    } catch (error) {
        console.error('Ошибка создания достопримечательности:', error);
        res.status(500).json({
            message: 'Внутренняя ошибка сервера',
        });
    }
};

// Обновление достопримечательности
const updateAttraction = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Ошибка валидации',
                errors: errors.array(),
            });
        }

        const { id } = req.params;
        const updateData = req.body;

        // Находим достопримечательность
        const attraction = await Attraction.findByPk(id);
        if (!attraction) {
            return res.status(404).json({
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

        // Обновляем достопримечательность
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

        res.json({
            message: 'Достопримечательность успешно обновлена',
            attraction: updatedAttraction,
        });
    } catch (error) {
        console.error('Ошибка обновления достопримечательности:', error);
        res.status(500).json({
            message: 'Внутренняя ошибка сервера',
        });
    }
};

// Удаление достопримечательности
const deleteAttraction = async (req, res) => {
    try {
        const { id } = req.params;

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

        // Удаляем достопримечательность (каскадное удаление изображений настроено в модели)
        await attraction.destroy();

        res.json({
            message: 'Достопримечательность успешно удалена',
        });
    } catch (error) {
        console.error('Ошибка удаления достопримечательности:', error);
        res.status(500).json({
            message: 'Внутренняя ошибка сервера',
        });
    }
};

// Получение предложений для автодополнения поиска
const getSearchSuggestions = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.length < 2) {
            return res.json({ suggestions: [] });
        }

        // Поиск совпадений в названиях достопримечательностей
        const attractions = await Attraction.findAll({
            where: {
                name: {
                    [Op.iLike]: `%${query}%`,
                },
                isPublished: true,
            },
            attributes: ['id', 'name', 'slug'],
            limit: 8,
            order: [['name', 'ASC']],
        });

        // Поиск совпадений в названиях категорий
        const categories = await Category.findAll({
            where: {
                name: {
                    [Op.iLike]: `%${query}%`,
                },
            },
            attributes: ['id', 'name', 'slug'],
            limit: 5,
            order: [['name', 'ASC']],
        });

        const suggestions = [
            ...attractions.map((attraction) => ({
                type: 'attraction',
                id: attraction.id,
                name: attraction.name,
                slug: attraction.slug,
            })),
            ...categories.map((category) => ({
                type: 'category',
                id: category.id,
                name: category.name,
                slug: category.slug,
            })),
        ];

        res.json({ suggestions });
    } catch (error) {
        console.error('Ошибка получения предложений:', error);
        res.status(500).json({
            message: 'Внутренняя ошибка сервера',
        });
    }
};

// Получение статистики для админ панели
const getStatistics = async (req, res) => {
    try {
        // Общее количество достопримечательностей
        const totalAttractions = await Attraction.count();

        // Количество опубликованных достопримечательностей
        const publishedAttractions = await Attraction.count({
            where: { isPublished: true },
        });

        // Количество черновиков
        const draftAttractions = totalAttractions - publishedAttractions;

        // Количество категорий
        const totalCategories = await Category.count();

        // Достопримечательности по категориям
        const attractionsByCategory = await Attraction.findAll({
            attributes: [[require('sequelize').fn('COUNT', require('sequelize').col('Attraction.id')), 'count']],
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['name', 'color'],
                },
            ],
            where: { isPublished: true },
            group: ['category.id', 'category.name', 'category.color'],
            raw: true,
        });

        // Последние добавленные достопримечательности
        const recentAttractions = await Attraction.findAll({
            attributes: ['id', 'name', 'createdAt', 'isPublished'],
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['email'],
                },
            ],
            order: [['createdAt', 'DESC']],
            limit: 10,
        });

        const statistics = {
            totals: {
                attractions: totalAttractions,
                published: publishedAttractions,
                drafts: draftAttractions,
                categories: totalCategories,
            },
            attractionsByCategory,
            recentAttractions,
        };

        res.json({ statistics });
    } catch (error) {
        console.error('Ошибка получения статистики:', error);
        res.status(500).json({
            message: 'Внутренняя ошибка сервера',
        });
    }
};

module.exports = {
    getAttractions,
    getAttractionById,
    createAttraction,
    updateAttraction,
    deleteAttraction,
    getSearchSuggestions,
    getStatistics,
};
