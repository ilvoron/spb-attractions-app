const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticateToken } = require('../middleware/auth');
const { param } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

/**
 * Маршруты для работы с избранными достопримечательностями
 * Файл: server/routes/favorites.js
 */

// Валидация параметра attractionId
const validateAttractionId = [
    param('attractionId').isInt({ min: 1 }).withMessage('ID достопримечательности должен быть положительным числом'),
    handleValidationErrors,
];

// Все маршруты избранного требуют аутентификации
router.use(authenticateToken);

// GET /api/favorites - Получение всех избранных достопримечательностей пользователя
router.get('/', favoriteController.getFavorites);

// POST /api/favorites/:attractionId - Добавление достопримечательности в избранное
router.post('/:attractionId', validateAttractionId, favoriteController.addToFavorites);

// DELETE /api/favorites/:attractionId - Удаление достопримечательности из избранного
router.delete('/:attractionId', validateAttractionId, favoriteController.removeFromFavorites);

// GET /api/favorites/:attractionId/check - Проверка, находится ли достопримечательность в избранном
router.get('/:attractionId/check', validateAttractionId, favoriteController.checkFavoriteStatus);

// PATCH /api/favorites/:attractionId/notes - Обновление заметок для избранной достопримечательности
router.patch('/:attractionId/notes', validateAttractionId, favoriteController.updateFavoriteNotes);

module.exports = router;
