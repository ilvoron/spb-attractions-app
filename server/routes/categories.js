const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateId } = require('../middleware/validation');
const { body } = require('express-validator');

// Валидация для категорий
const validateCategory = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Название категории должно содержать от 2 до 100 символов'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Описание не должно превышать 500 символов'),

    body('color')
        .optional()
        .matches(/^#[0-9A-Fa-f]{6}$/)
        .withMessage('Цвет должен быть в формате hex (#RRGGBB)'),
];

// GET /api/categories - Получение всех категорий
router.get('/', categoryController.getCategories);

// GET /api/categories/:id - Получение конкретной категории
router.get('/:id', validateId, categoryController.getCategoryById);

// GET /api/categories/:id/attractions - Получение достопримечательностей категории
router.get('/:id/attractions', validateId, categoryController.getCategoryAttractions);

// POST /api/categories - Создание новой категории (только админы)
router.post('/', authenticateToken, requireAdmin, validateCategory, categoryController.createCategory);

// PUT /api/categories/:id - Обновление категории (только админы)
router.put('/:id', authenticateToken, requireAdmin, validateId, validateCategory, categoryController.updateCategory);

// DELETE /api/categories/:id - Удаление категории (только админы)
router.delete('/:id', authenticateToken, requireAdmin, validateId, categoryController.deleteCategory);

module.exports = router;
