const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateId } = require('../middleware/validation');
const { validateCategory } = require('../middleware/validation');

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
