const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');
const { validationResult } = require('express-validator');

/**
 * Контроллер для восстановления пароля
 * Файл: server/controllers/passwordResetController.js
 *
 * Безопасность превыше всего: восстановление пароля - это потенциально
 * уязвимое место любого приложения. Злоумышленники могут попытаться
 * использовать эту функцию для несанкционированного доступа к аккаунтам.
 *
 * Принципы безопасности, которые мы соблюдаем:
 * 1. Никогда не раскрываем, существует ли email в системе
 * 2. Используем криптографически стойкие токены
 * 3. Ограничиваем время жизни токенов
 * 4. Логируем все попытки для мониторинга
 */

/**
 * Запрос на восстановление пароля
 * Отправляет ссылку для сброса пароля на email пользователя
 */
const requestPasswordReset = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Ошибка валидации',
                errors: errors.array(),
            });
        }

        const { email } = req.body;

        console.log(`Запрос восстановления пароля для email: ${email}`);

        // Ищем пользователя по email
        const user = await User.findOne({ where: { email } });

        // ВАЖНО: Всегда возвращаем успешный ответ, даже если пользователь не найден
        // Это предотвращает перебор существующих email адресов злоумышленниками
        // (так называемая "enumeration attack")

        if (user && user.isActive) {
            // Генерируем криптографически стойкий токен
            // crypto.randomBytes генерирует случайные байты с использованием
            // криптографически стойкого генератора случайных чисел
            const resetToken = crypto.randomBytes(32).toString('hex');

            // Создаем хеш токена для хранения в базе данных
            // Мы не храним сам токен, а только его хеш - так безопаснее
            const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

            // Устанавливаем срок действия токена (1 час)
            const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

            // Сохраняем хеш токена и время истечения в базе данных
            // В реальном приложении это должно быть в отдельной таблице или полях пользователя
            await user.update({
                resetPasswordToken: resetTokenHash,
                resetPasswordExpires: resetTokenExpiry,
            });

            // Здесь должна быть отправка email с ссылкой для сброса пароля
            // Для демонстрации просто логируем ссылку
            const resetUrl = `${
                process.env.CLIENT_URL || 'http://localhost:3000'
            }/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

            console.log('='.repeat(60));
            console.log('ССЫЛКА ДЛЯ ВОССТАНОВЛЕНИЯ ПАРОЛЯ (в реальном приложении отправляется по email):');
            console.log(resetUrl);
            console.log('Срок действия: 1 час');
            console.log('='.repeat(60));

            // В реальном приложении здесь был бы код отправки email:
            /*
            await sendPasswordResetEmail({
                to: user.email,
                resetUrl: resetUrl,
                userName: user.email
            });
            */

            console.log(`Токен восстановления создан для пользователя ${user.id}`);
        } else {
            // Если пользователь не найден или заблокирован, мы все равно
            // возвращаем успешный ответ, но ничего не делаем
            console.log(`Попытка восстановления пароля для несуществующего/заблокированного email: ${email}`);
        }

        // Универсальный ответ независимо от того, найден пользователь или нет
        res.json({
            success: true,
            message:
                'Если указанный email существует в нашей системе, на него будут отправлены инструкции по восстановлению пароля',
        });
    } catch (error) {
        console.error('Ошибка при запросе восстановления пароля:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера',
        });
    }
};

/**
 * Сброс пароля по токену
 * Позволяет пользователю установить новый пароль, используя токен из email
 */
const resetPassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Ошибка валидации',
                errors: errors.array(),
            });
        }

        const { token, email, newPassword } = req.body;

        console.log(`Попытка сброса пароля для email: ${email}`);

        // Создаем хеш полученного токена для сравнения с базой данных
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Ищем пользователя с действующим токеном
        const user = await User.findOne({
            where: {
                email: email,
                resetPasswordToken: tokenHash,
                resetPasswordExpires: {
                    [require('sequelize').Op.gt]: new Date(), // Токен не истек
                },
                isActive: true,
            },
        });

        if (!user) {
            console.log(`Недействительный или истекший токен для email: ${email}`);
            return res.status(400).json({
                success: false,
                message: 'Недействительный или истекший токен восстановления пароля',
            });
        }

        // Хешируем новый пароль
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Обновляем пароль и очищаем токен восстановления
        await user.update({
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        });

        console.log(`Пароль успешно изменен для пользователя ${user.id}`);

        res.json({
            success: true,
            message: 'Пароль успешно изменен. Теперь вы можете войти с новым паролем',
        });
    } catch (error) {
        console.error('Ошибка при сбросе пароля:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера',
        });
    }
};

/**
 * Проверка действительности токена восстановления
 * Позволяет фронтенду проверить, действителен ли токен, до того как пользователь введет новый пароль
 */
const validateResetToken = async (req, res) => {
    try {
        const { token, email } = req.query;

        if (!token || !email) {
            return res.status(400).json({
                success: false,
                message: 'Токен и email обязательны',
            });
        }

        // Создаем хеш токена
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Проверяем существование и действительность токена
        const user = await User.findOne({
            where: {
                email: email,
                resetPasswordToken: tokenHash,
                resetPasswordExpires: {
                    [require('sequelize').Op.gt]: new Date(),
                },
                isActive: true,
            },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Недействительный или истекший токен',
            });
        }

        res.json({
            success: true,
            message: 'Токен действителен',
            expiresAt: user.resetPasswordExpires,
        });
    } catch (error) {
        console.error('Ошибка при проверке токена:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера',
        });
    }
};

module.exports = {
    requestPasswordReset,
    resetPassword,
    validateResetToken,
};
