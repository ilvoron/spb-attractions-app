const User = require('./User');
const Category = require('./Category');
const MetroStation = require('./MetroStation');
const Attraction = require('./Attraction');
const Image = require('./Image');

// Связь Пользователь -> Достопримечательности (один ко многим)
// Один пользователь может создать много достопримечательностей
User.hasMany(Attraction, {
    foreignKey: 'createdBy',
    as: 'createdAttractions',
});

Attraction.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator',
});

// Связь Категория -> Достопримечательности (один ко многим)
// Одна категория может содержать много достопримечательностей
Category.hasMany(Attraction, {
    foreignKey: 'categoryId',
    as: 'attractions',
});

Attraction.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category',
});

// Связь Станция метро -> Достопримечательности (один ко многим)
// Рядом с одной станцией метро может быть много достопримечательностей
MetroStation.hasMany(Attraction, {
    foreignKey: 'metroStationId',
    as: 'nearbyAttractions',
});

Attraction.belongsTo(MetroStation, {
    foreignKey: 'metroStationId',
    as: 'metroStation',
});

// Связь Достопримечательность -> Изображения (один ко многим)
// У одной достопримечательности может быть много фотографий
Attraction.hasMany(Image, {
    foreignKey: 'attractionId',
    as: 'images',
});

Image.belongsTo(Attraction, {
    foreignKey: 'attractionId',
    as: 'attraction',
});

module.exports = {
    User,
    Category,
    MetroStation,
    Attraction,
    Image,
};
