// const Sequelize = require('sequelize');

// Define a "User" model

module.exports = function(sequelize) {

const User = sequelize.define('User', {
    userId: {
        type: Sequelize.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING, 
    address: Sequelize.STRING,
    email: Sequelize.STRING,
    phone: Sequelize.STRING
});
    return User
}
