const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Модель для хранения изображений достопримечательностей
const Image = sequelize.define(
    'Image',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        filename: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Имя файла с расширением',
        },
        originalName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Оригинальное имя загруженного файла',
        },
        path: {
            type: DataTypes.STRING(500),
            allowNull: false,
            comment: 'Полный путь к файлу на сервере',
        },
        size: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Размер файла в байтах',
        },
        mimeType: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                isIn: {
                    args: [['image/jpeg', 'image/png', 'image/webp']],
                    msg: 'Поддерживаются только JPEG, PNG и WebP изображения',
                },
            },
        },
        altText: {
            type: DataTypes.STRING(200),
            allowNull: true,
            comment: 'Альтернативный текст для доступности',
        },
        isPrimary: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Основное изображение для отображения в списке',
        },
        // Внешние ключи
        attractionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'attractions',
                key: 'id',
            },
        },
    },
    {
        tableName: 'images',
        timestamps: true,
    }
);

module.exports = Image;
