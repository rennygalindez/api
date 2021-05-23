require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

const {
  DB_USER, DB_PASSWORD, DB_HOST, DB_NAME,
} = process.env;

const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`, {
  logging: false, // set to console.log to see the raw SQL queries
  native: false, // lets Sequelize know we can use pg-native for ~30% more speed
});
const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models,
// los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    // eslint-disable-next-line import/no-dynamic-require
    modelDefiners.push(require(path.join(__dirname, '/models', file)));// eslint-disable-line global-require
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach((model) => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
const entries = Object.entries(sequelize.models);
const capsEntries = entries.map((entry) => (
  [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]));
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring

const {
  User, Post, Image, VisitDate, Comment, ServicePlans, Order,
} = sequelize.models;

// Aca vendrian las relaciones
User.hasMany(Post);
Post.belongsTo(User);

Post.hasMany(Image);
Image.belongsTo(Post);

Post.hasMany(VisitDate);
VisitDate.belongsTo(Post);
User.hasMany(VisitDate);
VisitDate.belongsTo(User);

Comment.belongsTo(User);
User.hasMany(Comment);

Comment.belongsTo(Post);
Post.hasMany(Comment);

ServicePlans.hasMany(Order);
Order.belongsTo(ServicePlans);

User.hasMany(Order);
Order.belongsTo(User);

Post.hasMany(Order);
Order.belongsTo(Post);

module.exports = {
  ...sequelize.models,
  conn: sequelize,
};
