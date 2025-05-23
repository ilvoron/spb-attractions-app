const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

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
    },
    {
        tableName: 'users',
        timestamps: true,

        // Хуки для обработки данных перед сохранением
        hooks: {
            beforeCreate: async (user) => {
                user.email = user.email.trim();
            },
            beforeUpdate: async (user) => {
                if (user.changed('email')) {
                    user.email = user.email.trim();
                }
            },
        },
    }
);

module.exports = User;
