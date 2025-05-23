const { sequelize } = require('./database');
const { User, Category, MetroStation, Attraction, Image } = require('../models');
const bcrypt = require('bcryptjs');
const path = require('path');

/**
 * Скрипт для заполнения базы данных достопримечательностями Санкт-Петербурга с реальными данными
 * Скрипт принудительно пересоздает таблицы и наполняет их корректными данными
 */

async function seedDatabase() {
    try {
        console.log('Начинаем пересоздание и заполнение базы данных...');

        // Принудительная синхронизация с пересозданием таблиц
        await sequelize.sync({ force: true });
        console.log('Таблицы успешно пересозданы');

        // 1. Создаем пользователей
        console.log('Создаем пользователей...');

        const adminPassword = await bcrypt.hash('admin123', 12);
        const userPassword = await bcrypt.hash('user123', 12);

        const [admin, user] = await Promise.all([
            User.create({
                email: 'admin@spb-attractions.ru',
                password: adminPassword,
                role: 'admin',
            }),
            User.create({
                email: 'user@example.com',
                password: userPassword,
                role: 'user',
            }),
        ]);

        console.log('Пользователи созданы');

        // 2. Создаем категории
        console.log('Создаем категории...');

        const categories = [
            {
                name: 'Музеи и галереи',
                description: 'Художественные музеи, галереи современного искусства и выставочные залы',
                slug: 'museums-galleries',
                color: '#3B82F6', // Синий
            },
            {
                name: 'Дворцы и усадьбы',
                description: 'Императорские дворцы, исторические усадьбы и парковые комплексы',
                slug: 'palaces-estates',
                color: '#F59E0B', // Оранжевый
            },
            {
                name: 'Храмы и соборы',
                description: 'Православные храмы, соборы и другие религиозные сооружения',
                slug: 'temples-cathedrals',
                color: '#10B981', // Зеленый
            },
            {
                name: 'Мосты и набережные',
                description: 'Знаменитые мосты и живописные набережные города',
                slug: 'bridges-embankments',
                color: '#8B5CF6', // Фиолетовый
            },
            {
                name: 'Парки и сады',
                description: 'Городские парки, ботанические сады и зоны отдыха',
                slug: 'parks-gardens',
                color: '#EF4444', // Красный
            },
            {
                name: 'Памятники и скульптуры',
                description: 'Исторические памятники, монументы и скульптурные композиции',
                slug: 'monuments-sculptures',
                color: '#6366F1', // Индиго
            },
        ];

        const createdCategories = await Promise.all(categories.map((category) => Category.create(category)));

        console.log('Категории созданы');

        // 3. Создаем станции метро
        console.log('Создаем станции метро...');

        const metroStations = [
            { name: 'Невский проспект', lineColor: '#0078C9', lineName: 'Московско-Петроградская линия' },
            { name: 'Гостиный двор', lineColor: '#48B85E', lineName: 'Невско-Василеостровская линия' },
            { name: 'Адмиралтейская', lineColor: '#702785', lineName: 'Фрунзенско-Приморская линия' },
            { name: 'Спасская', lineColor: '#EA7125', lineName: 'Правобережная линия' },
            { name: 'Садовая', lineColor: '#702785', lineName: 'Фрунзенско-Приморская линия' },
            { name: 'Василеостровская', lineColor: '#48B85E', lineName: 'Невско-Василеостровская линия' },
            { name: 'Горьковская', lineColor: '#0078C9', lineName: 'Московско-Петроградская линия' },
            { name: 'Площадь Восстания', lineColor: '#D51A1A', lineName: 'Кировско-Выборгская линия' },
            { name: 'Маяковская', lineColor: '#D51A1A', lineName: 'Кировско-Выборгская линия' },
            { name: 'Петроградская', lineColor: '#0078C9', lineName: 'Московско-Петроградская линия' },
            { name: 'Владимирская', lineColor: '#D51A1A', lineName: 'Кировско-Выборгская линия' },
            { name: 'Чернышевская', lineColor: '#D51A1A', lineName: 'Кировско-Выборгская линия' },
            { name: 'Технологический институт', lineColor: '#D51A1A', lineName: 'Кировско-Выборгская линия' },
        ];

        const createdStations = await Promise.all(metroStations.map((station) => MetroStation.create(station)));

        console.log('Станции метро созданы');

        // 4. Создаем достопримечательности
        console.log('Создаем достопримечательности...');

        const attractions = [
            {
                name: 'Государственный Эрмитаж',
                slug: 'hermitage-museum',
                shortDescription:
                    'Один из крупнейших и значительнейших художественных и культурно-исторических музеев мира',
                fullDescription:
                    'Государственный Эрмитаж — один из крупнейших и наиболее значительных художественных и культурно-исторических музеев России и мира. Находится в Санкт-Петербурге. Первоначальная коллекция Эрмитажа была приобретена императрицей Екатериной II в 1764 году. Сегодня музей обладает коллекцией, насчитывающей более трёх миллионов произведений искусства и памятников мировой культуры.\n\nЭрмитаж расположен в комплексе из шести зданий вдоль набережной Невы, главным из которых является Зимний дворец. В его коллекциях представлены шедевры Леонардо да Винчи, Рафаэля, Тициана, Рембрандта, Рубенса, Ван Гога, Гогена, Пикассо и многих других великих мастеров.',
                address: 'Дворцовая площадь, 2',
                workingHours: 'Вт-Вс: 10:30-18:00, Ср: 10:30-21:00, Пн - выходной',
                ticketPrice: 'от 400₽, льготный 200₽',
                website: 'https://hermitagemuseum.org',
                phone: '+7 (812) 710-90-79',
                distanceToMetro: 3,
                wheelchairAccessible: true,
                hasElevator: true,
                hasAudioGuide: true,
                hasSignLanguageSupport: false,
                accessibilityNotes: 'Доступ для инвалидных колясок через служебный вход',
                categoryId: createdCategories[0].id,
                metroStationId: createdStations[0].id,
                createdBy: admin.id,
            },
            {
                name: 'Петропавловская крепость',
                slug: 'petropavlovsk-fortress',
                shortDescription: 'Историческое ядро Санкт-Петербурга, заложенное Петром I в 1703 году',
                fullDescription:
                    'Петропавловская крепость — цитадель Санкт-Петербурга, расположенная на Заячьем острове, историческое ядро города. Заложена 16 (27) мая 1703 года по совместному плану Петра I и французского инженера Жозефа-Гаспара Ламбера де Герена. Включает в себя Петропавловский собор с усыпальницей российских императоров, Великокняжескую усыпальницу, Трубецкой бастион с тюрьмой и множество музеев.\n\nВ настоящее время крепость входит в состав Государственного музея истории Санкт-Петербурга и является одним из главных туристических объектов города.',
                address: 'Петропавловская крепость, 3',
                workingHours: 'Ежедневно: 09:00-21:00, музеи: 10:00-18:00',
                ticketPrice: 'Вход на территорию бесплатный, музеи от 250₽',
                website: 'https://spbmuseum.ru',
                phone: '+7 (812) 230-64-31',
                distanceToMetro: 10,
                wheelchairAccessible: false,
                hasElevator: false,
                hasAudioGuide: true,
                hasSignLanguageSupport: false,
                accessibilityNotes: 'Историческая брусчатка, есть пандусы в отдельных зданиях',
                categoryId: createdCategories[1].id,
                metroStationId: createdStations[6].id,
                createdBy: admin.id,
            },
            {
                name: 'Исаакиевский собор',
                slug: 'saint-isaac-cathedral',
                shortDescription: 'Крупнейший православный храм Санкт-Петербурга, выдающийся памятник архитектуры',
                fullDescription:
                    'Исаакиевский собор — крупнейший православный храм Санкт-Петербурга. Расположен на Исаакиевской площади. Построен в 1818—1858 годах по проекту архитектора Огюста де Монферрана; строительство курировал император Николай I. Освящён во имя преподобного Исаакия Далматского, день памяти которого совпадал с днём рождения Петра I. Высота собора составляет 101,5 метра.\n\nСобор является уникальным памятником архитектуры и монументально-декоративного искусства. Его интерьер украшен малахитом, лазуритом, мрамором, мозаиками, витражами и позолоченной бронзой. Смотровая площадка на колоннаде собора предлагает панорамный вид на центр Санкт-Петербурга.',
                address: 'Исаакиевская пл., 4',
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
                categoryId: createdCategories[2].id,
                metroStationId: createdStations[2].id,
                createdBy: admin.id,
            },
            {
                name: 'Дворцовый мост',
                slug: 'palace-bridge',
                shortDescription:
                    'Один из символов Санкт-Петербурга, соединяющий Дворцовую площадь с Васильевским островом',
                fullDescription:
                    'Дворцовый мост — один из красивейших разводных мостов Санкт-Петербурга через Большую Неву. Соединяет центральную часть города (Дворцовую площадь) и Васильевский остров. Построен в 1912-1916 годах по проекту инженера А. П. Пшеницкого. Длина моста составляет 260,1 метра, ширина — 27,8 метра. Мост разводится ежедневно в период навигации.\n\nРазвод Дворцового моста — одно из самых известных туристических зрелищ Санкт-Петербурга. Во время разводки крылья моста поднимаются на высоту около 30 метров. В период белых ночей многочисленные теплоходы с туристами собираются у Дворцового моста, чтобы наблюдать его развод.',
                address: 'Дворцовый мост',
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
                categoryId: createdCategories[3].id,
                metroStationId: createdStations[1].id,
                createdBy: admin.id,
            },
            {
                name: 'Летний сад',
                slug: 'summer-garden',
                shortDescription: 'Старейший сад Санкт-Петербурга, заложенный по повелению Петра I в 1704 году',
                fullDescription:
                    'Летний сад — парк в центре Санкт-Петербурга, памятник садово-паркового искусства первой трети XVIII века. Заложен в 1704 году по повелению Петра I. Находится на острове, образованном реками Невой, Фонтанкой, Мойкой и Лебяжьим каналом. Сад украшен мраморными скульптурами, среди которых работы знаменитых мастеров XVII-XVIII веков.\n\nВ 2009-2012 годах была проведена реконструкция сада, в ходе которой были восстановлены фонтаны, боскеты, шпалеры и другие элементы, характерные для регулярных садов начала XVIII века. Летний сад является филиалом Русского музея.',
                address: 'наб. Кутузова, 2',
                workingHours: 'Май-сентябрь: 10:00-22:00, октябрь-апрель: 10:00-20:00',
                ticketPrice: 'Бесплатно',
                website: 'https://rusmuseum.ru/summer-garden/',
                phone: '+7 (812) 595-42-48',
                distanceToMetro: 7,
                wheelchairAccessible: true,
                hasElevator: false,
                hasAudioGuide: false,
                hasSignLanguageSupport: false,
                accessibilityNotes: 'Асфальтированные дорожки, есть пандусы',
                categoryId: createdCategories[4].id,
                metroStationId: createdStations[0].id,
                createdBy: admin.id,
            },
            {
                name: 'Казанский собор',
                slug: 'kazan-cathedral',
                shortDescription:
                    'Величественный православный собор на Невском проспекте, построенный в 1801-1811 годах',
                fullDescription:
                    'Казанский кафедральный собор — один из крупнейших храмов Санкт-Петербурга, выполненный в стиле ампир. Построен на Невском проспекте в 1801—1811 годах архитектором А. Н. Воронихиным для хранения чтимого списка чудотворной иконы Божией Матери Казанской. После Отечественной войны 1812 года собор стал памятником русской воинской славы. В нём похоронен полководец Михаил Илларионович Кутузов.\n\nГлавной архитектурной особенностью собора является грандиозная колоннада из 96 колонн коринфского ордера, огибающая площадь перед северным фасадом здания. В архитектуре собора также прослеживается влияние собора Святого Петра в Риме.',
                address: 'Казанская пл., 2',
                workingHours: 'Ежедневно: 07:00-20:00',
                ticketPrice: 'Бесплатно',
                website: 'http://kazansky-spb.ru/',
                phone: '+7 (812) 314-46-63',
                distanceToMetro: 1,
                wheelchairAccessible: true,
                hasElevator: false,
                hasAudioGuide: true,
                hasSignLanguageSupport: false,
                accessibilityNotes: 'Доступ по пандусу с правой стороны собора',
                categoryId: createdCategories[2].id,
                metroStationId: createdStations[0].id,
                createdBy: admin.id,
            },
            {
                name: 'Русский музей',
                slug: 'russian-museum',
                shortDescription: 'Крупнейший в мире музей русского искусства, основанный в 1895 году',
                fullDescription:
                    'Государственный Русский музей — первый в стране государственный музей русского изобразительного искусства, основан в 1895 году в Санкт-Петербурге по Указу императора Николая II. Торжественно открыт для посетителей 19 марта (7 марта по старому стилю) 1898 года.\n\nКоллекция Русского музея насчитывает более 400 000 экспонатов и охватывает все исторические периоды и тенденции развития русского искусства, все его основные виды и жанры, направления и школы более чем за 1000 лет. Основная экспозиция расположена в Михайловском дворце и корпусе Бенуа. В состав музея также входят Мраморный дворец, Строгановский дворец, Михайловский замок и другие объекты.',
                address: 'Инженерная ул., 4',
                workingHours: 'Пн, Ср, Пт, Сб, Вс: 10:00-18:00, Чт: 13:00-21:00, Вт - выходной',
                ticketPrice: 'от 350₽, льготный 150₽',
                website: 'https://rusmuseum.ru/',
                phone: '+7 (812) 595-42-48',
                distanceToMetro: 6,
                wheelchairAccessible: true,
                hasElevator: true,
                hasAudioGuide: true,
                hasSignLanguageSupport: true,
                accessibilityNotes: 'Доступны подъемники и лифты для маломобильных посетителей',
                categoryId: createdCategories[0].id,
                metroStationId: createdStations[0].id,
                createdBy: admin.id,
            },
            {
                name: 'Спас на Крови',
                slug: 'church-savior-spilled-blood',
                shortDescription:
                    'Православный храм, построенный на месте смертельного ранения императора Александра II',
                fullDescription:
                    'Храм Воскресения Христова, известный также как Спас на Крови — православный мемориальный храм во имя Воскресения Христова в Санкт-Петербурге. Построен на месте, где 1 марта 1881 года в результате покушения был смертельно ранен император Александр II. Храм был сооружён в 1883—1907 годах по проекту архитектора Альфреда Парланда.\n\nХрам является памятником русской архитектуры в «русском стиле» и одним из основных символов Санкт-Петербурга. Интерьер храма отделан итальянским мрамором, самоцветами, декоративными эмалями и позолоченной бронзой. Особую художественную ценность представляет грандиозная коллекция мозаик, площадь которых составляет 7065 квадратных метров.',
                address: 'наб. канала Грибоедова, 2Б',
                workingHours: 'Пн-Вс: 10:30-18:00',
                ticketPrice: 'от 350₽, льготный 200₽',
                website: 'https://cathedral.ru/ru/savior',
                phone: '+7 (812) 315-16-36',
                distanceToMetro: 2,
                wheelchairAccessible: false,
                hasElevator: false,
                hasAudioGuide: true,
                hasSignLanguageSupport: false,
                accessibilityNotes: 'Ступени при входе без пандуса',
                categoryId: createdCategories[2].id,
                metroStationId: createdStations[0].id,
                createdBy: admin.id,
            },
            {
                name: 'Михайловский замок',
                slug: 'mikhailovsky-castle',
                shortDescription: 'Бывший императорский дворец, построенный для императора Павла I в 1797-1801 годах',
                fullDescription:
                    'Михайловский (Инженерный) замок — бывший императорский дворец в центре Санкт-Петербурга, построенный по воле императора Павла I на месте деревянного Летнего дворца Елизаветы Петровны. Строительство велось в 1797—1801 годах под руководством архитекторов В. И. Баженова и В. Бренны. 21 марта 1801 года император Павел I был убит в результате заговора в своей спальне в только что построенном замке.\n\nВ архитектуре замка соединились черты западноевропейского средневекового замка и классицизма. В настоящее время здание является филиалом Государственного Русского музея, в нём размещены экспозиции русского искусства XVIII — первой половины XIX века.',
                address: 'Садовая ул., 2',
                workingHours: 'Пн-Вс: 10:00-18:00, Чт: 13:00-21:00',
                ticketPrice: 'от 350₽, льготный 150₽',
                website: 'https://rusmuseum.ru/mikhailovsky-castle/',
                phone: '+7 (812) 595-42-48',
                distanceToMetro: 10,
                wheelchairAccessible: true,
                hasElevator: true,
                hasAudioGuide: true,
                hasSignLanguageSupport: false,
                accessibilityNotes: 'Доступны лифты и подъемники',
                categoryId: createdCategories[1].id,
                metroStationId: createdStations[1].id,
                createdBy: admin.id,
            },
            {
                name: 'Медный всадник',
                slug: 'bronze-horseman',
                shortDescription:
                    'Знаменитый памятник Петру I на Сенатской площади, созданный Э.-М. Фальконе в 1768-1782 годах',
                fullDescription:
                    'Медный всадник — памятник Петру I на Сенатской площади в Санкт-Петербурге. Создан французским скульптором Этьеном Морисом Фальконе в 1768—1782 годах. Название «Медный всадник» закрепилось за памятником благодаря одноимённой поэме А. С. Пушкина (1833). Монумент был открыт 7 августа (18 августа по новому стилю) 1782 года.\n\nМедный всадник изображает Петра I, поднявшего коня на дыбы на краю скалы. Идея постамента в виде скалы принадлежала Фальконе, который хотел создать эффект рвущегося вперёд всадника. Скала-постамент («Гром-камень»), весившая около 1600 тонн, была доставлена с берегов Финского залива в центр Петербурга. Её перевозка стала уникальной инженерной операцией того времени.',
                address: 'Сенатская пл.',
                workingHours: 'Круглосуточно',
                ticketPrice: 'Бесплатно',
                website: null,
                phone: null,
                distanceToMetro: 5,
                wheelchairAccessible: true,
                hasElevator: false,
                hasAudioGuide: false,
                hasSignLanguageSupport: false,
                accessibilityNotes: 'Площадь доступна для колясок',
                categoryId: createdCategories[5].id,
                metroStationId: createdStations[2].id,
                createdBy: admin.id,
            },
            {
                name: 'Кунсткамера',
                slug: 'kunstkamera',
                shortDescription: 'Первый музей России, основанный Петром I в 1714 году',
                fullDescription:
                    'Кунсткамера (Музей антропологии и этнографии имени Петра Великого Российской академии наук) — первый музей России, учреждённый императором Петром I и находящийся в Санкт-Петербурге. Основан в 1714 году. Изначально музей назывался Кабинет редкостей или Кунсткамера (нем. Kunstkammer — кабинет редкостей, музей).\n\nЗдание Кунсткамеры с башней и куполом является одним из самых узнаваемых архитектурных символов города. В настоящее время в музее хранится более 1,2 миллиона экспонатов, отражающих разнообразие культур народов Старого и Нового Света. Музей имеет отдел анатомических редкостей, основанный Петром I, который собирал анатомические аномалии и «монстров».',
                address: 'Университетская наб., 3',
                workingHours: 'Вт-Вс: 11:00-18:00, Пн - выходной',
                ticketPrice: 'от 300₽, льготный 100₽',
                website: 'https://kunstkamera.ru/',
                phone: '+7 (812) 328-14-12',
                distanceToMetro: 8,
                wheelchairAccessible: false,
                hasElevator: true,
                hasAudioGuide: true,
                hasSignLanguageSupport: false,
                accessibilityNotes: 'Лифт для маломобильных посетителей',
                categoryId: createdCategories[0].id,
                metroStationId: createdStations[5].id,
                createdBy: admin.id,
            },
            {
                name: 'Александровская колонна',
                slug: 'alexander-column',
                shortDescription: 'Памятник в центре Дворцовой площади, посвящённый победе России в войне с Наполеоном',
                fullDescription:
                    'Александровская колонна (также Александрийский столп) — памятник, находящийся в центре Дворцовой площади Санкт-Петербурга. Воздвигнут в 1834 году по указу императора Николая I в память о победе его старшего брата императора Александра I над Наполеоном.\n\nКолонна высотой 47,5 метров изготовлена из цельного гранитного монолита и является самым высоким в мире памятником такого рода. Она стоит на постаменте под собственным весом без дополнительных креплений. Колонну венчает фигура ангела, держащего крест. Ангел работы скульптора Б. И. Орловского имеет портретное сходство с императором Александром I.',
                address: 'Дворцовая площадь',
                workingHours: 'Круглосуточно',
                ticketPrice: 'Бесплатно',
                website: null,
                phone: null,
                distanceToMetro: 3,
                wheelchairAccessible: true,
                hasElevator: false,
                hasAudioGuide: false,
                hasSignLanguageSupport: false,
                accessibilityNotes: 'Площадь полностью доступна для колясок',
                categoryId: createdCategories[5].id,
                metroStationId: createdStations[0].id,
                createdBy: admin.id,
            },
            {
                name: 'Петергоф',
                slug: 'peterhof',
                shortDescription: 'Дворцово-парковый ансамбль на южном берегу Финского залива с фонтанами и садами',
                fullDescription:
                    'Петергоф (Петродворец) — дворцово-парковый ансамбль на южном берегу Финского залива, основанный Петром I в 1710 году как императорская загородная резиденция. Ансамбль включает в себя Большой Петергофский дворец, Нижний парк с Большим каскадом и многочисленными фонтанами, Верхний сад, а также парки Александрию, Колонистский и Луговой парк с другими дворцами и павильонами.\n\nПетергоф известен как «столица фонтанов» — всего на территории парков находится 147 действующих фонтанов. Наиболее известный из них — «Самсон, раздирающий пасть льва», символизирующий победу России над Швецией в Северной войне. Уникальность петергофских фонтанов в том, что они работают без насосов, по принципу сообщающихся сосудов.',
                address: 'г. Петергоф, Разводная ул., 2',
                workingHours: 'Парк: 09:00-20:00, Дворцы: 10:30-18:00, Пн - выходной',
                ticketPrice: 'Парк: от 450₽, Дворцы: от 500₽',
                website: 'https://peterhofmuseum.ru/',
                phone: '+7 (812) 450-52-87',
                distanceToMetro: null,
                wheelchairAccessible: true,
                hasElevator: true,
                hasAudioGuide: true,
                hasSignLanguageSupport: false,
                accessibilityNotes: 'Парк частично доступен для колясок, во дворце есть лифты',
                categoryId: createdCategories[1].id,
                metroStationId: null,
                createdBy: admin.id,
            },
        ];

        const createdAttractions = [];
        for (const attractionData of attractions) {
            const attraction = await Attraction.create(attractionData);
            createdAttractions.push(attraction);
        }

        console.log('Достопримечательности созданы');

        // 5. Создаем изображения
        console.log('Создаем записи изображений...');

        // Даты для организации изображений по папкам
        const dates = ['2025-01-15', '2025-02-20', '2025-03-10', '2025-04-05', '2025-05-01'];

        // Функция для генерации случайного имени файла
        const generateRandomFilename = (extension = '.jpg') => {
            const timestamp = Date.now();
            const random = Math.round(Math.random() * 1e9);
            return `image-${timestamp}-${random}${extension}`;
        };

        // Создаем по несколько изображений для каждой достопримечательности
        for (const attraction of createdAttractions) {
            // Случайное количество изображений (от 3 до 5)
            const imageCount = Math.floor(Math.random() * 3) + 3;

            // Выбираем случайную дату из массива
            const randomDate = dates[Math.floor(Math.random() * dates.length)];

            for (let i = 0; i < imageCount; i++) {
                const filename = generateRandomFilename();
                const originalName = `attraction_${attraction.id}_photo_${i + 1}.jpg`;
                const size = Math.floor(Math.random() * 3000000) + 500000; // От 500KB до 3.5MB

                await Image.create({
                    filename,
                    originalName,
                    // Путь в формате /uploads/YYYY-MM-DD/filename.jpg
                    path: `/uploads/${randomDate}/${filename}`,
                    size,
                    mimeType: 'image/jpeg',
                    altText: `${attraction.name} - изображение ${i + 1}`,
                    isPrimary: i === 0, // Первое изображение будет главным
                    attractionId: attraction.id,
                });
            }
        }

        console.log('Записи изображений созданы');

        // Проверяем результат
        const totalAttractions = await Attraction.count();
        const totalCategories = await Category.count();
        const totalUsers = await User.count();
        const totalImages = await Image.count();

        console.log('\nБаза данных успешно заполнена!');
        console.log(`Статистика:`);
        console.log(`   Пользователей: ${totalUsers}`);
        console.log(`   Категорий: ${totalCategories}`);
        console.log(`   Достопримечательностей: ${totalAttractions}`);
        console.log(`   Станций метро: ${createdStations.length}`);
        console.log(`   Изображений: ${totalImages}`);

        console.log('\nДанные для входа:');
        console.log('   Администратор: admin@spb-attractions.ru / admin123');
        console.log('   Пользователь: user@example.com / user123');
    } catch (error) {
        console.error('Ошибка при заполнении базы данных:', error);
        console.error('Детали ошибки:', error.message);

        // Не показываем весь stack trace, но даем полезную информацию
        if (error.name === 'SequelizeDatabaseError') {
            console.log('\nВозможные решения:');
            console.log('1. Проверьте настройки подключения к PostgreSQL');
            console.log('2. Убедитесь, что база данных создана');
            console.log('3. Проверьте права доступа пользователя к базе данных');
        }
    } finally {
        // Закрываем соединение с базой данных
        await sequelize.close();
        console.log('\nСоединение с базой данных закрыто');
        process.exit(0);
    }
}

// Запускаем скрипт, если файл вызван напрямую
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase };
