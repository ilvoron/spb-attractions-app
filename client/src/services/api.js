import axios from 'axios';

// Создаем экземпляр Axios с базовыми настройками
export const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 5000, // Таймаут запроса 6 секунд
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
        }
        return Promise.reject(error);
    }
);
