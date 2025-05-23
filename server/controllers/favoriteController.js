const { Favorite, Attraction, Category, Image } = require('../models');

/**
 * Контроллер для работы с избранными достопримечательностями
 * Файл: server/controllers/favoriteController.js
 */

// Получение всех избранных достопримечательностей пользователя
const getFavorites = async (req, res) => {
    try {
        const userId = req.user.userId;

        const favorites = await Favorite.findAll({
            where: { userId },
            include: [
                {
                    model: Attraction,
                    as: 'attraction',
                    include: [
                        {
                            model: Category,
                            as: 'category',
                            attributes: ['id', 'name', 'color'],
                        },
                        {
                            model: Image,
                            as: 'images',
                            where: { isPrimary: true },
                            required: false,
                            attributes: ['id', 'path', 'altText'],
                        },
                    ],
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        // Преобразуем данные для более удобного использования на клиенте
        const formattedFavorites = favorites.map((fav) => ({
            id: fav.id,
            attractionId: fav.attractionId,
            notes: fav.notes,
            createdAt: fav.createdAt,
            attraction: fav.attraction,
        }));

        res.json({
            success: true,
            message: 'Избранные достопримечательности успешно получены',
            favorites: formattedFavorites,
        });
    } catch (error) {
        console.error('Ошибка при получении избранного:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера при получении избранного',
        });
    }
};

// Добавление достопримечательности в избранное
const addToFavorites = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { attractionId } = req.params;
        const { notes } = req.body;

        // Проверяем, существует ли достопримечательность
        const attraction = await Attraction.findByPk(attractionId);
        if (!attraction) {
            return res.status(404).json({
                success: false,
                message: 'Достопримечательность не найдена',
            });
        }

        // Проверяем, не добавлена ли уже достопримечательность в избранное
        const existingFavorite = await Favorite.findOne({
            where: { userId, attractionId },
        });

        if (existingFavorite) {
            return res.status(409).json({
                success: false,
                message: 'Эта достопримечательность уже в избранном',
                favorite: existingFavorite,
            });
        }

        // Создаем новую запись в избранном
        const favorite = await Favorite.create({
            userId,
            attractionId,
            notes: notes || null,
        });

        res.status(201).json({
            success: true,
            message: 'Достопримечательность успешно добавлена в избранное',
            favorite,
        });
    } catch (error) {
        console.error('Ошибка при добавлении в избранное:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера при добавлении в избранное',
        });
    }
};

// Удаление достопримечательности из избранного
const removeFromFavorites = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { attractionId } = req.params;

        const favorite = await Favorite.findOne({
            where: { userId, attractionId },
        });

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: 'Достопримечательность не найдена в избранном',
            });
        }

        await favorite.destroy();

        res.json({
            success: true,
            message: 'Достопримечательность удалена из избранного',
        });
    } catch (error) {
        console.error('Ошибка при удалении из избранного:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера при удалении из избранного',
        });
    }
};

// Проверка, есть ли достопримечательность в избранном
const checkFavoriteStatus = async (req, res) => {
    try {
        // Если пользователь не аутентифицирован, возвращаем false
        if (!req.user) {
            return res.json({
                success: true,
                isFavorite: false,
            });
        }

        const userId = req.user.userId;
        const { attractionId } = req.params;

        const favorite = await Favorite.findOne({
            where: { userId, attractionId },
        });

        res.json({
            success: true,
            isFavorite: !!favorite,
            favorite: favorite || null,
        });
    } catch (error) {
        console.error('Ошибка при проверке статуса избранного:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера при проверке статуса избранного',
        });
    }
};

// Обновление заметок для избранной достопримечательности
const updateFavoriteNotes = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { attractionId } = req.params;
        const { notes } = req.body;

        const favorite = await Favorite.findOne({
            where: { userId, attractionId },
        });

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: 'Достопримечательность не найдена в избранном',
            });
        }

        await favorite.update({ notes });

        res.json({
            success: true,
            message: 'Заметки обновлены',
            favorite,
        });
    } catch (error) {
        console.error('Ошибка при обновлении заметок:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера при обновлении заметок',
        });
    }
};

module.exports = {
    getFavorites,
    addToFavorites,
    removeFromFavorites,
    checkFavoriteStatus,
    updateFavoriteNotes,
};
