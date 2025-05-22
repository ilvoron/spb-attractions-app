import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

// Создаем клиент для React Query - это центральный менеджер кэширования данных
// Он умеет автоматически кэшировать запросы к серверу, повторять неуспешные запросы
// и синхронизировать данные между разными компонентами
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Данные считаются "свежими" в течение 5 минут
            staleTime: 1000 * 60 * 5,
            // Кэшируем данные на 10 минут
            cacheTime: 1000 * 60 * 10,
            // Повторяем неуспешные запросы максимум 3 раза
            retry: 3,
            // Автоматически обновляем данные при возвращении в окно браузера
            refetchOnWindowFocus: false,
        },
    },
});

// Получаем корневой элемент DOM, куда будет монтироваться наше приложение
const container = document.getElementById('root');
const root = createRoot(container);

// Рендерим приложение, обернутое в провайдеры для маршрутизации и управления данными
// BrowserRouter обеспечивает навигацию между страницами без перезагрузки
// QueryClientProvider дает всем компонентам доступ к кэшу данных
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
        </BrowserRouter>
    </React.StrictMode>
);
