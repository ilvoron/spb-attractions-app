const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const passwordResetController = require('../controllers/passwordResetController');
const { authenticateToken } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin, handleValidationErrors } = require('../middleware/validation');

/**
 * Обновленные маршруты аутентификации
 * Файл: server/routes/auth.js
 *
 * Включает в себя все функции аутентификации:
 * - Регистрация и вход
 * - Восстановление пароля
 * - Управление профилем
 */

// =============================================================================
// ОСНОВНЫЕ МАРШРУТЫ АУТЕНТИФИКАЦИИ
// =============================================================================

// POST /api/auth/register - Регистрация нового пользователя
router.post('/register', validateUserRegistration, authController.register);

// POST /api/auth/login - Вход в систему
router.post('/login', validateUserLogin, authController.login);

// GET /api/auth/me - Получение информации о текущем пользователе
router.get('/me', authenticateToken, authController.getCurrentUser);

// POST /api/auth/logout - Выход из системы (фронтенд удаляет токен)
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Успешный выход из системы',
    });
});

// =============================================================================
// МАРШРУТЫ ВОССТАНОВЛЕНИЯ ПАРОЛЯ
// =============================================================================

// Валидация для запроса восстановления пароля
const validatePasswordResetRequest = [
    body('email')
        .isEmail()
        .withMessage('Некорректный формат email адреса')
        .normalizeEmail()
        .isLength({ min: 5, max: 255 })
        .withMessage('Email должен содержать от 5 до 255 символов'),

    handleValidationErrors,
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

    handleValidationErrors,
];

// Валидация для проверки токена
const validateTokenCheck = [
    query('token')
        .notEmpty()
        .withMessage('Токен обязателен')
        .isLength({ min: 32, max: 128 })
        .withMessage('Некорректный формат токена'),

    query('email').isEmail().withMessage('Некорректный формат email адреса').normalizeEmail(),

    handleValidationErrors,
];

/**
 * POST /api/auth/forgot-password
 * Запрос восстановления пароля
 *
 * Этот маршрут принимает email пользователя и инициирует процесс
 * восстановления пароля. В реальном приложении отправляет email
 * с ссылкой для сброса пароля.
 */
router.post('/forgot-password', validatePasswordResetRequest, passwordResetController.requestPasswordReset);

/**
 * POST /api/auth/reset-password
 * Сброс пароля по токену
 *
 * Этот маршрут принимает токен из email, email пользователя и новый пароль.
 * Если токен действителен и не истек, устанавливает новый пароль.
 */
router.post('/reset-password', validatePasswordReset, passwordResetController.resetPassword);

/**
 * GET /api/auth/validate-reset-token
 * Проверка действительности токена восстановления
 *
 * Позволяет фронтенду проверить, действителен ли токен, перед тем как
 * показать пользователю форму для ввода нового пароля.
 */
router.get('/validate-reset-token', validateTokenCheck, passwordResetController.validateResetToken);

// =============================================================================
// ДОПОЛНИТЕЛЬНЫЕ МАРШРУТЫ УПРАВЛЕНИЯ ПРОФИЛЕМ
// =============================================================================

// Валидация для изменения пароля (для авторизованных пользователей)
const validatePasswordChange = [
    body('currentPassword').notEmpty().withMessage('Текущий пароль обязателен'),

    body('newPassword')
        .isLength({ min: 6, max: 128 })
        .withMessage('Новый пароль должен содержать от 6 до 128 символов')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Новый пароль должен содержать минимум одну строчную букву, одну заглавную букву и одну цифру'),

    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error('Подтверждение пароля не совпадает с новым паролем');
        }
        return true;
    }),

    handleValidationErrors,
];

/**
 * POST /api/auth/change-password
 * Изменение пароля для авторизованного пользователя
 *
 * Позволяет пользователю изменить пароль, зная текущий.
 * Отличается от восстановления пароля тем, что требует знания текущего пароля.
 */
router.post('/change-password', authenticateToken, validatePasswordChange, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        // Получаем пользователя из базы данных
        const user = await require('../models').User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден',
            });
        }

        // Проверяем текущий пароль
        const bcrypt = require('bcryptjs');
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Неверный текущий пароль',
            });
        }

        // Хешируем новый пароль
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Обновляем пароль
        await user.update({ password: hashedNewPassword });

        console.log(`Пароль изменен для пользователя ${user.id}`);

        res.json({
            success: true,
            message: 'Пароль успешно изменен',
        });
    } catch (error) {
        console.error('Ошибка при изменении пароля:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера',
        });
    }
});

module.exports = router;
