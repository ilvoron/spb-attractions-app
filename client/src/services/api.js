import axios from 'axios';

// Создаем экземпляр Axios с базовыми настройками
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 10000, // Таймаут запроса 10 секунд
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor для автоматического добавления токена к запросам
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor для обработки ответов и ошибок
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Если получили 401 ошибку (не авторизован), удаляем токен
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Можно также перенаправить на страницу входа
            // window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;
