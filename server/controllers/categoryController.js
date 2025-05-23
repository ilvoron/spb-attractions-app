const { Category, Attraction, MetroStation, Image } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// Получение всех категорий
const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            attributes: ['id', 'name', 'description', 'slug', 'color'],
            include: [
                {
                    model: Attraction,
                    as: 'attractions',
                    attributes: ['id'],
                    required: false, // LEFT JOIN - показываем категории даже без достопримечательностей
                },
            ],
            order: [['name', 'ASC']], // Сортируем по алфавиту для удобства
        });

        // Добавляем количество достопримечательностей для каждой категории
        // Это как подсчет книг в каждом разделе библиотеки
        const categoriesWithCounts = categories.map((category) => ({
            id: category.id,
            name: category.name,
            description: category.description,
            slug: category.slug,
            color: category.color,
            attractionsCount: category.attractions ? category.attractions.length : 0,
        }));

        res.json({
            message: 'Категории успешно получены',
            categories: categoriesWithCounts,
        });
    } catch (error) {
        console.error('Ошибка получения категорий:', error);
        res.status(500).json({
            message: 'Внутренняя ошибка сервера при получении категорий',
        });
    }
};

// Получение конкретной категории по ID
// Функция работает как детальный просмотр раздела в библиотеке
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findByPk(id, {
            include: [
                {
                    model: Attraction,
                    as: 'attractions',
                    required: false,
                    attributes: ['id', 'name', 'shortDescription', 'slug'],
                    include: [
                        {
                            model: Image,
                            as: 'images',
                            where: { isPrimary: true },
                            required: false,
                            attributes: ['filename', 'path', 'altText'],
                        },
                    ],
                },
            ],
        });

        if (!category) {
            return res.status(404).json({
                message: 'Категория не найдена',
            });
        }

        res.json({
            message: 'Категория успешно получена',
            category,
        });
    } catch (error) {
        console.error('Ошибка получения категории:', error);
        res.status(500).json({
            message: 'Внутренняя ошибка сервера при получении категории',
        });
    }
};

// Получение достопримечательностей конкретной категории
// Это как получение всех книг из определенного раздела библиотеки
const getCategoryAttractions = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 12 } = req.query;

        // Сначала проверяем, существует ли категория
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({
                message: 'Категория не найдена',
            });
        }

        // Получаем достопримечательности с пагинацией
        const offset = (page - 1) * limit;
        const { count, rows: attractions } = await Attraction.findAndCountAll({
            where: {
                categoryId: id,
            },
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
            order: [['name', 'ASC']],
        });

        // Подготавливаем метаданные для пагинации
        const totalPages = Math.ceil(count / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.json({
            message: `Достопримечательности категории "${category.name}" успешно получены`,
            category: {
                id: category.id,
                name: category.name,
                description: category.description,
                color: category.color,
            },
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
        console.error('Ошибка получения достопримечательностей категории:', error);
        res.status(500).json({
            message: 'Внутренняя ошибка сервера',
        });
    }
};

// Создание новой категории (только для администраторов)
const createCategory = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Ошибка валидации данных',
                errors: errors.array().map((error) => ({
                    field: error.path,
                    message: error.msg,
                    value: error.value,
                })),
            });
        }

        const { name, description, color } = req.body;

        // Создаем slug из названия для человекочитаемых URL
        // Например, "Музеи и галереи" становится "muzei-i-galerei"
        const baseSlug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-zA-Zа-яА-Я0-9\s]/g, '') // Убираем спецсимволы
            .replace(/\s+/g, '-'); // Заменяем пробелы на дефисы

        // Проверяем уникальность названия и slug
        const existingCategory = await Category.findOne({
            where: {
                [Op.or]: [{ name: name }, { slug: { [Op.like]: `${baseSlug}%` } }],
            },
        });

        if (existingCategory) {
            return res.status(409).json({
                message: 'Категория с таким названием уже существует',
            });
        }

        // Создаем уникальный slug добавлением timestamp при необходимости
        const slug = existingCategory ? `${baseSlug}-${Date.now()}` : baseSlug;

        const category = await Category.create({
            name,
            description: description || '',
            slug,
            color: color || '#3B82F6', // Синий цвет по умолчанию
        });

        res.status(201).json({
            message: 'Категория успешно создана',
            category: {
                id: category.id,
                name: category.name,
                description: category.description,
                slug: category.slug,
                color: category.color,
            },
        });
    } catch (error) {
        console.error('Ошибка создания категории:', error);
        res.status(500).json({
            message: 'Внутренняя ошибка сервера при создании категории',
        });
    }
};

// Обновление существующей категории (только для администраторов)
const updateCategory = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Ошибка валидации данных',
                errors: errors.array(),
            });
        }

        const { id } = req.params;
        const updateData = req.body;

        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({
                message: 'Категория не найдена',
            });
        }

        // Если изменяется название, обновляем и slug
        if (updateData.name && updateData.name !== category.name) {
            updateData.slug =
                updateData.name
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-zA-Zа-яА-Я0-9\s]/g, '')
                    .replace(/\s+/g, '-') +
                '-' +
                Date.now();
        }

        await category.update(updateData);

        res.json({
            message: 'Категория успешно обновлена',
            category: {
                id: category.id,
                name: category.name,
                description: category.description,
                slug: category.slug,
                color: category.color,
            },
        });
    } catch (error) {
        console.error('Ошибка обновления категории:', error);
        res.status(500).json({
            message: 'Внутренняя ошибка сервера при обновлении категории',
        });
    }
};

// Удаление категории (только для администраторов)
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findByPk(id, {
            include: [
                {
                    model: Attraction,
                    as: 'attractions',
                },
            ],
        });

        if (!category) {
            return res.status(404).json({
                message: 'Категория не найдена',
            });
        }

        // Проверяем, есть ли достопримечательности в этой категории
        if (category.attractions && category.attractions.length > 0) {
            return res.status(400).json({
                message: `Нельзя удалить категорию, содержащую ${category.attractions.length} достопримечательностей. Сначала переместите или удалите их.`,
            });
        }

        await category.destroy();

        res.json({
            message: 'Категория успешно удалена',
        });
    } catch (error) {
        console.error('Ошибка удаления категории:', error);
        res.status(500).json({
            message: 'Внутренняя ошибка сервера при удалении категории',
        });
    }
};

// Экспортируем все функции для использования в маршрутах
module.exports = {
    getCategories,
    getCategoryById,
    getCategoryAttractions,
    createCategory,
    updateCategory,
    deleteCategory,
};
