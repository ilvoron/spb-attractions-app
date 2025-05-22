import api from './api';

const categoryService = {
    // Получение всех категорий
    async getCategories() {
        const response = await api.get('/categories');
        return response.data.categories;
    },

    // Получение конкретной категории
    async getCategory(id) {
        const response = await api.get(`/categories/${id}`);
        return response.data.category;
    },

    // Получение достопримечательностей категории
    async getCategoryAttractions(id, params = {}) {
        const response = await api.get(`/categories/${id}/attractions`, { params });
        return response.data;
    },
};

export default categoryService;
