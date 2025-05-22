import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import AttractionDetailPage from './pages/AttractionDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
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
        // AuthProvider предоставляет информацию о текущем пользователе всем компонентам
        // ToastProvider управляет показом уведомлений (успех, ошибка, предупреждение)
        <ToastProvider>
            <AuthProvider>
                <div className="min-h-screen bg-gray-50">
                    <Routes>
                        {/* Маршруты с общим макетом (header, footer) */}
                        <Route path="/" element={<Layout />}>
                            {/* Публичные страницы */}
                            <Route index element={<HomePage />} />
                            <Route path="attractions/:id" element={<AttractionDetailPage />} />
                            <Route path="categories" element={<CategoriesPage />} />
                            <Route path="categories/:id" element={<CategoryPage />} />
                            <Route path="login" element={<LoginPage />} />
                            <Route path="register" element={<RegisterPage />} />

                            {/* Защищенные страницы (требуют авторизации) */}
                            <Route
                                path="profile"
                                element={
                                    <ProtectedRoute>
                                        <ProfilePage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Страницы только для администраторов */}
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

                        {/* 404 страница */}
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </div>
            </AuthProvider>
        </ToastProvider>
    );
}

export default App;
