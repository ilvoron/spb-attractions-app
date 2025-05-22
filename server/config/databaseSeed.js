const { sequelize } = require('./database');
const { User, Category, MetroStation, Attraction, Image } = require('../models');
const bcrypt = require('bcryptjs');

/**
 * Улучшенный скрипт для заполнения базы данных начальными данными
 * Файл: server/config/database-seed.js
 *
 * Этот обновленный скрипт использует более безопасный подход к синхронизации:
 * 1. Сначала пытается мягкую синхронизацию без принудительного пересоздания
 * 2. Если возникают ошибки индексов, продолжает работу с существующей структурой
 * 3. Добавляет новые поля через отдельные ALTER запросы при необходимости
 *
 * Философия: "Лучше иметь частично работающую систему, чем совсем не работающую"
 */

async function addMissingColumns() {
    console.log('🔧 Проверяем и добавляем недостающие колонки...');

    try {
        // Получаем информацию о существующих колонках в таблице users
        const [results] = await sequelize.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND table_schema = 'public'
        `);

        const existingColumns = results.map((row) => row.column_name);
        console.log('Существующие колонки в таблице users:', existingColumns);

        // Список новых колонок, которые нужно добавить
        const newColumns = [
            {
                name: 'resetPasswordToken',
                definition: 'VARCHAR(255) NULL',
            },
            {
                name: 'resetPasswordExpires',
                definition: 'TIMESTAMP WITH TIME ZONE NULL',
            },
            {
                name: 'lastLoginAt',
                definition: 'TIMESTAMP WITH TIME ZONE NULL',
            },
            {
                name: 'loginAttempts',
                definition: 'INTEGER DEFAULT 0',
            },
            {
                name: 'lockedUntil',
                definition: 'TIMESTAMP WITH TIME ZONE NULL',
            },
        ];

        // Добавляем недостающие колонки
        for (const column of newColumns) {
            if (!existingColumns.includes(column.name)) {
                console.log(`Добавляем колонку: ${column.name}`);
                try {
                    await sequelize.query(`
                        ALTER TABLE users 
                        ADD COLUMN "${column.name}" ${column.definition}
                    `);
                    console.log(`✅ Колонка ${column.name} добавлена успешно`);
                } catch (error) {
                    console.log(`⚠️ Не удалось добавить колонку ${column.name}:, ${error.message}`);
                    // Продолжаем выполнение даже если одна колонка не добавилась
                }
            } else {
                console.log(`✅ Колонка ${column.name} уже существует`);
            }
        }
    } catch (error) {
        console.log('⚠️ Ошибка при проверке колонок:', error.message);
        console.log('Продолжаем с существующей структурой...');
    }
}

async function safeSyncModels() {
    console.log('🔄 Выполняем безопасную синхронизацию моделей...');

    try {
        // Сначала добавляем недостающие колонки вручную
        await addMissingColumns();

        // Затем выполняем мягкую синхронизацию для создания недостающих таблиц
        await sequelize.sync({
            force: false, // Не пересоздаваем существующие таблицы
            alter: false, // Не изменяем структуру автоматически - мы это делаем вручную
        });

        console.log('✅ Синхронизация моделей завершена успешно');
    } catch (error) {
        console.log('⚠️ Ошибка синхронизации:', error.message);
        console.log('Пытаемся продолжить с существующей структурой...');

        // Даже если синхронизация не удалась полностью, пытаемся работать с тем что есть
        try {
            // Проверяем подключение к БД
            await sequelize.authenticate();
            console.log('✅ Подключение к базе данных работает');
        } catch (connectionError) {
            throw new Error(`Критическая ошибка подключения к БД: ${connectionError.message}`);
        }
    }
}

async function seedDatabase() {
    try {
        console.log('🌱 Начинаем заполнение базы данных...');

        // Выполняем безопасную синхронизацию
        await safeSyncModels();

        // 1. Создаем пользователей
        console.log('👤 Создаем пользователей...');

        const adminPassword = await bcrypt.hash('admin123', 12);
        const userPassword = await bcrypt.hash('user123', 12);

        const [admin, user] = await Promise.all([
            User.findOrCreate({
                where: { email: 'admin@spb-attractions.ru' },
                defaults: {
                    email: 'admin@spb-attractions.ru',
                    password: adminPassword,
                    role: 'admin',
                },
            }),
            User.findOrCreate({
                where: { email: 'user@example.com' },
                defaults: {
                    email: 'user@example.com',
                    password: userPassword,
                    role: 'user',
                },
            }),
        ]);

        console.log('✅ Пользователи созданы');

        // 2. Создаем категории
        console.log('📂 Создаем категории...');

        const categories = [
            {
                name: 'Музеи и галереи',
                description: 'Художественные музеи, галереи современного искусства и выставочные залы',
                slug: 'museums-galleries',
                color: '#3B82F6',
            },
            {
                name: 'Дворцы и усадьбы',
                description: 'Императорские дворцы, исторические усадьбы и парковые комплексы',
                slug: 'palaces-estates',
                color: '#F59E0B',
            },
            {
                name: 'Храмы и соборы',
                description: 'Православные храмы, соборы и другие религиозные сооружения',
                slug: 'temples-cathedrals',
                color: '#10B981',
            },
            {
                name: 'Мосты и набережные',
                description: 'Знаменитые мосты и живописные набережные города',
                slug: 'bridges-embankments',
                color: '#8B5CF6',
            },
            {
                name: 'Парки и сады',
                description: 'Городские парки, ботанические сады и зоны отдыха',
                slug: 'parks-gardens',
                color: '#EF4444',
            },
        ];

        const createdCategories = [];
        for (const categoryData of categories) {
            const [category] = await Category.findOrCreate({
                where: { name: categoryData.name },
                defaults: categoryData,
            });
            createdCategories.push(category);
        }

        console.log('✅ Категории созданы');

        // 3. Создаем станции метро
        console.log('🚇 Создаем станции метро...');

        const metroStations = [
            { name: 'Невский проспект', lineColor: 'blue', lineName: 'Синяя линия' },
            { name: 'Гостиный двор', lineColor: 'green', lineName: 'Зеленая линия' },
            { name: 'Адмиралтейская', lineColor: 'purple', lineName: 'Фиолетовая линия' },
            { name: 'Спасская', lineColor: 'orange', lineName: 'Оранжевая линия' },
            { name: 'Садовая', lineColor: 'purple', lineName: 'Фиолетовая линия' },
            { name: 'Василеостровская', lineColor: 'green', lineName: 'Зеленая линия' },
            { name: 'Горьковская', lineColor: 'purple', lineName: 'Фиолетовая линия' },
        ];

        const createdStations = [];
        for (const stationData of metroStations) {
            const [station] = await MetroStation.findOrCreate({
                where: { name: stationData.name },
                defaults: stationData,
            });
            createdStations.push(station);
        }

        console.log('✅ Станции метро созданы');

        // 4. Создаем достопримечательности
        console.log('🏛️ Создаем достопримечательности...');

        const attractions = [
            {
                name: 'Государственный Эрмитаж',
                slug: 'hermitage-museum',
                shortDescription:
                    'Один из крупнейших и значительнейших художественных и культурно-исторических музеев мира',
                fullDescription:
                    'Государственный Эрмитаж — один из крупнейших и наиболее значительных художественных и культурно-исторических музеев России и мира. Находится в Санкт-Петербурге. Первоначальная коллекция Эрмитажа была приобретена императрицей Екатериной II в 1764 году. Сегодня музей обладает коллекцией, насчитывающей более трёх миллионов произведений искусства и памятников мировой культуры.',
                address: 'Дворцовая площадь, 2',
                district: 'Центральный',
                latitude: 59.9398,
                longitude: 30.3146,
                workingHours: 'Вт-Сб: 10:00-18:00, Вс: 10:00-17:00, Пн - выходной',
                ticketPrice: 'от 400₽, льготный 200₽',
                website: 'https://hermitagemuseum.org',
                phone: '+7 (812) 710-90-79',
                distanceToMetro: 3,
                wheelchairAccessible: true,
                hasElevator: true,
                hasAudioGuide: true,
                hasSignLanguageSupport: false,
                accessibilityNotes: 'Доступ для инвалидных колясок через служебный вход',
                isPublished: true,
                categoryId: createdCategories[0].id,
                metroStationId: createdStations[1].id,
                createdBy: admin[0].id,
            },
            {
                name: 'Петропавловская крепость',
                slug: 'petropavlovsk-fortress',
                shortDescription: 'Историческое ядро Санкт-Петербурга, заложенное Петром I в 1703 году',
                fullDescription:
                    'Петропавловская крепость — цитадель Санкт-Петербурга, расположенная на Заячьем острове, историческое ядро города. Заложена 16 (27) мая 1703 года по совместному плану Петра I и французского инженера Жозефа-Гаспара Ламбера де Герена. Включает в себя Петропавловский собор с усыпальницей российских императоров, Великокняжескую усыпальницу, Трубецкой бастион с тюрьмой и множество музеев.',
                address: 'Петропавловская крепость, 3',
                district: 'Петроградский',
                latitude: 59.9496,
                longitude: 30.3164,
                workingHours: 'Ежедневно: 06:00-21:00, музеи: 10:00-18:00',
                ticketPrice: 'Вход на территорию бесплатный, музеи от 250₽',
                website: 'https://spbmuseum.ru',
                phone: '+7 (812) 230-64-31',
                distanceToMetro: 10,
                wheelchairAccessible: false,
                hasElevator: false,
                hasAudioGuide: true,
                hasSignLanguageSupport: false,
                accessibilityNotes: 'Историческая брусчатка, есть пандусы в отдельных зданиях',
                isPublished: true,
                categoryId: createdCategories[2].id,
                metroStationId: createdStations[6].id,
                createdBy: admin[0].id,
            },
            {
                name: 'Дворцовый мост',
                slug: 'palace-bridge',
                shortDescription:
                    'Один из символов Санкт-Петербурга, соединяющий Дворцовую площадь с Васильевским островом',
                fullDescription:
                    'Дворцовый мост — один из красивейших разводных мостов Санкт-Петербурга через Большую Неву. Соединяет центральную часть города (Дворцовую площадь) и Васильевский остров. Построен в 1912-1916 годах по проекту инженера А. П. Пшеницкого. Длина моста составляет 260,1 метра, ширина — 27,8 метра. Мост разводится ежедневно в период навигации.',
                address: 'Дворцовый мост',
                district: 'Центральный',
                latitude: 59.9387,
                longitude: 30.3067,
                workingHours: 'Круглосуточно, разводка: 01:10-02:50',
                ticketPrice: 'Бесплатно',
                website: null,
                phone: null,
                distanceToMetro: 5,
                wheelchairAccessible: true,
                hasElevator: false,
                hasAudioGuide: false,
                hasSignLanguageSupport: false,
                accessibilityNotes: 'Пешеходные тротуары доступны для колясок',
                isPublished: true,
                categoryId: createdCategories[3].id,
                metroStationId: createdStations[2].id,
                createdBy: admin[0].id,
            },
            {
                name: 'Летний сад',
                slug: 'summer-garden',
                shortDescription: 'Старейший сад Санкт-Петербурга, заложенный по повелению Петра I в 1704 году',
                fullDescription:
                    'Летний сад — парк в центре Санкт-Петербурга, памятник садово-паркового искусства первой трети XVIII века. Заложен в 1704 году по повелению Петра I. Находится на острове, образованном реками Невой, Фонтанкой, Мойкой и Лебяжьим каналом. Сад украшен мраморными скульптурами, среди которых работы знаменитых мастеров XVII-XVIII веков.',
                address: 'наб. Кутузова, 2',
                district: 'Центральный',
                latitude: 59.9421,
                longitude: 30.337,
                workingHours: 'Май-сентябрь: 10:00-22:00, октябрь-апрель: 10:00-20:00',
                ticketPrice: 'Бесплатно',
                website: 'https://rusmuseum.ru',
                phone: '+7 (812) 595-42-48',
                distanceToMetro: 7,
                wheelchairAccessible: true,
                hasElevator: false,
                hasAudioGuide: false,
                hasSignLanguageSupport: false,
                accessibilityNotes: 'Асфальтированные дорожки, есть пандусы',
                isPublished: true,
                categoryId: createdCategories[4].id,
                metroStationId: createdStations[1].id,
                createdBy: admin[0].id,
            },
            {
                name: 'Исаакиевский собор',
                slug: 'saint-isaac-cathedral',
                shortDescription: 'Крупнейший православный храм Санкт-Петербурга, выдающийся памятник архитектуры',
                fullDescription:
                    'Исаакиевский собор — крупнейший православный храм Санкт-Петербурга. Расположен на Исаакиевской площади. Построен в 1818—1858 годах по проекту архитектора Огюста де Монферрана; строительство курировал император Николай I. Освящён во имя преподобного Исаакия Далматского, день памяти которого совпадал с днём рождения Петра I. Высота собора составляет 101,5 метра.',
                address: 'Исаакиевская пл., 4',
                district: 'Адмиралтейский',
                latitude: 59.9342,
                longitude: 30.3062,
                workingHours: 'Чт-Вт: 10:30-18:00, среда - выходной',
                ticketPrice: 'от 350₽, колоннада от 200₽',
                website: 'https://cathedral.ru',
                phone: '+7 (812) 315-97-32',
                distanceToMetro: 4,
                wheelchairAccessible: false,
                hasElevator: true,
                hasAudioGuide: true,
                hasSignLanguageSupport: false,
                accessibilityNotes: 'Главный вход имеет ступени, есть подъемник для инвалидных колясок',
                isPublished: true,
                categoryId: createdCategories[2].id,
                metroStationId: createdStations[2].id,
                createdBy: admin[0].id,
            },
        ];

        for (const attractionData of attractions) {
            await Attraction.findOrCreate({
                where: { name: attractionData.name },
                defaults: attractionData,
            });
        }

        console.log('✅ Достопримечательности созданы');

        // Проверяем результат
        const totalAttractions = await Attraction.count();
        const totalCategories = await Category.count();
        const totalUsers = await User.count();

        console.log('\n🎉 База данных успешно заполнена!');
        console.log(`📊 Статистика:`);
        console.log(`   👤 Пользователей: ${totalUsers}`);
        console.log(`   📂 Категорий: ${totalCategories}`);
        console.log(`   🏛️ Достопримечательностей: ${totalAttractions}`);
        console.log(`   🚇 Станций метро: ${createdStations.length}`);

        console.log('\n🔐 Данные для входа:');
        console.log('   Администратор: admin@spb-attractions.ru / admin123');
        console.log('   Пользователь: user@example.com / user123');
    } catch (error) {
        console.error('❌ Ошибка при заполнении базы данных:', error);
        console.error('Детали ошибки:', error.message);

        // Не показываем весь stack trace, но даем полезную информацию
        if (error.name === 'SequelizeDatabaseError') {
            console.log('\n💡 Возможные решения:');
            console.log('1. Проверьте настройки подключения к PostgreSQL');
            console.log('2. Убедитесь, что база данных создана');
            console.log('3. Проверьте права доступа пользователя к базе данных');
        }
    } finally {
        // Закрываем соединение с базой данных
        await sequelize.close();
        console.log('\n👋 Соединение с базой данных закрыто');
        process.exit(0);
    }
}

// Запускаем скрипт, если файл вызван напрямую
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase };
