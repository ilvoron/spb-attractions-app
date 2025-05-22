import api from './api';

const authService = {
    // Вход в систему
    async login(email, password) {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    // Регистрация
    async register(email, password) {
        const response = await api.post('/auth/register', { email, password });
        return response.data;
    },

    // Получение информации о текущем пользователе
    async getCurrentUser() {
        const response = await api.get('/auth/me');
        return response.data.user;
    },

    // Выход из системы
    async logout() {
        await api.post('/auth/logout');
    },
};

export default authService;
