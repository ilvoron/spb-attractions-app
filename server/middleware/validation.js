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

    body('categoryId').isInt({ min: 1 }).withMessage('ID категории должен быть положительным числом'),

    body('metroStationId')
        .optional({ checkFalsy: true })
        .isInt({ min: 1 })
        .withMessage('ID станции метро должен быть положительным числом'),

    body('workingHours')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 200 })
        .withMessage('Время работы не должно превышать 200 символов'),

    body('ticketPrice')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage('Стоимость билета не должна превышать 100 символов'),

    body('website')
        .optional({ checkFalsy: true })
        .isURL({ protocols: ['http', 'https'] })
        .withMessage('Некорректный формат URL веб-сайта'),

    body('phone')
        .optional({ checkFalsy: true })
        .matches(/^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/)
        .withMessage('Некорректный формат номера телефона'),

    body('distanceToMetro')
        .optional({ checkFalsy: true })
        .isInt({ min: 1, max: 60 })
        .withMessage('Расстояние до метро должно быть от 1 до 60 минут'),

    body('wheelchairAccessible')
        .optional({ checkFalsy: true })
        .isBoolean()
        .withMessage('Поле доступности для колясок должно быть логическим значением'),

    body('hasElevator')
        .optional({ checkFalsy: true })
        .isBoolean()
        .withMessage('Поле наличия лифта должно быть логическим значением'),

    body('hasAudioGuide')
        .optional({ checkFalsy: true })
        .isBoolean()
        .withMessage('Поле наличия аудиогида должно быть логическим значением'),

    body('hasSignLanguageSupport')
        .optional({ checkFalsy: true })
        .isBoolean()
        .withMessage('Поле поддержки жестового языка должно быть логическим значением'),

    body('accessibilityNotes')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Заметки о доступности не должны превышать 1000 символов'),

    handleValidationErrors,
];

// Валидация для обновления достопримечательности (все поля опциональны)
const validateAttractionUpdate = [
    body('name')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Название должно содержать от 2 до 200 символов')
        .matches(/^[а-яё\s\d\-".,!()А-ЯЁa-zA-Z]+$/i)
        .withMessage('Название содержит недопустимые символы'),

    body('shortDescription')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Краткое описание должно содержать от 10 до 500 символов'),

    body('fullDescription')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 50, max: 5000 })
        .withMessage('Полное описание должно содержать от 50 до 5000 символов'),

    body('address')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 5, max: 300 })
        .withMessage('Адрес должен содержать от 5 до 300 символов'),

    body('categoryId')
        .optional({ checkFalsy: true })
        .isInt({ min: 1 })
        .withMessage('ID категории должен быть положительным числом'),

    body('metroStationId')
        .optional({ checkFalsy: true })
        .isInt({ min: 1 })
        .withMessage('ID станции метро должен быть положительным числом'),

    body('workingHours')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 200 })
        .withMessage('Время работы не должно превышать 200 символов'),

    body('ticketPrice')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage('Стоимость билета не должна превышать 100 символов'),

    body('website')
        .optional({ checkFalsy: true })
        .isURL({ protocols: ['http', 'https'] })
        .withMessage('Некорректный формат URL веб-сайта'),

    body('phone')
        .optional({ checkFalsy: true })
        .matches(/^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/)
        .withMessage('Некорректный формат номера телефона'),

    body('distanceToMetro')
        .optional({ checkFalsy: true })
        .isInt({ min: 1, max: 60 })
        .withMessage('Расстояние до метро должно быть от 1 до 60 минут'),

    body('wheelchairAccessible')
        .optional({ checkFalsy: true })
        .isBoolean()
        .withMessage('Поле доступности для колясок должно быть логическим значением'),

    body('hasElevator')
        .optional({ checkFalsy: true })
        .isBoolean()
        .withMessage('Поле наличия лифта должно быть логическим значением'),

    body('hasAudioGuide')
        .optional({ checkFalsy: true })
        .isBoolean()
        .withMessage('Поле наличия аудиогида должно быть логическим значением'),

    body('hasSignLanguageSupport')
        .optional({ checkFalsy: true })
        .isBoolean()
        .withMessage('Поле поддержки жестового языка должно быть логическим значением'),

    body('accessibilityNotes')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Заметки о доступности не должны превышать 1000 символов'),

    handleValidationErrors,
];

// Валидация параметров запроса для поиска
const validateSearchQuery = [
    // Параметры пагинации
    query('page')
        .optional({ checkFalsy: true })
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
        .optional({ checkFalsy: true })
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
        .optional({ checkFalsy: true })
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
        .optional({ checkFalsy: true })
        .custom((value) => {
            if (value === '' || value === undefined) return true;

            const num = parseInt(value);
            if (isNaN(num) || num < 0) {
                throw new Error('ID категории должен быть неотрицательным числом');
            }
            return true;
        }),

    query('metro')
        .optional({ checkFalsy: true })
        .custom((value) => {
            if (value === '' || value === undefined) return true;

            const num = parseInt(value);
            if (isNaN(num) || num < 0) {
                throw new Error('ID станции метро должен быть неотрицательным числом');
            }
            return true;
        }),

    query('accessibility')
        .optional({ checkFalsy: true })
        .custom((value) => {
            if (value === '' || value === undefined) return true;

            // Если это строка, проверяем её
            if (typeof value === 'string') {
                value = value.split(','); // Преобразуем в массив для унификации обработки
            }

            // Если это массив, проверяем каждый элемент
            if (Array.isArray(value)) {
                const validValues = ['wheelchair', 'audio', 'elevator', 'sign_language'];
                for (const item of value) {
                    if (!validValues.includes(item)) {
                        throw new Error(
                            `Недопустимый тип доступности: ${item}. Допустимые значения: ${validValues.join(', ')}`
                        );
                    }
                }
                return true;
            }

            throw new Error('Параметр accessibility должен быть строкой или массивом строк');
        }),

    query('sort')
        .optional({ checkFalsy: true })
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

// Валидация для категорий
const validateCategory = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Название категории должно содержать от 2 до 100 символов'),

    body('description')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 500 })
        .withMessage('Описание не должно превышать 500 символов'),

    body('color')
        .optional({ checkFalsy: true })
        .matches(/^#[0-9A-Fa-f]{6}$/)
        .withMessage('Цвет должен быть в формате hex (#RRGGBB)'),
];

module.exports = {
    validateUserRegistration,
    validateUserLogin,
    validateAttractionCreation,
    validateAttractionUpdate,
    validateSearchQuery,
    validateId,
    validateCategory,
    handleValidationErrors,
};
