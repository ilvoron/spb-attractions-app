const { Sequelize } = require('sequelize');
require('dotenv').config();

// Создание подключения к PostgreSQL
// Sequelize - это ORM (Object-Relational Mapping) библиотека
// Она позволяет работать с базой данных через JavaScript объекты
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

        // Отключение логирования SQL запросов в production
        logging: process.env.NODE_ENV !== 'production' ? console.log : false,

        // Настройки для работы с временными зонами
        timezone: '+03:00', // Московское время для Санкт-Петербурга
    }
);

// Функция для проверки подключения к базе данных
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Подключение к PostgreSQL установлено успешно');
    } catch (error) {
        console.error('Ошибка подключения к базе данных:', error);
        process.exit(1); // Завершаем процесс если не можем подключиться к БД
    }
};

module.exports = { sequelize, testConnection };
