const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Модель станций метро для удобства навигации
const MetroStation = sequelize.define(
    'MetroStation',
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
        },
        lineColor: {
            type: DataTypes.STRING(7),
            allowNull: true,
            validate: {
                is: {
                    args: /^#[0-9A-Fa-f]{6}$/,
                    msg: 'Цвет должен быть в формате hex (#RRGGBB)',
                },
            },
        },
        lineName: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
    },
    {
        tableName: 'metro_stations',
        timestamps: true,
    }
);

module.exports = MetroStation;
