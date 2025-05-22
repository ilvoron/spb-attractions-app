const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Создаем директорию для загрузок, если она не существует
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Конфигурация хранилища для multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Создаем поддиректорию по дате для лучшей организации файлов
        const dateDir = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const fullPath = path.join(uploadsDir, dateDir);

        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }

        cb(null, fullPath);
    },
    filename: (req, file, cb) => {
        // Генерируем уникальное имя файла
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    },
});

// Фильтр для проверки типов файлов
const fileFilter = (req, file, cb) => {
    // Разрешенные MIME типы для изображений
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(`Неподдерживаемый тип файла: ${file.mimetype}. Разрешены только JPEG, PNG и WebP изображения.`),
            false
        );
    }
};

// Конфигурация multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Максимальный размер файла 5MB
        files: 10, // Максимальное количество файлов за один раз
    },
});

// Middleware для обработки ошибок загрузки
const handleUploadErrors = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'Размер файла превышает допустимый лимит (5MB)',
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                message: 'Превышено максимальное количество файлов (10)',
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                message: 'Неожиданное поле файла',
            });
        }
    }

    if (error.message.includes('Неподдерживаемый тип файла')) {
        return res.status(400).json({
            message: error.message,
        });
    }

    console.error('Ошибка загрузки файла:', error);
    return res.status(500).json({
        message: 'Внутренняя ошибка сервера при загрузке файла',
    });
};

// Middleware для загрузки одного изображения
const uploadSingle = upload.single('image');

// Middleware для загрузки нескольких изображений
const uploadMultiple = upload.array('images', 10);

module.exports = {
    uploadSingle,
    uploadMultiple,
    handleUploadErrors,
};
