const nodemailer = require('nodemailer');

/**
 * Сервис для отправки email писем
 * Файл: server/services/emailService.js
 *
 * Этот сервис использует Nodemailer для отправки писем через различные провайдеры:
 * - Gmail (рекомендуется для разработки)
 * - Яндекс.Почта
 * - Mail.ru
 * - Собственный SMTP сервер
 */

// Создаем транспортер для отправки писем
const createTransport = () => {
    // Для продакшена рекомендуется использовать специализированные сервисы
    // как SendGrid, Mailgun, AWS SES и т.д.

    // Вариант 1: Gmail (требует настройки App Password)
    if (process.env.EMAIL_SERVICE === 'gmail') {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // ваш Gmail
                pass: process.env.EMAIL_PASSWORD, // App Password (не основной пароль!)
            },
        });
    }

    // Вариант 2: Яндекс.Почта
    if (process.env.EMAIL_SERVICE === 'yandex') {
        return nodemailer.createTransport({
            host: 'smtp.yandex.ru',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    // Вариант 3: Mail.ru
    if (process.env.EMAIL_SERVICE === 'mailru') {
        return nodemailer.createTransport({
            host: 'smtp.mail.ru',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    // Вариант 4: Кастомный SMTP
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'localhost',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
};

// Проверяем конфигурацию email при запуске
const verifyEmailConfig = async () => {
    try {
        const transporter = createTransport();
        await transporter.verify();
        console.log('✅ Email сервис настроен и готов к работе');
        return true;
    } catch (error) {
        console.error('❌ Ошибка настройки email сервиса:', error.message);
        console.log('💡 Убедитесь, что настроены переменные окружения для email');
        return false;
    }
};

// Функция для отправки письма восстановления пароля
const sendPasswordResetEmail = async ({ to, resetUrl, userName }) => {
    try {
        const transporter = createTransport();

        // HTML шаблон письма
        const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Восстановление пароля</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f8fafc;
                }
                .container {
                    background-color: white;
                    padding: 40px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #3B82F6, #8B5CF6);
                    border-radius: 50%;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                    font-size: 24px;
                    color: white;
                }
                .title {
                    color: #1f2937;
                    font-size: 24px;
                    font-weight: 600;
                    margin-bottom: 10px;
                }
                .subtitle {
                    color: #6b7280;
                    font-size: 16px;
                }
                .content {
                    margin: 30px 0;
                }
                .button {
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #3B82F6;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 500;
                    text-align: center;
                    margin: 20px 0;
                }
                .button:hover {
                    background-color: #2563eb;
                }
                .warning {
                    background-color: #fef3c7;
                    border: 1px solid #f59e0b;
                    border-radius: 6px;
                    padding: 15px;
                    margin: 20px 0;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    font-size: 14px;
                    color: #6b7280;
                    text-align: center;
                }
                .link {
                    color: #3B82F6;
                    word-break: break-all;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🏛️</div>
                    <h1 class="title">Восстановление пароля</h1>
                    <p class="subtitle">СПб Достопримечательности</p>
                </div>
                
                <div class="content">
                    <p>Здравствуйте!</p>
                    
                    <p>Вы получили это письмо, потому что была запрошена процедура восстановления пароля для вашего аккаунта в системе "СПб Достопримечательности".</p>
                    
                    <p>Для создания нового пароля перейдите по ссылке ниже:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" class="button">Восстановить пароль</a>
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Важная информация:</strong>
                        <ul>
                            <li>Ссылка действительна в течение <strong>1 часа</strong></li>
                            <li>Ссылка одноразовая - после использования станет недействительной</li>
                            <li>Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо</li>
                        </ul>
                    </div>
                    
                    <p>Если кнопка не работает, скопируйте и вставьте следующую ссылку в адресную строку браузера:</p>
                    <p class="link">${resetUrl}</p>
                </div>
                
                <div class="footer">
                    <p>Это автоматическое письмо. Пожалуйста, не отвечайте на него.</p>
                    <p>© 2024 СПб Достопримечательности. Учебный проект.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Текстовая версия письма (для клиентов, не поддерживающих HTML)
        const textVersion = `
Восстановление пароля - СПб Достопримечательности

Здравствуйте!

Вы получили это письмо, потому что была запрошена процедура восстановления пароля для вашего аккаунта.

Для создания нового пароля перейдите по следующей ссылке:
${resetUrl}

ВАЖНО:
- Ссылка действительна в течение 1 часа
- Ссылка одноразовая - после использования станет недействительной
- Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо

Это автоматическое письмо. Пожалуйста, не отвечайте на него.

© 2024 СПб Достопримечательности. Учебный проект.
        `;

        const mailOptions = {
            from: {
                name: 'СПб Достопримечательности',
                address: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            },
            to: to,
            subject: '🔐 Восстановление пароля - СПб Достопримечательности',
            text: textVersion,
            html: htmlTemplate,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('✅ Письмо восстановления пароля отправлено:', {
            to: to,
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected,
        });

        return {
            success: true,
            messageId: info.messageId,
            message: 'Письмо успешно отправлено',
        };
    } catch (error) {
        console.error('❌ Ошибка отправки письма восстановления пароля:', error);

        // Возвращаем структурированную ошибку
        return {
            success: false,
            error: error.message,
            message: 'Не удалось отправить письмо',
        };
    }
};

// Функция для отправки приветственного письма
const sendWelcomeEmail = async ({ to, userName }) => {
    try {
        const transporter = createTransport();

        const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Добро пожаловать!</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f8fafc;
                }
                .container {
                    background-color: white;
                    padding: 40px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #3B82F6, #8B5CF6);
                    border-radius: 50%;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                    font-size: 24px;
                    color: white;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🏛️</div>
                    <h1>Добро пожаловать!</h1>
                </div>
                
                <p>Здравствуйте!</p>
                
                <p>Добро пожаловать в "СПб Достопримечательности"!</p>
                
                <p>Теперь вы можете:</p>
                <ul>
                    <li>Изучать достопримечательности Санкт-Петербурга</li>
                    <li>Добавлять места в избранное</li>
                    <li>Получать персональные рекомендации</li>
                </ul>
                
                <p>Удачного изучения Северной столицы!</p>
            </div>
        </body>
        </html>
        `;

        const mailOptions = {
            from: {
                name: 'СПб Достопримечательности',
                address: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            },
            to: to,
            subject: '🎉 Добро пожаловать в СПб Достопримечательности!',
            html: htmlTemplate,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Приветственное письмо отправлено:', info.messageId);

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Ошибка отправки приветственного письма:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendPasswordResetEmail,
    sendWelcomeEmail,
    verifyEmailConfig,
};
