const { MetroStation } = require('../models');

// Получение всех станций метро
const getMetroStations = async (req, res) => {
    try {
        const metroStations = await MetroStation.findAll({
            attributes: ['id', 'name', 'lineColor', 'lineName'],
            order: [['name', 'ASC']], // Сортируем по алфавиту для удобства
        });

        res.json({
            message: 'Станции метро успешно получены',
            metroStations,
        });
    } catch (error) {
        console.error('Ошибка получения станций метро:', error);
        res.status(500).json({
            message: 'Внутренняя ошибка сервера при получении станций метро',
        });
    }
};

// Получение конкретной станции метро по ID
const getMetroStationById = async (req, res) => {
    try {
        const { id } = req.params;

        const metroStation = await MetroStation.findByPk(id, {
            attributes: ['id', 'name', 'lineColor', 'lineName'],
        });

        if (!metroStation) {
            return res.status(404).json({
                message: 'Станция метро не найдена',
            });
        }

        res.json({
            message: 'Станция метро успешно получена',
            metroStation,
        });
    } catch (error) {
        console.error('Ошибка получения станции метро:', error);
        res.status(500).json({
            message: 'Внутренняя ошибка сервера при получении станции метро',
        });
    }
};

module.exports = {
    getMetroStations,
    getMetroStationById,
};
