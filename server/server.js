const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware для безопасности и логирования
// helmet() добавляет заголовки безопасности к HTTP ответам
app.use(helmet());

// CORS позволяет клиенту на localhost:3000 обращаться к серверу на localhost:5000
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true,
    })
);

// morgan логирует все HTTP запросы для отладки
app.use(morgan('combined'));

// Middleware для парсинга JSON и URL-encoded данных
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Статические файлы для изображений
app.use('/uploads', express.static('uploads'));

// Импорт маршрутов
const authRoutes = require('./routes/auth');
const attractionRoutes = require('./routes/attractions');
const categoryRoutes = require('./routes/categories');
const metroStationRoutes = require('./routes/metroStations');

// Использование маршрутов с префиксом /api
app.use('/api/auth', authRoutes);
app.use('/api/attractions', attractionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/metro-stations', metroStationRoutes);

// Базовый маршрут для проверки работы сервера
app.get('/api/health', (req, res) => {
    res.json({
        message: 'Сервер достопримечательностей Санкт-Петербурга работает',
        timestamp: new Date().toISOString(),
    });
});

// Middleware для обработки 404 ошибок
app.use((req, res, next) => {
    res.status(404).json({ message: 'Маршрут не найден' });
});

// Глобальный обработчик ошибок
app.use((error, req, res, next) => {
    console.error('Ошибка сервера:', error);

    res.status(error.status || 500).json({
        message: error.message || 'Внутренняя ошибка сервера',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
