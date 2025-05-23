import { Link } from 'react-router-dom';

export const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* О проекте */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-lg font-semibold mb-4">О проекте</h3>
                        <p className="text-gray-300 mb-4">
                            Интерактивный гид по достопримечательностям Санкт-Петербурга. Откройте для себя историю и
                            красоту Северной столицы.
                        </p>
                        <p className="text-sm text-gray-400">
                            Курсовая работа по дисциплине "Web-технологии". Лисина Полина М3О-111БВ-24
                        </p>
                    </div>

                    {/* Навигация */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Навигация</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                                    Главная
                                </Link>
                            </li>
                            <li>
                                <Link to="/categories" className="text-gray-300 hover:text-white transition-colors">
                                    Категории
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Технологии */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Технологии</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li>React.js</li>
                            <li>Express.js</li>
                            <li>PostgreSQL</li>
                            <li>Node.js</li>
                            <li>Tailwind CSS</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; {currentYear} СПб Достопримечательности. Создано для изучения веб-технологий.</p>
                </div>
            </div>
        </footer>
    );
};
