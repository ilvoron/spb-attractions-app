const { body, param, query, validationResult } = require('express-validator');

// Функция для обработки результатов валидации
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Ошибки валидации:', errors.array());
        return res.status(400).json({
            message: 'Ошибка валидации данных',
            errors: errors.array().map((error) => ({
                field: error.path,
                message: error.msg,
                value: error.value,
            })),
        });
    }
    next();
};

// Валидация для регистрации пользователя
const validateUserRegistration = [
    body('email')
        .isEmail()
        .withMessage('Некорректный формат email адреса')
        .normalizeEmail()
        .isLength({ min: 5, max: 255 })
        .withMessage('Email должен содержать от 5 до 255 символов'),

    body('password')
        .isLength({ min: 6, max: 128 })
        .withMessage('Пароль должен содержать от 6 до 128 символов')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Пароль должен содержать минимум одну строчную букву, одну заглавную букву и одну цифру'),

    body('role').optional().isIn(['user', 'admin']).withMessage('Роль может быть только user или admin'),

    handleValidationErrors,
];

// Валидация для входа в систему
const validateUserLogin = [
    body('email').isEmail().withMessage('Некорректный формат email адреса').normalizeEmail(),

    body('password').notEmpty().withMessage('Пароль обязателен для заполнения'),

    handleValidationErrors,
];

// Валидация для создания достопримечательности
const validateAttractionCreation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Название должно содержать от 2 до 200 символов')
        .matches(/^[а-яё\s\d\-".,!()А-ЯЁa-zA-Z]+$/i)
        .withMessage('Название содержит недопустимые символы'),

    body('shortDescription')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Краткое описание должно содержать от 10 до 500 символов'),

    body('fullDescription')
        .trim()
        .isLength({ min: 50, max: 5000 })
        .withMessage('Полное описание должно содержать от 50 до 5000 символов'),

    body('address').trim().isLength({ min: 5, max: 300 }).withMessage('Адрес должен содержать от 5 до 300 символов'),

    body('district')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Название района не должно превышать 100 символов'),

    body('latitude')
        .optional()
        .isFloat({ min: 59.8, max: 60.1 })
        .withMessage('Широта должна быть в пределах Санкт-Петербурга (59.8-60.1)'),

    body('longitude')
        .optional()
        .isFloat({ min: 29.5, max: 30.8 })
        .withMessage('Долгота должна быть в пределах Санкт-Петербурга (29.5-30.8)'),

    body('categoryId').isInt({ min: 1 }).withMessage('ID категории должен быть положительным числом'),

    body('metroStationId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID станции метро должен быть положительным числом'),

    body('workingHours')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Время работы не должно превышать 200 символов'),

    body('ticketPrice')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Стоимость билета не должна превышать 100 символов'),

    body('website')
        .optional()
        .isURL({ protocols: ['http', 'https'] })
        .withMessage('Некорректный формат URL веб-сайта'),

    body('phone')
        .optional()
        .matches(/^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/)
        .withMessage('Некорректный формат номера телефона'),

    body('distanceToMetro')
        .optional()
        .isInt({ min: 1, max: 60 })
        .withMessage('Расстояние до метро должно быть от 1 до 60 минут'),

    body('wheelchairAccessible')
        .optional()
        .isBoolean()
        .withMessage('Поле доступности для колясок должно быть логическим значением'),

    body('hasElevator').optional().isBoolean().withMessage('Поле наличия лифта должно быть логическим значением'),

    body('hasAudioGuide').optional().isBoolean().withMessage('Поле наличия аудиогида должно быть логическим значением'),

    body('hasSignLanguageSupport')
        .optional()
        .isBoolean()
        .withMessage('Поле поддержки жестового языка должно быть логическим значением'),

    body('accessibilityNotes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Заметки о доступности не должны превышать 1000 символов'),

    handleValidationErrors,
];

// Валидация для обновления достопримечательности (все поля опциональны)
const validateAttractionUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Название должно содержать от 2 до 200 символов'),

    body('shortDescription')
        .optional()
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Краткое описание должно содержать от 10 до 500 символов'),

    // ... остальные поля аналогично, но все optional

    handleValidationErrors,
];

/**
 * ИСПРАВЛЕННАЯ валидация параметров запроса для поиска
 *
 * Ключевое исправление: все query параметры делаем optional() и добавляем
 * проверку на пустые строки с помощью custom валидатора
 */
const validateSearchQuery = [
    // Параметры пагинации
    query('page')
        .optional()
        .custom((value) => {
            // Разрешаем пустые строки (они будут преобразованы в значения по умолчанию)
            if (value === '' || value === undefined) return true;

            const num = parseInt(value);
            if (isNaN(num) || num < 1) {
                throw new Error('Номер страницы должен быть положительным числом');
            }
            return true;
        }),

    query('limit')
        .optional()
        .custom((value) => {
            if (value === '' || value === undefined) return true;

            const num = parseInt(value);
            if (isNaN(num) || num < 1 || num > 50) {
                throw new Error('Лимит должен быть от 1 до 50');
            }
            return true;
        }),

    // Параметры поиска и фильтрации
    query('search')
        .optional()
        .custom((value) => {
            // Пустые строки разрешены
            if (value === '' || value === undefined) return true;

            if (typeof value !== 'string') {
                throw new Error('Поисковый запрос должен быть строкой');
            }

            if (value.length > 100) {
                throw new Error('Поисковый запрос не должен превышать 100 символов');
            }

            return true;
        }),

    query('category')
        .optional()
        .custom((value) => {
            if (value === '' || value === undefined) return true;

            const num = parseInt(value);
            if (isNaN(num) || num < 0) {
                throw new Error('ID категории должен быть неотрицательным числом');
            }
            return true;
        }),

    query('metro')
        .optional()
        .custom((value) => {
            if (value === '' || value === undefined) return true;

            const num = parseInt(value);
            if (isNaN(num) || num < 1) {
                throw new Error('ID станции метро должен быть положительным числом');
            }
            return true;
        }),

    query('accessibility')
        .optional()
        .custom((value) => {
            if (value === '' || value === undefined) return true;

            const validValues = ['wheelchair', 'audio', 'elevator', 'sign_language'];
            if (!validValues.includes(value)) {
                throw new Error(`Тип доступности должен быть одним из: ${validValues.join(', ')}`);
            }
            return true;
        }),

    query('sort')
        .optional()
        .custom((value) => {
            if (value === '' || value === undefined) return true;

            const validValues = ['name', 'newest', 'oldest', 'category'];
            if (!validValues.includes(value)) {
                throw new Error(`Тип сортировки должен быть одним из: ${validValues.join(', ')}`);
            }
            return true;
        }),

    handleValidationErrors,
];

// Валидация ID в параметрах маршрута
const validateId = [
    param('id').isInt({ min: 1 }).withMessage('ID должен быть положительным числом'),

    handleValidationErrors,
];

module.exports = {
    validateUserRegistration,
    validateUserLogin,
    validateAttractionCreation,
    validateAttractionUpdate,
    validateSearchQuery,
    validateId,
    handleValidationErrors,
};
