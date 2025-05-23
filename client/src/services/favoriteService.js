import { api } from './api';

/**
 * Сервис для работы с избранными достопримечательностями
 * Файл: client/src/services/favoriteService.js
 */
export const favoriteService = {
    // Получение всех избранных достопримечательностей пользователя
    async getFavorites() {
        const response = await api.get('/favorites');
        return response.data;
    },

    // Добавление достопримечательности в избранное
    async addToFavorites(attractionId, notes = null) {
        const response = await api.post(`/favorites/${attractionId}`, { notes });
        return response.data;
    },

    // Удаление достопримечательности из избранного
    async removeFromFavorites(attractionId) {
        const response = await api.delete(`/favorites/${attractionId}`);
        return response.data;
    },

    // Проверка статуса избранного для достопримечательности
    async checkFavoriteStatus(attractionId) {
        try {
            const response = await api.get(`/favorites/${attractionId}/check`);
            return response.data;
        } catch (error) {
            // Если пользователь не авторизован или другая ошибка
            if (error.response?.status === 401) {
                return { success: true, isFavorite: false };
            }
            throw error;
        }
    },

    // Обновление заметок для избранной достопримечательности
    async updateNotes(attractionId, notes) {
        const response = await api.patch(`/favorites/${attractionId}/notes`, { notes });
        return response.data;
    },

    // Переключение статуса избранного (добавление/удаление)
    async toggleFavorite(attractionId, isFavorite) {
        if (isFavorite) {
            return this.removeFromFavorites(attractionId);
        } else {
            return this.addToFavorites(attractionId);
        }
    },
};
