const { Image, Attraction } = require('../models');
const path = require('path');
const fs = require('fs');

// Загрузка изображений для достопримечательности
const uploadImages = async (req, res) => {
    try {
        const { id: attractionId } = req.params;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({
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
                message: 'Достопримечательность не найдена',
            });
        }

        // Создаем записи изображений в базе данных
        const imagePromises = files.map(async (file, index) => {
            return await Image.create({
                filename: file.filename,
                originalName: file.originalname,
                path: file.path,
                size: file.size,
                mimeType: file.mimetype,
                altText: `${attraction.name} - изображение ${index + 1}`,
                isPrimary: index === 0, // Первое изображение делаем основным
                attractionId: attractionId,
            });
        });

        const createdImages = await Promise.all(imagePromises);

        res.status(201).json({
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
            message: 'Внутренняя ошибка сервера при загрузке изображений',
        });
    }
};

// Удаление изображения
const deleteImage = async (req, res) => {
    try {
        const { attractionId, imageId } = req.params;

        const image = await Image.findOne({
            where: {
                id: imageId,
                attractionId: attractionId,
            },
        });

        if (!image) {
            return res.status(404).json({
                message: 'Изображение не найдено',
            });
        }

        // Удаляем файл с диска
        if (fs.existsSync(image.path)) {
            fs.unlinkSync(image.path);
        }

        // Удаляем запись из базы данных
        await image.destroy();

        res.json({
            message: 'Изображение успешно удалено',
        });
    } catch (error) {
        console.error('Ошибка удаления изображения:', error);
        res.status(500).json({
            message: 'Внутренняя ошибка сервера',
        });
    }
};

module.exports = {
    uploadImages,
    deleteImage,
};
