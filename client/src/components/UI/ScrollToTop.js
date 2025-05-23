import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
    // useLocation возвращает объект с информацией о текущем маршруте
    const { pathname } = useLocation();

    useEffect(() => {
        // Этот код выполняется каждый раз при изменении pathname
        setTimeout(() => {
            window.scrollTo({
                top: 0, // Прокручиваем в самый верх страницы
                left: 0, // И к левому краю (важно для горизонтальной прокрутки)
                behavior: 'smooth', // Плавная анимация вместо резкого скачка
            });
        }, 0);
        // Массив зависимостей [pathname] означает, что эффект будет
        // перезапускаться только при изменении pathname, а не при каждом рендере
    }, [pathname]);

    // Возвращаем null, поскольку этот компонент не должен ничего рендерить
    // Он существует только для выполнения побочного эффекта (прокрутки)
    return null;
};
