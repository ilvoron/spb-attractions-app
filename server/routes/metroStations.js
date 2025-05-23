const express = require('express');
const router = express.Router();
const metroStationController = require('../controllers/metroStationController');
const { validateId } = require('../middleware/validation');

// GET /api/metro-stations - Получение всех станций метро
router.get('/', metroStationController.getMetroStations);

// GET /api/metro-stations/:id - Получение конкретной станции метро
router.get('/:id', validateId, metroStationController.getMetroStationById);

module.exports = router;
