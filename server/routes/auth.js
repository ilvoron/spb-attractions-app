const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
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

module.exports = router;
