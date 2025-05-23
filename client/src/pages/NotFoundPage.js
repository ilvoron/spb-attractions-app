import { Link } from 'react-router-dom';
import { MapPinIcon } from '@heroicons/react/24/outline';

export const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <MapPinIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                    <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Страница не найдена</h2>
                    <p className="text-gray-600 mb-8">
                        Похоже, что запрашиваемая страница не существует или была перемещена. Возможно, вы перешли по
                        устаревшей ссылке.
                    </p>
                </div>

                <div className="space-y-4">
                    <Link to="/" className="block w-full btn-primary">
                        Вернуться на главную
                    </Link>
                    <Link to="/categories" className="block w-full btn-secondary">
                        Посмотреть категории
                    </Link>
                </div>
            </div>
        </div>
    );
};
