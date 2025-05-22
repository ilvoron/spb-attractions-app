const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();
const passwordResetController = require('../controllers/passwordResetController');

/**
 * Маршруты для восстановления пароля
 * Файл: server/routes/passwordReset.js
 *
 * Эти маршруты должны быть интегрированы в основной файл маршрутов аутентификации
 * или подключены отдельно в server.js
 */

// Валидация для запроса восстановления пароля
const validatePasswordResetRequest = [
    body('email')
        .isEmail()
        .withMessage('Некорректный формат email адреса')
        .normalizeEmail()
        .isLength({ min: 5, max: 255 })
        .withMessage('Email должен содержать от 5 до 255 символов'),
];

// Валидация для сброса пароля
const validatePasswordReset = [
    body('token')
        .notEmpty()
        .withMessage('Токен восстановления обязателен')
        .isLength({ min: 32, max: 128 })
        .withMessage('Некорректный формат токена'),

    body('email').isEmail().withMessage('Некорректный формат email адреса').normalizeEmail(),

    body('newPassword')
        .isLength({ min: 6, max: 128 })
        .withMessage('Пароль должен содержать от 6 до 128 символов')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Пароль должен содержать минимум одну строчную букву, одну заглавную букву и одну цифру'),
];

// Валидация для проверки токена
const validateTokenCheck = [
    query('token')
        .notEmpty()
        .withMessage('Токен обязателен')
        .isLength({ min: 32, max: 128 })
        .withMessage('Некорректный формат токена'),

    query('email').isEmail().withMessage('Некорректный формат email адреса').normalizeEmail(),
];

/**
 * POST /api/auth/forgot-password
 * Запрос восстановления пароля
 *
 * Принимает email пользователя и отправляет ссылку для сброса пароля
 * (в демо версии просто логирует ссылку в консоль)
 */
router.post('/forgot-password', validatePasswordResetRequest, passwordResetController.requestPasswordReset);

/**
 * POST /api/auth/reset-password
 * Сброс пароля по токену
 *
 * Принимает токен из email, email пользователя и новый пароль
 * Устанавливает новый пароль, если токен действителен
 */
router.post('/reset-password', validatePasswordReset, passwordResetController.resetPassword);

/**
 * GET /api/auth/validate-reset-token
 * Проверка действительности токена восстановления
 *
 * Позволяет фронтенду проверить, действителен ли токен,
 * перед тем как показать форму ввода нового пароля
 */
router.get('/validate-reset-token', validateTokenCheck, passwordResetController.validateResetToken);

module.exports = router;
