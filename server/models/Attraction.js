const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Основная модель достопримечательностей
const Attraction = sequelize.define(
    'Attraction',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(200),
            allowNull: false,
            validate: {
                len: {
                    args: [2, 200],
                    msg: 'Название должно содержать от 2 до 200 символов',
                },
            },
        },
        slug: {
            type: DataTypes.STRING(200),
            allowNull: false,
            unique: true,
        },
        shortDescription: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                len: {
                    args: [10, 500],
                    msg: 'Краткое описание должно содержать от 10 до 500 символов',
                },
            },
        },
        fullDescription: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                len: {
                    args: [50, 5000],
                    msg: 'Полное описание должно содержать от 50 до 5000 символов',
                },
            },
        },
        address: {
            type: DataTypes.STRING(300),
            allowNull: false,
        },
        district: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        latitude: {
            type: DataTypes.DECIMAL(10, 7),
            allowNull: true,
            validate: {
                min: -90,
                max: 90,
            },
        },
        longitude: {
            type: DataTypes.DECIMAL(10, 7),
            allowNull: true,
            validate: {
                min: -180,
                max: 180,
            },
        },
        workingHours: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        ticketPrice: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        website: {
            type: DataTypes.STRING(500),
            allowNull: true,
            validate: {
                isUrl: {
                    msg: 'Некорректный формат URL',
                },
            },
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        distanceToMetro: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Время в минутах пешком до станции метро',
        },

        // Поля доступности
        wheelchairAccessible: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        hasElevator: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        hasAudioGuide: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        hasSignLanguageSupport: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        accessibilityNotes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        // Статус публикации
        isPublished: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },

        // Внешние ключи будут добавлены через ассоциации
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'categories',
                key: 'id',
            },
        },
        metroStationId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'metro_stations',
                key: 'id',
            },
        },
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
    },
    {
        tableName: 'attractions',
        timestamps: true,

        // Индексы для оптимизации поиска
        indexes: [
            {
                fields: ['name'],
            },
            {
                fields: ['categoryId'],
            },
            {
                fields: ['metroStationId'],
            },
            {
                fields: ['district'],
            },
            {
                fields: ['isPublished'],
            },
        ],
    }
);

module.exports = Attraction;
