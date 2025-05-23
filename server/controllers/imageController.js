const { Image, Attraction } = require('../models');
const path = require('path');
const fs = require('fs');

// Загрузка изображений для достопримечательности
const uploadImages = async (req, res) => {
    try {
        const { id: attractionId } = req.params;
        const files = req.files;

        console.log(`Запрос на загрузку изображений для достопримечательности ${attractionId}`);
        console.log('Полученные файлы:', files ? files.length : 'нет файлов');

        // Дополнительный вывод информации о файлах для отладки
        if (files && files.length > 0) {
            console.log('Информация о первом файле:');
            console.log('- filename:', files[0].filename);
            console.log('- originalname:', files[0].originalname);
            console.log('- path:', files[0].path);
            console.log('- size:', files[0].size);
            console.log('- mimetype:', files[0].mimetype);
        }

        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Файлы изображений не предоставлены',
            });
        }

        // Проверяем существование достопримечательности
        const attraction = await Attraction.findByPk(attractionId);
        if (!attraction) {
            // Удаляем загруженные файлы, если достопримечательность не найдена
            files.forEach((file) => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });

            return res.status(404).json({
                success: false,
                message: 'Достопримечательность не найдена',
            });
        }

        // Проверяем, какое изображение должно быть главным
        let primaryImageIndex = req.body.primaryImageIndex !== undefined ? parseInt(req.body.primaryImageIndex) : 0;

        console.log(`Индекс главного изображения: ${primaryImageIndex}`);

        // Если primaryImageIndex выходит за пределы массива, используем первое изображение
        if (primaryImageIndex < 0 || primaryImageIndex >= files.length) {
            primaryImageIndex = 0;
        }

        // Создаем записи изображений в базе данных
        const imagePromises = files.map(async (file, index) => {
            // Извлекаем дату из пути файла для формирования относительного пути
            const pathParts = file.path.split(path.sep);
            const dateDir = pathParts[pathParts.length - 2]; // Получаем предпоследнюю часть (директорию с датой)

            // Создаем относительный путь для сохранения в БД
            const relativePath = `/uploads/${dateDir}/${file.filename}`;

            return await Image.create({
                filename: file.filename || path.basename(file.path),
                originalName: file.originalname || path.basename(file.path),
                path: relativePath, // Сохраняем относительный путь вместо абсолютного
                size: file.size,
                mimeType: file.mimetype,
                altText: `${attraction.name} - изображение ${index + 1}`,
                isPrimary: index === primaryImageIndex,
                attractionId: attractionId,
            });
        });

        const createdImages = await Promise.all(imagePromises);

        console.log(`Успешно создано ${createdImages.length} изображений`);

        res.status(201).json({
            success: true,
            message: `Успешно загружено ${createdImages.length} изображений`,
            images: createdImages.map((img) => ({
                id: img.id,
                filename: img.filename,
                originalName: img.originalName,
                isPrimary: img.isPrimary,
                url: `/uploads/${path.basename(path.dirname(img.path))}/${img.filename}`,
            })),
        });
    } catch (error) {
        console.error('Ошибка загрузки изображений:', error);

        // Очищаем загруженные файлы в случае ошибки
        if (req.files) {
            req.files.forEach((file) => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }

        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера при загрузке изображений',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

// Удаление изображения
const deleteImage = async (req, res) => {
    try {
        const { attractionId, imageId } = req.params;

        console.log(`Запрос на удаление изображения ${imageId} для достопримечательности ${attractionId}`);

        const image = await Image.findOne({
            where: {
                id: imageId,
                attractionId: attractionId,
            },
        });

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Изображение не найдено',
            });
        }

        // Сохраняем информацию о том, было ли это изображение главным
        const wasPrimary = image.isPrimary;

        // Удаляем файл с диска
        if (fs.existsSync(image.path)) {
            fs.unlinkSync(image.path);
        }

        // Удаляем запись из базы данных
        await image.destroy();

        console.log(`Изображение ${imageId} успешно удалено`);

        // Если удаленное изображение было главным, устанавливаем новое главное изображение
        if (wasPrimary) {
            const firstImage = await Image.findOne({
                where: { attractionId: attractionId },
                order: [['createdAt', 'ASC']],
            });

            if (firstImage) {
                firstImage.isPrimary = true;
                await firstImage.save();
                console.log(`Установлено новое главное изображение: ${firstImage.id}`);
            }
        }

        res.json({
            success: true,
            message: 'Изображение успешно удалено',
        });
    } catch (error) {
        console.error('Ошибка удаления изображения:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера',
        });
    }
};

// Установка главного изображения
const setPrimaryImage = async (req, res) => {
    try {
        const { attractionId, imageId } = req.params;

        console.log(`Запрос на установку главного изображения ${imageId} для достопримечательности ${attractionId}`);

        // Проверяем, существует ли изображение
        const image = await Image.findOne({
            where: {
                id: imageId,
                attractionId: attractionId,
            },
        });

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Изображение не найдено',
            });
        }

        // Сначала сбрасываем статус "главное" у всех изображений достопримечательности
        await Image.update({ isPrimary: false }, { where: { attractionId: attractionId } });

        // Устанавливаем новое главное изображение
        image.isPrimary = true;
        await image.save();

        console.log(`Установлено новое главное изображение: ${imageId}`);

        res.json({
            success: true,
            message: 'Главное изображение успешно обновлено',
            image: {
                id: image.id,
                isPrimary: true,
            },
        });
    } catch (error) {
        console.error('Ошибка при установке главного изображения:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера',
        });
    }
};

module.exports = {
    uploadImages,
    deleteImage,
    setPrimaryImage,
};
