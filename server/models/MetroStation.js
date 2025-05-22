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
            type: DataTypes.STRING(20),
            allowNull: false,
            // Цвет линии метро (красная, синяя, зеленая, оранжевая, фиолетовая)
            validate: {
                isIn: {
                    args: [['red', 'blue', 'green', 'orange', 'purple']],
                    msg: 'Недопустимый цвет линии метро',
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
        timestamps: false, // Справочная информация, не требует временных меток
    }
);

module.exports = MetroStation;
