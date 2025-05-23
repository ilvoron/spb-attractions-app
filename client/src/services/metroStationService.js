import { api } from './api';

export const metroStationService = {
    // Получение всех станций метро
    async getMetroStations() {
        const response = await api.get('/metro-stations');
        return response.data.metroStations;
    },

    // Получение конкретной станции метро
    async getMetroStation(id) {
        const response = await api.get(`/metro-stations/${id}`);
        return response.data.metroStation;
    },
};
