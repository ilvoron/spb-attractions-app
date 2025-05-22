const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Модель пользователя для системы аутентификации
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
        },
    },
    {
        // Опции модели
        tableName: 'users',
        timestamps: true, // Автоматически добавляет createdAt и updatedAt

        // Хуки для обработки данных перед сохранением
        hooks: {
            beforeCreate: async (user) => {
                // Пароль будет хеширован в контроллере
                user.email = user.email.toLowerCase().trim();
            },
        },
    }
);

module.exports = User;
