const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { validationResult } = require('express-validator');

// Генерация JWT токена для аутентификации
const generateToken = (userId, role) => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
};

// Контроллер для регистрации новых пользователей
const register = async (req, res) => {
    try {
        // Проверка результатов валидации
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Ошибка валидации',
                errors: errors.array(),
            });
        }

        const { email, password, role = 'user' } = req.body;

        // Проверка, существует ли уже пользователь с такой почтой
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                message: 'Пользователь с такой почтой уже существует',
            });
        }

        // Хеширование пароля перед сохранением
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Создание нового пользователя
        const user = await User.create({
            email,
            password: hashedPassword,
            role,
        });

        // Генерация токена для автоматического входа
        const token = generateToken(user.id, user.role);

        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({
            message: 'Внутренняя ошибка сервера при регистрации',
        });
    }
};

// Контроллер для входа в систему
const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Ошибка валидации',
                errors: errors.array(),
            });
        }

        const { email, password } = req.body;

        // Поиск пользователя по email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                message: 'Неверная почта или пароль',
            });
        }

        // Проверка пароля
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Неверная почта или пароль',
            });
        }

        // Генерация токена
        const token = generateToken(user.id, user.role);

        res.json({
            message: 'Успешный вход в систему',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({
            message: 'Внутренняя ошибка сервера при входе',
        });
    }
};

// Контроллер для получения информации о текущем пользователе
const getCurrentUser = async (req, res) => {
    try {
        // req.user добавляется middleware аутентификации
        const user = await User.findByPk(req.user.userId, {
            attributes: ['id', 'email', 'role', 'createdAt'],
        });

        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
            });
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error('Ошибка получения пользователя:', error);
        res.status(500).json({
            message: 'Внутренняя ошибка сервера',
        });
    }
};

module.exports = {
    register,
    login,
    getCurrentUser,
};
