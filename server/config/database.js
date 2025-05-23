require('dotenv').config();
const { Sequelize } = require('sequelize');

// Создание подключения к PostgreSQL
const sequelize = new Sequelize(
    process.env.DB_NAME || 'spb_attractions',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'password',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',

        // Настройки пула соединений для оптимизации производительности
        pool: {
            max: 5, // Максимальное количество соединений
            min: 0, // Минимальное количество соединений
            acquire: 30000, // Максимальное время ожидания соединения (мс)
            idle: 10000, // Время бездействия до закрытия соединения (мс)
        },

        logging: process.env.NODE_ENV !== 'production' ? console.log : false, // Отключение логирования SQL запросов в production
        timezone: '+03:00', // Московское время
    }
);

module.exports = { sequelize };
