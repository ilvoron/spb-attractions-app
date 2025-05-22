import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ScrollToTop from './components/UI/ScrollToTop'; // Наш новый компонент для прокрутки
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import AttractionDetailPage from './pages/AttractionDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // Новая страница восстановления пароля
import ResetPasswordPage from './pages/ResetPasswordPage'; // Страница сброса пароля
import AdminDashboard from './pages/AdminDashboard';
import CreateAttractionPage from './pages/CreateAttractionPage';
import EditAttractionPage from './pages/EditAttractionPage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryPage from './pages/CategoryPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
    return (
        // Провайдеры располагаются в правильном порядке: сначала ToastProvider,
        // затем AuthProvider, который может использовать уведомления
        // Это важно для корректной работы зависимостей между контекстами
        <ToastProvider>
            <AuthProvider>
                <div className="min-h-screen bg-gray-50">
                    {/* Компонент ScrollToTop должен быть внутри Router контекста,
                        чтобы иметь доступ к useLocation хуку */}
                    <ScrollToTop />

                    <Routes>
                        {/* Маршруты с общим макетом (header, footer) */}
                        <Route path="/" element={<Layout />}>
                            {/* Публичные страницы */}
                            <Route index element={<HomePage />} />
                            <Route path="attractions/:id" element={<AttractionDetailPage />} />
                            <Route path="categories" element={<CategoriesPage />} />
                            <Route path="categories/:id" element={<CategoryPage />} />

                            {/* Страницы аутентификации
                                Группируем все связанные с входом страницы вместе
                                для лучшей организации кода */}
                            <Route path="login" element={<LoginPage />} />
                            <Route path="register" element={<RegisterPage />} />
                            <Route path="forgot-password" element={<ForgotPasswordPage />} />
                            <Route path="reset-password" element={<ResetPasswordPage />} />

                            {/* Защищенные страницы (требуют авторизации) */}
                            <Route
                                path="profile"
                                element={
                                    <ProtectedRoute>
                                        <ProfilePage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Страницы только для администраторов
                                ProtectedRoute с флагом adminOnly проверяет не только
                                аутентификацию, но и роль пользователя */}
                            <Route
                                path="admin"
                                element={
                                    <ProtectedRoute adminOnly>
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="admin/attractions/create"
                                element={
                                    <ProtectedRoute adminOnly>
                                        <CreateAttractionPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="admin/attractions/:id/edit"
                                element={
                                    <ProtectedRoute adminOnly>
                                        <EditAttractionPage />
                                    </ProtectedRoute>
                                }
                            />
                        </Route>

                        {/* 404 страница - важно поместить её последней,
                            чтобы она срабатывала только для неопознанных маршрутов */}
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </div>
            </AuthProvider>
        </ToastProvider>
    );
}

export default App;
