import { api } from './api';

export const attractionService = {
    // Получение списка достопримечательностей с фильтрами
    async getAttractions(params = {}) {
        const response = await api.get('/attractions', { params });
        return response.data;
    },

    // Получение конкретной достопримечательности
    async getAttraction(id) {
        const response = await api.get(`/attractions/${id}`);
        return response.data.attraction;
    },

    // Создание новой достопримечательности
    async createAttraction(data) {
        const response = await api.post('/attractions', data);
        return response.data;
    },

    // Обновление достопримечательности
    async updateAttraction(id, data) {
        const response = await api.put(`/attractions/${id}`, data);
        return response.data;
    },

    // Удаление достопримечательности
    async deleteAttraction(id) {
        const response = await api.delete(`/attractions/${id}`);
        return response.data;
    },

    // Загрузка изображений
    async uploadImages(attractionId, files) {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('images', file);
        });

        const response = await api.post(`/attractions/${attractionId}/images`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Получение предложений для автодополнения
    async getSearchSuggestions(query) {
        const response = await api.get('/attractions/search/suggestions', {
            params: { query },
        });
        return response.data.suggestions;
    },
};
