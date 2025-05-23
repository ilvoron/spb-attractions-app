const express = require('express');
const router = express.Router();
const attractionController = require('../controllers/attractionController');
const imageController = require('../controllers/imageController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
    validateAttractionCreation,
    validateAttractionUpdate,
    validateSearchQuery,
    validateId,
} = require('../middleware/validation');
const { uploadMultiple, handleUploadErrors } = require('../middleware/upload');

// GET /api/attractions - Получение списка достопримечательностей с фильтрацией
router.get('/', validateSearchQuery, attractionController.getAttractions);

// GET /api/attractions/:id - Получение детальной информации о достопримечательности
router.get('/:id', validateId, attractionController.getAttractionById);

// POST /api/attractions - Создание новой достопримечательности (только админы)
router.post('/', authenticateToken, requireAdmin, validateAttractionCreation, attractionController.createAttraction);

// PUT /api/attractions/:id - Обновление достопримечательности (только админы)
router.put(
    '/:id',
    authenticateToken,
    requireAdmin,
    validateId,
    validateAttractionUpdate,
    attractionController.updateAttraction
);

// DELETE /api/attractions/:id - Удаление достопримечательности (только админы)
router.delete('/:id', authenticateToken, requireAdmin, validateId, attractionController.deleteAttraction);

// POST /api/attractions/:id/images - Загрузка изображений для достопримечательности
router.post(
    '/:id/images',
    authenticateToken,
    requireAdmin,
    validateId,
    (req, res, next) => {
        uploadMultiple(req, res, (err) => {
            if (err) {
                return handleUploadErrors(err, req, res, next);
            }
            next();
        });
    },
    imageController.uploadImages
);

// DELETE /api/attractions/:attractionId/images/:imageId - Удаление изображения
router.delete('/:attractionId/images/:imageId', authenticateToken, requireAdmin, imageController.deleteImage);

module.exports = router;
