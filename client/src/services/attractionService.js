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
    async uploadImages(attractionId, formData) {
        console.log('Отправка запроса на загрузку изображений для достопримечательности:', attractionId);
        console.log('Количество файлов в FormData:', formData.getAll('images').length);

        // Проверяем, что formData содержит изображения
        if (formData.getAll('images').length === 0) {
            console.error('Ошибка: формдата не содержит изображений');
            throw new Error('Формдата не содержит изображений');
        }

        try {
            const response = await api.post(`/attractions/${attractionId}/images`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Успешный ответ от сервера:', response.data);
            return response.data;
        } catch (error) {
            console.error('Ошибка при загрузке изображений:', error);
            throw error;
        }
    },

    // Удаление изображения
    async deleteImage(attractionId, imageId) {
        try {
            const response = await api.delete(`/attractions/${attractionId}/images/${imageId}`);
            return response.data;
        } catch (error) {
            console.error('Ошибка при удалении изображения:', error);
            throw error;
        }
    },

    // Установка главного изображения
    async setPrimaryImage(attractionId, imageId) {
        try {
            const response = await api.put(`/attractions/${attractionId}/images/${imageId}/primary`);
            return response.data;
        } catch (error) {
            console.error('Ошибка при установке главного изображения:', error);
            throw error;
        }
    },
};
