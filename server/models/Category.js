const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Модель категорий достопримечательностей
const Category = sequelize.define(
    'Category',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                len: {
                    args: [2, 100],
                    msg: 'Название категории должно содержать от 2 до 100 символов',
                },
            },
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        slug: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            // slug используется для человекочитаемых URL
            validate: {
                is: {
                    args: /^[a-z0-9-]+$/,
                    msg: 'Слаг может содержать только строчные буквы, цифры и дефисы',
                },
            },
        },
        color: {
            type: DataTypes.STRING(7),
            allowNull: true,
            // Hex цвет для визуального обозначения категории
            validate: {
                is: {
                    args: /^#[0-9A-Fa-f]{6}$/,
                    msg: 'Цвет должен быть в формате hex (#RRGGBB)',
                },
            },
        },
    },
    {
        tableName: 'categories',
        timestamps: true,
    }
);

module.exports = Category;
