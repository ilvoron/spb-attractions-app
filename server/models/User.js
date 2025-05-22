const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Обновленная модель пользователя для системы аутентификации
 * Файл: server/models/User.js
 *
 * Добавлены поля для функциональности восстановления пароля:
 * - resetPasswordToken: хеш токена для сброса пароля
 * - resetPasswordExpires: время истечения токена
 *
 * Принципы безопасности:
 * 1. Мы храним не сам токен, а его хеш - это защищает от компрометации БД
 * 2. Токены имеют ограниченное время жизни
 * 3. После использования токен автоматически удаляется
 */
const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: {
                    msg: 'Некорректный формат email адреса',
                },
            },
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                len: {
                    args: [6, 255],
                    msg: 'Пароль должен содержать минимум 6 символов',
                },
            },
        },
        role: {
            type: DataTypes.ENUM('user', 'admin'),
            defaultValue: 'user',
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: 'Активен ли аккаунт пользователя',
        },

        // Новые поля для восстановления пароля
        resetPasswordToken: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'Хеш токена для восстановления пароля (SHA-256)',
        },
        resetPasswordExpires: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Время истечения токена восстановления пароля',
        },

        // Дополнительные поля для улучшения безопасности
        lastLoginAt: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Время последнего входа в систему',
        },
        loginAttempts: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Количество неудачных попыток входа',
        },
        lockedUntil: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Время блокировки аккаунта после множественных неудачных попыток входа',
        },
    },
    {
        // Опции модели
        tableName: 'users',
        timestamps: true, // Автоматически добавляет createdAt и updatedAt

        // Индексы для оптимизации запросов
        /*         indexes: [
            {
                fields: ['email'],
                unique: true,
            },
            {
                fields: ['resetPasswordToken'],
                sparse: true, // Индекс только для записей, где поле не null
            },
            {
                fields: ['resetPasswordExpires'],
                sparse: true,
            },
        ], */

        // Хуки для обработки данных перед сохранением
        hooks: {
            beforeCreate: async (user) => {
                user.email = user.email.toLowerCase().trim();
            },
            beforeUpdate: async (user) => {
                if (user.changed('email')) {
                    user.email = user.email.toLowerCase().trim();
                }
            },
        },

        // Методы экземпляра для работы с восстановлением пароля
        instanceMethods: {
            // Проверяем, не заблокирован ли аккаунт из-за множественных неудачных попыток входа
            isLocked: function () {
                return !!(this.lockedUntil && this.lockedUntil > Date.now());
            },

            // Увеличиваем счетчик неудачных попыток входа
            incLoginAttempts: function () {
                // Если аккаунт уже заблокирован и время блокировки прошло, сбрасываем счетчик
                if (this.lockedUntil && this.lockedUntil < Date.now()) {
                    return this.update({
                        loginAttempts: 1,
                        lockedUntil: null,
                    });
                }

                const updates = { loginAttempts: this.loginAttempts + 1 };

                // Блокируем аккаунт после 5 неудачных попыток на 2 часа
                if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
                    updates.lockedUntil = Date.now() + 2 * 60 * 60 * 1000; // 2 часа
                }

                return this.update(updates);
            },

            // Сбрасываем счетчик неудачных попыток после успешного входа
            resetLoginAttempts: function () {
                return this.update({
                    loginAttempts: 0,
                    lockedUntil: null,
                    lastLoginAt: new Date(),
                });
            },
        },
    }
);

module.exports = User;
