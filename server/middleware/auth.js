const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware для проверки JWT токена
const authenticateToken = async (req, res, next) => {
    try {
        // Извлекаем токен из заголовка Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                message: 'Токен доступа не предоставлен',
            });
        }

        // Проверяем валидность токена
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // Проверяем, существует ли пользователь в базе данных
        const user = await User.findByPk(decoded.userId, {
            attributes: ['id', 'email', 'role', 'createdAt'],
        });

        if (!user) {
            return res.status(401).json({
                message: 'Пользователь не найден',
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message: 'Аккаунт заблокирован',
            });
        }

        // Добавляем информацию о пользователе в объект запроса
        req.user = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        next();
    } catch (error) {
        console.error('Ошибка аутентификации:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: 'Недействительный токен',
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Токен истек',
            });
        }

        return res.status(500).json({
            message: 'Внутренняя ошибка сервера при аутентификации',
        });
    }
};

// Middleware для проверки роли администратора
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Доступ запрещен. Требуются права администратора',
        });
    }
    next();
};

// Middleware для проверки владельца ресурса или администратора
const requireOwnerOrAdmin = (resourceUserId) => {
    return (req, res, next) => {
        if (req.user.role === 'admin' || req.user.userId === resourceUserId) {
            next();
        } else {
            return res.status(403).json({
                message: 'Доступ запрещен. Недостаточно прав',
            });
        }
    };
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireOwnerOrAdmin,
};
